import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sumMoney } from "@/lib/reporting";

export const dynamic = "force-dynamic";

type ExportRouteProps = {
  params: Promise<{ id: string }>;
};

function currency(n: number) {
  return Number(n.toFixed(2));
}

export async function GET(_: Request, { params }: ExportRouteProps) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    include: {
      periods: {
        include: {
          laborPayments: true,
          materialPurchases: { include: { supplier: true } },
          payments: true,
          workItems: true,
        },
        orderBy: { startDate: "asc" },
      },
    },
    where: { id },
  });

  if (!project) {
    return NextResponse.json({ error: "Obra no encontrada" }, { status: 404 });
  }

  const honorariosRate = Number(process.env.HONORARIOS_RATE ?? 0.1);
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Resumen por semana ──────────────────────────────────────────
  const summaryRows: unknown[][] = [
    [`Obra: ${project.name}`],
    [`Direccion: ${project.address ?? ""}`],
    [`Cliente: ${project.clientName ?? ""}`],
    [],
    ["Semana", "Periodo", "Fecha inicio", "Fecha fin", "Efectivo", "Facturado", "Honorarios", "Total", "Abonos", "Deuda"],
  ];

  let grandCash = 0, grandInvoiced = 0, grandHonorarios = 0, grandTotal = 0, grandPayments = 0;

  for (const period of project.periods) {
    const cash =
      sumMoney(period.workItems, "CASH") +
      sumMoney(period.laborPayments, "CASH") +
      sumMoney(period.materialPurchases, "CASH");
    const invoiced =
      sumMoney(period.workItems, "INVOICED") +
      sumMoney(period.laborPayments, "INVOICED") +
      sumMoney(period.materialPurchases, "INVOICED");
    const subtotal = cash + invoiced;
    const honorarios = subtotal * honorariosRate;
    const total = subtotal + honorarios;
    const payments = period.payments.reduce((s, p) => s + Number(p.amount ?? 0), 0);

    grandCash += cash; grandInvoiced += invoiced; grandHonorarios += honorarios;
    grandTotal += total; grandPayments += payments;

    summaryRows.push([
      `Semana ${period.weekNumber}`,
      period.label,
      period.startDate.toISOString().slice(0, 10),
      period.endDate.toISOString().slice(0, 10),
      currency(cash),
      currency(invoiced),
      currency(honorarios),
      currency(total),
      currency(payments),
      currency(total - payments),
    ]);
  }

  summaryRows.push([]);
  summaryRows.push([
    "TOTAL", "", "", "",
    currency(grandCash), currency(grandInvoiced), currency(grandHonorarios),
    currency(grandTotal), currency(grandPayments), currency(grandTotal - grandPayments),
  ]);

  const wsResumen = XLSX.utils.aoa_to_sheet(summaryRows);
  wsResumen["!cols"] = [14, 20, 12, 12, 12, 12, 12, 12, 12, 12].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  // ── Sheet 2: Destajos ────────────────────────────────────────────────────
  const workRows: unknown[][] = [
    ["Semana", "Periodo", "Categoria", "Descripcion", "Unidad", "Volumen", "Precio unit.", "Total", "Tipo"],
  ];
  for (const period of project.periods) {
    for (const item of period.workItems) {
      workRows.push([
        `Semana ${period.weekNumber}`,
        period.label,
        item.category,
        item.description,
        item.unit,
        currency(Number(item.volume)),
        currency(Number(item.unitPrice)),
        currency(Number(item.total)),
        item.moneyKind === "CASH" ? "Efectivo" : "Facturado",
      ]);
    }
  }
  const wsDestajos = XLSX.utils.aoa_to_sheet(workRows);
  wsDestajos["!cols"] = [14, 20, 14, 30, 8, 10, 12, 12, 10].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsDestajos, "Destajos");

  // ── Sheet 3: Materiales ──────────────────────────────────────────────────
  const matRows: unknown[][] = [
    ["Semana", "Periodo", "Descripcion", "Proveedor", "Folio", "Total", "Pagado", "Tipo"],
  ];
  for (const period of project.periods) {
    for (const m of period.materialPurchases) {
      matRows.push([
        `Semana ${period.weekNumber}`,
        period.label,
        m.description,
        m.supplier?.name ?? "",
        m.invoiceNumber ?? "",
        currency(Number(m.total)),
        currency(Number(m.paidAmount)),
        m.moneyKind === "CASH" ? "Efectivo" : "Facturado",
      ]);
    }
  }
  const wsMateriales = XLSX.utils.aoa_to_sheet(matRows);
  wsMateriales["!cols"] = [14, 20, 30, 20, 12, 12, 12, 10].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsMateriales, "Materiales");

  // ── Sheet 4: Nomina ──────────────────────────────────────────────────────
  const laborRows: unknown[][] = [
    ["Semana", "Periodo", "Trabajador", "Rol", "Dias", "Horas", "Tarifa", "Total", "Tipo"],
  ];
  for (const period of project.periods) {
    for (const lp of period.laborPayments) {
      laborRows.push([
        `Semana ${period.weekNumber}`,
        period.label,
        lp.workerName,
        lp.role ?? "",
        lp.days ? currency(Number(lp.days)) : "",
        lp.hours ? currency(Number(lp.hours)) : "",
        currency(Number(lp.rate)),
        currency(Number(lp.total)),
        lp.moneyKind === "CASH" ? "Efectivo" : "Facturado",
      ]);
    }
  }
  const wsNomina = XLSX.utils.aoa_to_sheet(laborRows);
  wsNomina["!cols"] = [14, 20, 20, 14, 8, 8, 12, 12, 10].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, wsNomina, "Nomina");

  // ── Respuesta ────────────────────────────────────────────────────────────
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const fileName = `${project.name.toLowerCase().replace(/[^a-z0-9]+/gi, "_")}_reporte.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
