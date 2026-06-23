import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type DashboardStats = {
  databaseOnline: boolean;
  debt: number;
  laborTotal: number;
  materialTotal: number;
  openPeriods: number;
  paymentsTotal: number;
  projects: number;
  periods: number;
  total: number;
  workTotal: number;
  workItems: number;
  materialPurchases: number;
  photos: number;
};

async function getStats(): Promise<DashboardStats> {
  try {
    const [
      projects,
      periods,
      openPeriods,
      workItems,
      materialPurchases,
      photos,
      workAggregate,
      laborAggregate,
      materialAggregate,
      paymentAggregate,
    ] =
      await prisma.$transaction([
        prisma.project.count(),
        prisma.weeklyPeriod.count(),
        prisma.weeklyPeriod.count({ where: { status: "OPEN" } }),
        prisma.workItem.count(),
        prisma.materialPurchase.count(),
        prisma.photo.count(),
        prisma.workItem.aggregate({ _sum: { total: true } }),
        prisma.laborPayment.aggregate({ _sum: { total: true } }),
        prisma.materialPurchase.aggregate({ _sum: { total: true } }),
        prisma.payment.aggregate({ _sum: { amount: true } }),
      ]);
    const workTotal = Number(workAggregate._sum.total ?? 0);
    const laborTotal = Number(laborAggregate._sum.total ?? 0);
    const materialTotal = Number(materialAggregate._sum.total ?? 0);
    const paymentsTotal = Number(paymentAggregate._sum.amount ?? 0);
    const total = workTotal + laborTotal + materialTotal;

    return {
      databaseOnline: true,
      debt: total - paymentsTotal,
      laborTotal,
      materialTotal,
      openPeriods,
      paymentsTotal,
      projects,
      periods,
      total,
      workTotal,
      workItems,
      materialPurchases,
      photos,
    };
  } catch {
    return {
      databaseOnline: false,
      debt: 0,
      laborTotal: 0,
      materialTotal: 0,
      openPeriods: 0,
      paymentsTotal: 0,
      projects: 0,
      periods: 0,
      total: 0,
      workTotal: 0,
      workItems: 0,
      materialPurchases: 0,
      photos: 0,
    };
  }
}

export default async function Home() {
  const stats = await getStats();
  const recentProjects = stats.databaseOnline
    ? await prisma.project.findMany({
        include: {
          periods: {
            orderBy: { startDate: "desc" },
            take: 1,
          },
          _count: {
            select: {
              periods: true,
              photos: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
      })
    : [];
  const metricCards = [
    { label: "Obras", value: stats.projects },
    { label: "Semanas abiertas", value: stats.openPeriods },
    { label: "Total capturado", value: stats.total, money: true },
    { label: "Pagos", value: stats.paymentsTotal, money: true },
    { label: "Deuda estimada", value: stats.debt, money: true },
  ];

  return (
    <AppFrame active="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operacion</p>
            <h1>Dashboard</h1>
          </div>
          <div
            className={stats.databaseOnline ? "status online" : "status offline"}
            title="Estado de conexion a PostgreSQL"
          >
            <span />
            {stats.databaseOnline ? "PostgreSQL online" : "PostgreSQL offline"}
          </div>
        </header>

        <section className="metrics" aria-label="Metricas principales">
          {metricCards.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <small>{metric.label}</small>
              <strong className={metric.money ? "metric-text" : undefined}>
                {metric.money
                  ? new Intl.NumberFormat("es-MX", {
                      currency: "MXN",
                      maximumFractionDigits: 2,
                      style: "currency",
                    }).format(metric.value)
                  : metric.value}
              </strong>
            </article>
          ))}
        </section>

        <section className="workbench">
          <div className="panel main-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Obras recientes</p>
                <h2>Accesos rapidos</h2>
              </div>
              <a className="button primary" href="/projects">
                Nueva obra
              </a>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Obra</th>
                    <th>Estado</th>
                    <th>Semanas</th>
                    <th>Ultimo corte</th>
                    <th>Fotos</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <strong>{project.name}</strong>
                        <small>{project.address ?? "Sin direccion"}</small>
                      </td>
                      <td>
                        <span className="badge">{project.status}</span>
                      </td>
                      <td>{project._count.periods}</td>
                      <td>{project.periods[0]?.label ?? "Sin cortes"}</td>
                      <td>{project._count.photos}</td>
                      <td>
                        <a className="button ghost" href={`/projects/${project.id}`}>
                          Abrir
                        </a>
                      </td>
                    </tr>
                  ))}

                  {recentProjects.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">Aun no hay obras registradas.</div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="panel side-panel">
            <p className="eyebrow">Distribucion</p>
            <h2>Captura actual</h2>
            <ul className="next-list">
              <li>Destajos: {stats.workItems} registros.</li>
              <li>Materiales: {stats.materialPurchases} registros.</li>
              <li>Fotos: {stats.photos} evidencias.</li>
              <li>Semanas totales: {stats.periods} cortes.</li>
            </ul>
          </aside>
        </section>
    </AppFrame>
  );
}
