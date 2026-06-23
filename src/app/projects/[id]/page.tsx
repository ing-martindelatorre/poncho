import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ConfirmDelete } from "@/components/confirm-delete";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { deleteProject } from "../actions";
import { ProjectForm } from "../project-form";
import { WeekForm } from "./weeks/week-form";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabels = {
  ACTIVE: "Activa",
  FINISHED: "Terminada",
  PAUSED: "Pausada",
  PLANNED: "Planeada",
};

async function getProject(id: string) {
  return prisma.project.findUnique({
    include: {
      periods: {
        include: {
          _count: {
            select: {
              laborPayments: true,
              materialPurchases: true,
              photos: true,
              workItems: true,
            },
          },
          laborPayments: { select: { total: true } },
          materialPurchases: { select: { total: true } },
          workItems: { select: { total: true } },
        },
        orderBy: { startDate: "desc" },
      },
      _count: {
        select: {
          materialPurchases: true,
          periods: true,
          photos: true,
        },
      },
    },
    where: { id },
  });
}

function sumTotals(items: Array<{ total: unknown }>) {
  return items.reduce((total, item) => total + Number(item.total ?? 0), 0);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  const projectTotal = project.periods.reduce((total, period) => {
    return (
      total +
      sumTotals(period.workItems) +
      sumTotals(period.laborPayments) +
      sumTotals(period.materialPurchases)
    );
  }, 0);
  const nextWeekNumber =
    project.periods.reduce((highest, period) => Math.max(highest, period.weekNumber), 0) + 1;

  return (
    <AppFrame active="projects">
      <header className="topbar">
        <div>
          <p className="eyebrow">Obra</p>
          <h1>{project.name}</h1>
        </div>
        <a className="button ghost" href="/projects">
          Volver a obras
        </a>
        <a className="button primary" href={`/projects/${project.id}/reports`}>
          Reporte
        </a>
      </header>

      <section className="metrics">
        <article className="metric-card">
          <small>Estado</small>
          <strong className="metric-text">
            {statusLabels[project.status] ?? project.status}
          </strong>
        </article>
        <article className="metric-card">
          <small>Semanas</small>
          <strong>{project._count.periods}</strong>
        </article>
        <article className="metric-card">
          <small>m2</small>
          <strong className="metric-text">
            {project.builtAreaM2 ? formatNumber(project.builtAreaM2) : "-"}
          </strong>
        </article>
        <article className="metric-card">
          <small>Total capturado</small>
          <strong className="metric-text">{formatCurrency(projectTotal)}</strong>
        </article>
        <article className="metric-card">
          <small>Fotos</small>
          <strong>{project._count.photos}</strong>
        </article>
      </section>

      <section className="split-layout">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Editar</p>
              <h2>Datos de obra</h2>
            </div>
          </div>
          <ProjectForm project={project} />
        </div>

        <aside className="panel side-panel">
          <p className="eyebrow">Resumen</p>
          <h2>Ficha rapida</h2>
          <dl className="details-list">
            <div>
              <dt>Cliente</dt>
              <dd>{project.clientName ?? "Sin cliente"}</dd>
            </div>
            <div>
              <dt>Direccion</dt>
              <dd>{project.address ?? "Sin direccion"}</dd>
            </div>
            <div>
              <dt>Inicio</dt>
              <dd>{formatDate(project.startDate)}</dd>
            </div>
            <div>
              <dt>Notas</dt>
              <dd>{project.notes ?? "Sin notas"}</dd>
            </div>
          </dl>

          <ConfirmDelete action={deleteProject} message="Eliminar esta obra borrara todas sus semanas, destajos, materiales y fotos. Continuar?">
            <input name="id" type="hidden" value={project.id} />
            <div className="danger-zone">
              <button className="button danger" type="submit">
                Eliminar obra
              </button>
            </div>
          </ConfirmDelete>
        </aside>
      </section>

      <section className="panel section-gap">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Cortes</p>
            <h2>Semanas registradas</h2>
          </div>
          <span className="badge">Modulo Semanas</span>
        </div>

        <div className="inline-create">
          <div>
            <p className="eyebrow">Nueva semana</p>
            <h3>Crear corte semanal</h3>
          </div>
          <WeekForm projectId={project.id} suggestedWeekNumber={nextWeekNumber} />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Semana</th>
                <th>Periodo</th>
                <th>Destajos</th>
                <th>Materiales</th>
                <th>Nomina</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {project.periods.map((period) => {
                const total =
                  sumTotals(period.workItems) +
                  sumTotals(period.laborPayments) +
                  sumTotals(period.materialPurchases);

                return (
                  <tr key={period.id}>
                    <td>
                      <strong>Semana {period.weekNumber}</strong>
                      <small>{period.label}</small>
                    </td>
                    <td>
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </td>
                    <td>{period._count.workItems}</td>
                    <td>{period._count.materialPurchases}</td>
                    <td>{period._count.laborPayments}</td>
                    <td>{formatCurrency(total)}</td>
                    <td>
                      <a
                        className="button ghost"
                        href={`/projects/${project.id}/weeks/${period.id}`}
                      >
                        Abrir
                      </a>
                    </td>
                  </tr>
                );
              })}

              {project.periods.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">Aun no hay semanas para esta obra.</div>
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
