import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string; periodId: string }>;
};

function currency(n: number) {
  return Number(n.toFixed(2));
}

export async function GET(_: Request, { params }: RouteProps) {
  const { id: projectId, periodId } = await params;

  const period = await prisma.weeklyPeriod.findFirst({
    include: {
      laborPayments: true,
      materialPurchases: { include: { supplier: true } },
      payments: true,
      project: true,
      workItems: true,
    },
    where: { id: periodId, projectId },
  });

  if (!period) {
    return NextResponse.json({ error: "Semana no encontrada" }, { status: 404 });
  }

  const honorariosRate = Number(process.env.HONORARIOS_RATE ?? 0.1);
  const workTotal = period.workItems.reduce((s, i) => s + Number(i.total), 0);
  const laborTotal = period.laborPayments.reduce((s, i) => s + Number(i.total), 0);
  const materialTotal = period.materialPurchases.reduce((s, i) => s + Number(i.total), 0);
  const subtotal = workTotal + laborTotal + materialTotal;
  const honorarios = subtotal * honorariosRate;
  const total = subtotal + honorarios;
  const payments = period.payments.reduce((s, p) => s + Number(p.amount), 0);

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Resumen ─────────────────────────────────────────────────────
  const wsResumen = XLSX.utils.aoa_to_sheet([
    [`Obra: ${period.project.name}`],
    [`Cliente: ${period.project.clientName ?? ""}`],
    [`Semana ${period.weekNumber} — ${period.label}`],
    [`Periodo: ${period.startDate.toISOString().slice(0, 10)} al ${period.endDate.toISOString().slice(0, 10)}`],
    [],
    ["Concepto", "Monto"],
    ["Destajos", currency(workTotal)],
    ["Materiales", currency(materialTotal)],
    ["Nomina", currency(laborTotal)],
    ["Subtotal", currency(subtotal)],
    [`Honorarios (${(honorariosRate * 100).toFixed(0)}%)`, currency(honorarios)],
    ["Total semana", currency(total)],
    ["Abonos", currency(payments)],
    ["Saldo deudor", currency(total - payments)],
  ]);
  wsResumen["!cols"] = [{ wch: 28 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  // ── Sheet 2: Destajos ────────────────────────────────────────────────────
  const workRows: unknown[][] = [
    ["Categoria", "Descripcion", "Unidad", "Volumen", "Precio unitario", "Total", "Tipo"],
    ...period.workItems.map((i) => [
      i.category, i.description, i.unit,
      currency(Number(i.volume)), currency(Number(i.unitPrice)), currency(Number(i.total)),
      i.moneyKind === "CASH" ? "Efectivo" : "Facturado",
    ]),
  ];
  const wsDestajos = XLSX.utils.aoa_to_sheet(workRows);
  wsDestajos["!cols"] = [14, 30, 8, 10, 14, 12, 10].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsDestajos, "Destajos");

  // ── Sheet 3: Materiales ──────────────────────────────────────────────────
  const matRows: unknown[][] = [
    ["Descripcion", "Proveedor", "Folio", "Total", "Pagado", "Tipo"],
    ...period.materialPurchases.map((m) => [
      m.description, m.supplier?.name ?? "", m.invoiceNumber ?? "",
      currency(Number(m.total)), currency(Number(m.paidAmount)),
      m.moneyKind === "CASH" ? "Efectivo" : "Facturado",
    ]),
  ];
  const wsMateriales = XLSX.utils.aoa_to_sheet(matRows);
  wsMateriales["!cols"] = [30, 20, 12, 12, 12, 10].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsMateriales, "Materiales");

  // ── Sheet 4: Nomina ──────────────────────────────────────────────────────
  const laborRows: unknown[][] = [
    ["Trabajador", "Rol", "Dias", "Horas", "Tarifa", "Total", "Tipo"],
    ...period.laborPayments.map((lp) => [
      lp.workerName, lp.role ?? "",
      lp.days ? currency(Number(lp.days)) : "",
      lp.hours ? currency(Number(lp.hours)) : "",
      currency(Number(lp.rate)), currency(Number(lp.total)),
      lp.moneyKind === "CASH" ? "Efectivo" : "Facturado",
    ]),
  ];
  const wsNomina = XLSX.utils.aoa_to_sheet(laborRows);
  wsNomina["!cols"] = [20, 14, 8, 8, 12, 12, 10].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsNomina, "Nomina");

  // ── Sheet 5: Abonos ──────────────────────────────────────────────────────
  const payRows: unknown[][] = [
    ["Descripcion", "Fecha", "Metodo", "Monto", "Tipo"],
    ...period.payments.map((p) => [
      p.description,
      p.paidAt.toISOString().slice(0, 10),
      p.method,
      currency(Number(p.amount)),
      p.moneyKind === "CASH" ? "Efectivo" : "Facturado",
    ]),
  ];
  const wsAbonos = XLSX.utils.aoa_to_sheet(payRows);
  wsAbonos["!cols"] = [30, 12, 14, 12, 10].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsAbonos, "Abonos");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const slug = `${period.project.name}_semana${period.weekNumber}`.toLowerCase().replace(/[^a-z0-9]+/gi, "_");

  return new Response(buffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${slug}.xlsx"`,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
