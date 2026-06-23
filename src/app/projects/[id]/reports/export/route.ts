import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sumMoney, toCsv } from "@/lib/reporting";

export const dynamic = "force-dynamic";

type ExportRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: ExportRouteProps) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    include: {
      periods: {
        include: {
          laborPayments: true,
          materialPurchases: true,
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
  const rows: unknown[][] = [
    ["Obra", project.name],
    ["Direccion", project.address ?? ""],
    ["Cliente", project.clientName ?? ""],
    [],
    [
      "Semana",
      "Periodo",
      "Fecha inicial",
      "Fecha final",
      "Efectivo",
      "Facturado",
      "Honorarios",
      "Total",
      "Pagos",
      "Deuda",
    ],
  ];

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
    const payments = period.payments.reduce(
      (sum, payment) => sum + Number(payment.amount ?? 0),
      0,
    );

    rows.push([
      period.weekNumber,
      period.label,
      period.startDate.toISOString().slice(0, 10),
      period.endDate.toISOString().slice(0, 10),
      cash.toFixed(2),
      invoiced.toFixed(2),
      honorarios.toFixed(2),
      total.toFixed(2),
      payments.toFixed(2),
      (total - payments).toFixed(2),
    ]);
  }

  const csv = `\uFEFF${toCsv(rows)}\n`;
  const fileName = `${project.name.toLowerCase().replace(/[^a-z0-9]+/gi, "_")}_reporte.csv`;

  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
