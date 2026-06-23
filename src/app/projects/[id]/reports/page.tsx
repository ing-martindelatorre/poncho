import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { PrintButton } from "@/components/print-button";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { sumMoney } from "@/lib/reporting";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  params: Promise<{ id: string }>;
};

async function getProject(id: string) {
  return prisma.project.findUnique({
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
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  const honorariosRate = Number(process.env.HONORARIOS_RATE ?? 0.1);
  const rows = project.periods.map((period) => {
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

    return {
      cash,
      debt: total - payments,
      honorarios,
      invoiced,
      label: period.label,
      payments,
      period,
      total,
    };
  });

  const totals = rows.reduce(
    (sum, row) => ({
      cash: sum.cash + row.cash,
      debt: sum.debt + row.debt,
      honorarios: sum.honorarios + row.honorarios,
      invoiced: sum.invoiced + row.invoiced,
      payments: sum.payments + row.payments,
      total: sum.total + row.total,
    }),
    { cash: 0, debt: 0, honorarios: 0, invoiced: 0, payments: 0, total: 0 },
  );
  const costPerM2 = project.builtAreaM2
    ? totals.total / Number(project.builtAreaM2)
    : null;

  return (
    <AppFrame active="projects">
      <header className="topbar">
        <div>
          <p className="eyebrow">Reporte de obra</p>
          <h1>{project.name}</h1>
        </div>
        <div className="row-actions">
          <a className="button ghost no-print" href={`/projects/${project.id}`}>
            Volver a obra
          </a>
          <a className="button ghost no-print" href={`/projects/${project.id}/reports/export`}>
            Exportar CSV
          </a>
          <PrintButton />
        </div>
      </header>

      <section className="report-cover panel">
        <div>
          <p className="eyebrow">Relacion de obra</p>
          <h2>{project.name}</h2>
          <p>{project.address ?? "Sin direccion"}</p>
          <p>Cliente: {project.clientName ?? "Sin cliente"}</p>
        </div>
        <div>
          <p className="eyebrow">Superficie</p>
          <strong>{project.builtAreaM2 ? `${formatNumber(project.builtAreaM2)} m2` : "-"}</strong>
        </div>
      </section>

      <section className="metrics section-gap">
        <article className="metric-card">
          <small>Efectivo</small>
          <strong className="metric-text">{formatCurrency(totals.cash)}</strong>
        </article>
        <article className="metric-card">
          <small>Facturado</small>
          <strong className="metric-text">{formatCurrency(totals.invoiced)}</strong>
        </article>
        <article className="metric-card">
          <small>Honorarios</small>
          <strong className="metric-text">{formatCurrency(totals.honorarios)}</strong>
        </article>
        <article className="metric-card">
          <small>Total</small>
          <strong className="metric-text">{formatCurrency(totals.total)}</strong>
        </article>
        <article className="metric-card">
          <small>Costo m2</small>
          <strong className="metric-text">{costPerM2 ? formatCurrency(costPerM2) : "-"}</strong>
        </article>
      </section>

      <section className="panel section-gap">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Acumulado</p>
            <h2>Totales por semana</h2>
          </div>
          <span className="badge">Deuda {formatCurrency(totals.debt)}</span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Semana</th>
                <th>Periodo</th>
                <th>Efectivo</th>
                <th>Facturado</th>
                <th>Honorarios</th>
                <th>Total</th>
                <th>Pagos</th>
                <th>Deuda</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.period.id}>
                  <td>
                    <strong>Semana {row.period.weekNumber}</strong>
                    <small>{row.label}</small>
                  </td>
                  <td>
                    {formatDate(row.period.startDate)} - {formatDate(row.period.endDate)}
                  </td>
                  <td>{formatCurrency(row.cash)}</td>
                  <td>{formatCurrency(row.invoiced)}</td>
                  <td>{formatCurrency(row.honorarios)}</td>
                  <td>{formatCurrency(row.total)}</td>
                  <td>{formatCurrency(row.payments)}</td>
                  <td>{formatCurrency(row.debt)}</td>
                </tr>
              ))}

              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">Aun no hay semanas para reportar.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppFrame>
  );
}
