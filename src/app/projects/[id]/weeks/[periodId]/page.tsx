import { PeriodStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteWeeklyPeriod, toggleWeeklyPeriodStatus } from "../actions";
import { WeekForm } from "../week-form";

export const dynamic = "force-dynamic";

type WeekPageProps = {
  params: Promise<{ id: string; periodId: string }>;
};

async function getPeriod(projectId: string, id: string) {
  return prisma.weeklyPeriod.findFirst({
    include: {
      laborPayments: true,
      materialPurchases: true,
      payments: true,
      photos: true,
      project: true,
      workItems: true,
    },
    where: { id, projectId },
  });
}

function sumTotals(items: Array<{ total: unknown }>) {
  return items.reduce((total, item) => total + Number(item.total ?? 0), 0);
}

export default async function WeekPage({ params }: WeekPageProps) {
  const { id: projectId, periodId } = await params;
  const period = await getPeriod(projectId, periodId);

  if (!period) {
    notFound();
  }

  const workTotal = sumTotals(period.workItems);
  const laborTotal = sumTotals(period.laborPayments);
  const materialTotal = sumTotals(period.materialPurchases);
  const paymentTotal = period.payments.reduce(
    (total, payment) => total + Number(payment.amount ?? 0),
    0,
  );
  const total = workTotal + laborTotal + materialTotal;

  return (
    <AppFrame active="weeks">
      <header className="topbar">
        <div>
          <p className="eyebrow">{period.project.name}</p>
          <h1>Semana {period.weekNumber}</h1>
        </div>
        <a className="button ghost" href={`/projects/${projectId}`}>
          Volver a obra
        </a>
      </header>

      <section className="metrics">
        <article className="metric-card">
          <small>Estado</small>
          <strong className="metric-text">
            {period.status === PeriodStatus.OPEN ? "Abierta" : "Cerrada"}
          </strong>
        </article>
        <article className="metric-card">
          <small>Destajos</small>
          <strong>{period.workItems.length}</strong>
        </article>
        <article className="metric-card">
          <small>Materiales</small>
          <strong>{period.materialPurchases.length}</strong>
        </article>
        <article className="metric-card">
          <small>Total semanal</small>
          <strong className="metric-text">{formatCurrency(total)}</strong>
        </article>
        <article className="metric-card">
          <small>Abonos</small>
          <strong className="metric-text">{formatCurrency(paymentTotal)}</strong>
        </article>
      </section>

      <section className="split-layout">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Editar corte</p>
              <h2>{period.label}</h2>
            </div>
          </div>
          <WeekForm period={period} projectId={projectId} />
        </div>

        <aside className="panel side-panel">
          <p className="eyebrow">Resumen</p>
          <h2>Periodo</h2>
          <dl className="details-list">
            <div>
              <dt>Rango</dt>
              <dd>
                {formatDate(period.startDate)} - {formatDate(period.endDate)}
              </dd>
            </div>
            <div>
              <dt>Notas</dt>
              <dd>{period.notes ?? "Sin notas"}</dd>
            </div>
          </dl>

          <form action={toggleWeeklyPeriodStatus} className="stacked-actions">
            <input name="projectId" type="hidden" value={projectId} />
            <input name="id" type="hidden" value={period.id} />
            <input name="status" type="hidden" value={period.status} />
            <button className="button ghost" type="submit">
              {period.status === PeriodStatus.OPEN ? "Cerrar semana" : "Reabrir semana"}
            </button>
          </form>

          <form action={deleteWeeklyPeriod} className="danger-zone">
            <input name="projectId" type="hidden" value={projectId} />
            <input name="id" type="hidden" value={period.id} />
            <button className="button danger" type="submit">
              Eliminar semana
            </button>
          </form>
        </aside>
      </section>

      <section className="module-grid section-gap">
        <article className="module-card">
          <div className="module-card-header">
            <span>Fase 4</span>
            <strong>{period.workItems.length}</strong>
          </div>
          <h3>Destajos</h3>
          <p>Total actual: {formatCurrency(workTotal)}</p>
        </article>
        <article className="module-card">
          <div className="module-card-header">
            <span>Fase 5</span>
            <strong>{period.materialPurchases.length}</strong>
          </div>
          <h3>Materiales</h3>
          <p>Total actual: {formatCurrency(materialTotal)}</p>
        </article>
        <article className="module-card">
          <div className="module-card-header">
            <span>Fase 6</span>
            <strong>{period.laborPayments.length}</strong>
          </div>
          <h3>Nomina</h3>
          <p>Total actual: {formatCurrency(laborTotal)}</p>
        </article>
        <article className="module-card">
          <div className="module-card-header">
            <span>Fase 7</span>
            <strong>{period.photos.length}</strong>
          </div>
          <h3>Fotos</h3>
          <p>Evidencia asociada al corte semanal.</p>
        </article>
      </section>
    </AppFrame>
  );
}
