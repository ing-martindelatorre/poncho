import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type DashboardStats = {
  databaseOnline: boolean;
  projects: number;
  periods: number;
  workItems: number;
  materialPurchases: number;
  photos: number;
};

const modules = [
  {
    name: "Obras",
    phase: "Fase 2",
    status: "Modelo listo",
    detail: "Datos base de obra, direccion, cliente, m2 y estado.",
  },
  {
    name: "Semanas",
    phase: "Fase 3",
    status: "Modelo listo",
    detail: "Cortes semanales abiertos o cerrados por obra.",
  },
  {
    name: "Destajos",
    phase: "Fase 3",
    status: "Modelo listo",
    detail: "Conceptos con unidad, volumen, precio unitario y total.",
  },
  {
    name: "Materiales",
    phase: "Fase 3",
    status: "Modelo listo",
    detail: "Efectivo, facturado, prepagos, entregas y proveedores.",
  },
  {
    name: "Fotos",
    phase: "Fase 4",
    status: "Preparado",
    detail: "Evidencia ligada a obra, semana, pago, material o destajo.",
  },
  {
    name: "Reportes",
    phase: "Fase 5",
    status: "Pendiente",
    detail: "Caratulas, acumulados, deuda, honorarios y costo por m2.",
  },
];

async function getStats(): Promise<DashboardStats> {
  try {
    const [projects, periods, workItems, materialPurchases, photos] =
      await prisma.$transaction([
        prisma.project.count(),
        prisma.weeklyPeriod.count(),
        prisma.workItem.count(),
        prisma.materialPurchase.count(),
        prisma.photo.count(),
      ]);

    return {
      databaseOnline: true,
      projects,
      periods,
      workItems,
      materialPurchases,
      photos,
    };
  } catch {
    return {
      databaseOnline: false,
      projects: 0,
      periods: 0,
      workItems: 0,
      materialPurchases: 0,
      photos: 0,
    };
  }
}

export default async function Home() {
  const stats = await getStats();
  const metricCards = [
    { label: "Obras", value: stats.projects },
    { label: "Semanas", value: stats.periods },
    { label: "Destajos", value: stats.workItems },
    { label: "Materiales", value: stats.materialPurchases },
    { label: "Fotos", value: stats.photos },
  ];

  return (
    <AppFrame active="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">Fase 1</p>
            <h1>Base desplegable</h1>
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
              <strong>{metric.value}</strong>
            </article>
          ))}
        </section>

        <section className="workbench">
          <div className="panel main-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Plan de construccion</p>
                <h2>Modulos del MVP</h2>
              </div>
            </div>

            <div className="module-grid">
              {modules.map((module) => (
                <article className="module-card" key={module.name}>
                  <div className="module-card-header">
                    <span>{module.phase}</span>
                    <strong>{module.status}</strong>
                  </div>
                  <h3>{module.name}</h3>
                  <p>{module.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="panel side-panel">
            <p className="eyebrow">Siguiente entrega</p>
            <h2>Captura inicial</h2>
            <ul className="next-list">
              <li>CRUD de obras.</li>
              <li>CRUD de semanas por obra.</li>
              <li>Formulario de destajos.</li>
              <li>Resumen semanal calculado.</li>
            </ul>
          </aside>
        </section>
    </AppFrame>
  );
}
