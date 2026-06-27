import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

type WeeksPageProps = {
  searchParams: Promise<{ project?: string }>;
};

const moneyLabels: Record<string, string> = {
  CASH: "Efectivo",
  INVOICED: "Facturado",
};

const purchaseStatusLabels: Record<string, string> = {
  DELIVERED: "Entregado",
  ORDERED: "Ordenado",
  PARTIAL: "Parcial",
};

async function getProjects() {
  return prisma.project.findMany({
    select: { id: true, name: true, status: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getWeeks(projectId: string) {
  return prisma.weeklyPeriod.findMany({
    include: {
      workItems: { orderBy: { createdAt: "asc" } },
      laborPayments: { orderBy: { createdAt: "asc" } },
      materialPurchases: {
        include: { supplier: true },
        orderBy: { createdAt: "asc" },
      },
      payments: { orderBy: { paidAt: "desc" } },
      photos: { orderBy: { createdAt: "desc" } },
      project: true,
    },
    where: { projectId },
    orderBy: { startDate: "desc" },
  });
}

function sumTotals(items: Array<{ total: unknown }>) {
  return items.reduce((s, i) => s + Number(i.total ?? 0), 0);
}

export default async function WeeksPage({ searchParams }: WeeksPageProps) {
  const params = await searchParams;
  const projects = await getProjects();
  const selectedId = params.project ?? "";
  const weeks = selectedId ? await getWeeks(selectedId) : [];
  const selectedProject = projects.find((p) => p.id === selectedId);

  return (
    <AppFrame active="weeks">
      <header className="topbar">
        <div>
          <p className="eyebrow">Semanas</p>
          <h1>{selectedProject ? selectedProject.name : "Selecciona una obra"}</h1>
        </div>
      </header>

      <section className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">Obra</p>
            <h2>Seleccionar proyecto</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {projects.map((p) => (
            <a
              className={p.id === selectedId ? "button primary" : "button ghost"}
              href={`/weeks?project=${p.id}`}
              key={p.id}
            >
              {p.name}
            </a>
          ))}
          {projects.length === 0 ? (
            <div className="empty-state">No hay obras registradas.</div>
          ) : null}
        </div>
      </section>

      {selectedProject && weeks.length === 0 ? (
        <div className="empty-state">No hay semanas para esta obra.</div>
      ) : null}

      {weeks.map((week) => {
        const honorariosRate = Number(process.env.HONORARIOS_RATE ?? 0.1);
        const workTotal = sumTotals(week.workItems);
        const laborTotal = sumTotals(week.laborPayments);
        const materialTotal = sumTotals(week.materialPurchases);
        const paymentTotal = week.payments.reduce(
          (s, p) => s + Number(p.amount ?? 0), 0,
        );
        const subtotal = workTotal + laborTotal + materialTotal;
        const honorarios = subtotal * honorariosRate;
        const weekTotal = subtotal + honorarios;

        return (
          <section className="panel section-gap" key={week.id}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">
                  Semana {week.weekNumber} — {week.status === "OPEN" ? "Abierta" : "Cerrada"}
                </p>
                <h2>{week.label}</h2>
                <small style={{ color: "var(--muted)" }}>
                  {formatDate(week.startDate)} - {formatDate(week.endDate)}
                </small>
              </div>
              <div className="row-actions">
                <span className="badge">{formatCurrency(weekTotal)}</span>
                <a
                  className="button ghost"
                  href={`/projects/${selectedId}/weeks/${week.id}`}
                >
                  Editar
                </a>
              </div>
            </div>

            <div className="metrics" style={{ marginBottom: 14 }}>
              <article className="metric-card">
                <small>Destajos</small>
                <strong className="metric-text">{formatCurrency(workTotal)}</strong>
              </article>
              <article className="metric-card">
                <small>Nomina</small>
                <strong className="metric-text">{formatCurrency(laborTotal)}</strong>
              </article>
              <article className="metric-card">
                <small>Materiales</small>
                <strong className="metric-text">{formatCurrency(materialTotal)}</strong>
              </article>
              <article className="metric-card">
                <small>Honorarios</small>
                <strong className="metric-text">{formatCurrency(honorarios)}</strong>
              </article>
              <article className="metric-card">
                <small>Abonos</small>
                <strong className="metric-text">{formatCurrency(paymentTotal)}</strong>
              </article>
              <article className="metric-card">
                <small>Deuda</small>
                <strong className="metric-text">{formatCurrency(weekTotal - paymentTotal)}</strong>
              </article>
              <article className="metric-card">
                <small>Fotos</small>
                <strong>{week.photos.length}</strong>
              </article>
            </div>

            {week.workItems.length > 0 ? (
              <details style={{ marginBottom: 10 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, marginBottom: 8 }}>
                  Destajos ({week.workItems.length})
                </summary>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Descripcion</th>
                        <th>Categoria</th>
                        <th>Unidad</th>
                        <th>Volumen</th>
                        <th>Precio</th>
                        <th>Total</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {week.workItems.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.description}</strong></td>
                          <td>{item.category}</td>
                          <td>{item.unit}</td>
                          <td>{formatNumber(item.volume)}</td>
                          <td>{formatCurrency(item.unitPrice)}</td>
                          <td>{formatCurrency(item.total)}</td>
                          <td><span className="badge">{moneyLabels[item.moneyKind] ?? item.moneyKind}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null}

            {week.laborPayments.length > 0 ? (
              <details style={{ marginBottom: 10 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, marginBottom: 8 }}>
                  Nomina ({week.laborPayments.length})
                </summary>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Trabajador</th>
                        <th>Rol</th>
                        <th>Tarifa</th>
                        <th>Total</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {week.laborPayments.map((lp) => (
                        <tr key={lp.id}>
                          <td><strong>{lp.workerName}</strong></td>
                          <td>{lp.role ?? "-"}</td>
                          <td>{formatCurrency(lp.rate)}</td>
                          <td>{formatCurrency(lp.total)}</td>
                          <td><span className="badge">{moneyLabels[lp.moneyKind] ?? lp.moneyKind}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null}

            {week.materialPurchases.length > 0 ? (
              <details style={{ marginBottom: 10 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, marginBottom: 8 }}>
                  Materiales ({week.materialPurchases.length})
                </summary>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Descripcion</th>
                        <th>Proveedor</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {week.materialPurchases.map((mp) => (
                        <tr key={mp.id}>
                          <td><strong>{mp.description}</strong></td>
                          <td>{mp.supplier?.name ?? "-"}</td>
                          <td>{formatCurrency(mp.total)}</td>
                          <td><span className="badge">{purchaseStatusLabels[mp.status] ?? mp.status}</span></td>
                          <td><span className="badge">{moneyLabels[mp.moneyKind] ?? mp.moneyKind}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null}

            {week.photos.length > 0 ? (
              <details style={{ marginBottom: 10 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, marginBottom: 8 }}>
                  Fotos ({week.photos.length})
                </summary>
                <div className="photo-grid">
                  {week.photos.map((photo) => (
                    <article className="photo-card" key={photo.id}>
                      <img alt={photo.caption ?? photo.fileName} src={`/api/photos/${photo.id}`} />
                      <div>
                        <strong>{photo.caption ?? "Sin comentario"}</strong>
                        <small>{photo.fileName}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </details>
            ) : null}
          </section>
        );
      })}
    </AppFrame>
  );
}
