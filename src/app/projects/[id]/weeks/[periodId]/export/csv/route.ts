import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCsv } from "@/lib/reporting";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string; periodId: string }>;
};

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

  const rows: unknown[][] = [
    [`Obra: ${period.project.name}`],
    [`Semana ${period.weekNumber} — ${period.label}`],
    [],
    ["DESTAJOS"],
    ["Categoria", "Descripcion", "Unidad", "Volumen", "Precio unit.", "Total", "Tipo"],
    ...period.workItems.map((i) => [
      i.category, i.description, i.unit,
      Number(i.volume).toFixed(3), Number(i.unitPrice).toFixed(2), Number(i.total).toFixed(2),
      i.moneyKind === "CASH" ? "Efectivo" : "Facturado",
    ]),
    [],
    ["MATERIALES"],
    ["Descripcion", "Proveedor", "Folio", "Total", "Pagado", "Tipo"],
    ...period.materialPurchases.map((m) => [
      m.description, m.supplier?.name ?? "", m.invoiceNumber ?? "",
      Number(m.total).toFixed(2), Number(m.paidAmount).toFixed(2),
      m.moneyKind === "CASH" ? "Efectivo" : "Facturado",
    ]),
    [],
    ["NOMINA"],
    ["Trabajador", "Rol", "Dias", "Horas", "Tarifa", "Total", "Tipo"],
    ...period.laborPayments.map((lp) => [
      lp.workerName, lp.role ?? "",
      lp.days ? Number(lp.days).toFixed(2) : "",
      lp.hours ? Number(lp.hours).toFixed(2) : "",
      Number(lp.rate).toFixed(2), Number(lp.total).toFixed(2),
      lp.moneyKind === "CASH" ? "Efectivo" : "Facturado",
    ]),
    [],
    ["ABONOS"],
    ["Descripcion", "Fecha", "Metodo", "Monto"],
    ...period.payments.map((p) => [
      p.description, p.paidAt.toISOString().slice(0, 10), p.method,
      Number(p.amount).toFixed(2),
    ]),
  ];

  const csv = `﻿${toCsv(rows)}\n`;
  const slug = `${period.project.name}_semana${period.weekNumber}`.toLowerCase().replace(/[^a-z0-9]+/gi, "_");

  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${slug}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
