import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type PhotosPageProps = {
  searchParams: Promise<{ project?: string }>;
};

async function getProjects() {
  return prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getPhotosByWeek(projectId: string) {
  return prisma.weeklyPeriod.findMany({
    include: {
      photos: { orderBy: { createdAt: "desc" } },
    },
    where: {
      projectId,
      photos: { some: {} },
    },
    orderBy: { startDate: "desc" },
  });
}

async function getProjectPhotoCount(projectId: string) {
  return prisma.photo.count({ where: { projectId } });
}

export default async function PhotosPage({ searchParams }: PhotosPageProps) {
  const params = await searchParams;
  const projects = await getProjects();
  const selectedId = params.project ?? "";
  const selectedProject = projects.find((p) => p.id === selectedId);
  const weeksWithPhotos = selectedId ? await getPhotosByWeek(selectedId) : [];
  const totalPhotos = selectedId ? await getProjectPhotoCount(selectedId) : 0;

  return (
    <AppFrame active="photos">
      <header className="topbar">
        <div>
          <p className="eyebrow">Fotos de avance</p>
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
              href={`/photos?project=${p.id}`}
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
            <small>Total fotos</small>
            <strong>{totalPhotos}</strong>
          </article>
          <article className="metric-card">
            <small>Semanas con fotos</small>
            <strong>{weeksWithPhotos.length}</strong>
          </article>
        </section>
      ) : null}

      {selectedProject && weeksWithPhotos.length === 0 ? (
        <section className="panel">
          <div className="empty-state">
            No hay fotos para esta obra. Sube fotos desde la vista de cada semana.
          </div>
        </section>
      ) : null}

      {weeksWithPhotos.map((week) => (
        <section className="panel section-gap" key={week.id}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">
                Semana {week.weekNumber}
              </p>
              <h2>{week.label}</h2>
              <small style={{ color: "var(--muted)" }}>
                {formatDate(week.startDate)} - {formatDate(week.endDate)}
              </small>
            </div>
            <div className="row-actions">
              <span className="badge">{week.photos.length} fotos</span>
              <a
                className="button ghost"
                href={`/projects/${selectedId}/weeks/${week.id}`}
              >
                Ir a semana
              </a>
            </div>
          </div>

          <div className="photo-grid">
            {week.photos.map((photo) => (
              <article className="photo-card" key={photo.id}>
                <img
                  alt={photo.caption ?? photo.fileName}
                  src={`/api/photos/${photo.id}`}
                />
                <div>
                  <strong>{photo.caption ?? "Sin comentario"}</strong>
                  <small>{photo.fileName}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </AppFrame>
  );
}
