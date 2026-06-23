import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type MaterialsPageProps = {
  searchParams: Promise<{ project?: string }>;
};

const moneyLabels: Record<string, string> = {
  CASH: "Efectivo",
  INVOICED: "Facturado",
};

const statusLabels: Record<string, string> = {
  DELIVERED: "Entregado",
  ORDERED: "Ordenado",
  PARTIAL: "Parcial",
};

async function getProjects() {
  return prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getMaterials(projectId: string) {
  return prisma.materialPurchase.findMany({
    include: {
      supplier: true,
      weeklyPeriod: true,
      deliveries: { orderBy: { deliveryDate: "desc" } },
    },
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const params = await searchParams;
  const projects = await getProjects();
  const selectedId = params.project ?? "";
  const materials = selectedId ? await getMaterials(selectedId) : [];
  const selectedProject = projects.find((p) => p.id === selectedId);

  const totalCash = materials
    .filter((m) => m.moneyKind === "CASH")
    .reduce((s, m) => s + Number(m.total ?? 0), 0);
  const totalInvoiced = materials
    .filter((m) => m.moneyKind === "INVOICED")
    .reduce((s, m) => s + Number(m.total ?? 0), 0);
  const totalPaid = materials.reduce((s, m) => s + Number(m.paidAmount ?? 0), 0);

  return (
    <AppFrame active="materials">
      <header className="topbar">
        <div>
          <p className="eyebrow">Materiales</p>
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
              href={`/materials?project=${p.id}`}
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

      {selectedProject ? (
        <section className="metrics" style={{ marginBottom: 18 }}>
          <article className="metric-card">
            <small>Total efectivo</small>
            <strong className="metric-text">{formatCurrency(totalCash)}</strong>
          </article>
          <article className="metric-card">
            <small>Total facturado</small>
            <strong className="metric-text">{formatCurrency(totalInvoiced)}</strong>
          </article>
          <article className="metric-card">
            <small>Total pagado</small>
            <strong className="metric-text">{formatCurrency(totalPaid)}</strong>
          </article>
          <article className="metric-card">
            <small>Saldo pendiente</small>
            <strong className="metric-text">
              {formatCurrency(totalCash + totalInvoiced - totalPaid)}
            </strong>
          </article>
          <article className="metric-card">
            <small>Compras</small>
            <strong>{materials.length}</strong>
          </article>
        </section>
      ) : null}

      {selectedProject ? (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Compras</p>
              <h2>{materials.length} registros de material</h2>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Descripcion</th>
                  <th>Semana</th>
                  <th>Proveedor</th>
                  <th>Folio</th>
                  <th>Total</th>
                  <th>Pagado</th>
                  <th>Estado</th>
                  <th>Tipo</th>
                  <th>Entregas</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.description}</strong>
                      {m.notes ? <small>{m.notes}</small> : null}
                    </td>
                    <td>
                      {m.weeklyPeriod ? (
                        <>
                          <strong>Sem {m.weeklyPeriod.weekNumber}</strong>
                          <small>{formatDate(m.weeklyPeriod.startDate)}</small>
                        </>
                      ) : "-"}
                    </td>
                    <td>{m.supplier?.name ?? "-"}</td>
                    <td>{m.invoiceNumber ?? "-"}</td>
                    <td>{formatCurrency(m.total)}</td>
                    <td>{formatCurrency(m.paidAmount)}</td>
                    <td>
                      <span className="badge">{statusLabels[m.status] ?? m.status}</span>
                    </td>
                    <td>
                      <span className="badge">{moneyLabels[m.moneyKind] ?? m.moneyKind}</span>
                    </td>
                    <td>{m.deliveries.length}</td>
                  </tr>
                ))}

                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">No hay materiales registrados.</div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </AppFrame>
  );
}
