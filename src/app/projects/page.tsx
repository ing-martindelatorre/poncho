import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/format";
import { ProjectForm } from "./project-form";

export const dynamic = "force-dynamic";

const statusLabels = {
  ACTIVE: "Activa",
  FINISHED: "Terminada",
  PAUSED: "Pausada",
  PLANNED: "Planeada",
};

async function getProjects() {
  return prisma.project.findMany({
    include: {
      _count: {
        select: {
          materialPurchases: true,
          periods: true,
          photos: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof getProjects>> = [];
  let databaseOnline = true;

  try {
    projects = await getProjects();
  } catch {
    databaseOnline = false;
  }

  return (
    <AppFrame active="projects">
      <header className="topbar">
        <div>
          <p className="eyebrow">Fase 2</p>
          <h1>Obras</h1>
        </div>
        <div className={databaseOnline ? "status online" : "status offline"}>
          <span />
          {databaseOnline ? "Base conectada" : "Base sin conexion"}
        </div>
      </header>

      <section className="split-layout">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Nueva obra</p>
              <h2>Datos generales</h2>
            </div>
          </div>
          <ProjectForm />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Cartera</p>
              <h2>{projects.length} obras registradas</h2>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Obra</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>m2</th>
                  <th>Semanas</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <strong>{project.name}</strong>
                      <small>{project.address ?? "Sin direccion"}</small>
                    </td>
                    <td>
                      <span className="badge">
                        {statusLabels[project.status] ?? project.status}
                      </span>
                    </td>
                    <td>{formatDate(project.startDate)}</td>
                    <td>{project.builtAreaM2 ? formatNumber(project.builtAreaM2) : "-"}</td>
                    <td>{project._count.periods}</td>
                    <td>
                      <a className="button ghost" href={`/projects/${project.id}`}>
                        Abrir
                      </a>
                    </td>
                  </tr>
                ))}

                {projects.length === 0 ? (
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
      </section>
    </AppFrame>
  );
}
