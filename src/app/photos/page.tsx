import { AppFrame } from "@/components/app-frame";
import { ConfirmDelete } from "@/components/confirm-delete";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { createPhoto, deletePhoto } from "../projects/[id]/weeks/[periodId]/photos/actions";

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

async function getOpenWeeks(projectId: string) {
  return prisma.weeklyPeriod.findMany({
    select: { id: true, weekNumber: true, label: true, status: true },
    where: { projectId },
    orderBy: { startDate: "desc" },
  });
}

async function getWeeksWithPhotos(projectId: string) {
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
  const allWeeks = selectedId ? await getOpenWeeks(selectedId) : [];
  const weeksWithPhotos = selectedId ? await getWeeksWithPhotos(selectedId) : [];
  const totalPhotos = selectedId ? await getProjectPhotoCount(selectedId) : 0;
  const openWeeks = allWeeks.filter((w) => w.status === "OPEN");

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

      {selectedProject && openWeeks.length > 0 ? (
        <section className="panel" style={{ marginBottom: 18 }}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Subir evidencia</p>
              <h2>Nueva foto</h2>
            </div>
          </div>
          <form action={createPhoto} className="form-grid">
            <input name="projectId" type="hidden" value={selectedId} />
            <label className="field">
              <span>Semana</span>
              <select name="weeklyPeriodId" required>
                {openWeeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    Semana {w.weekNumber} — {w.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Foto</span>
              <input accept="image/*" name="photo" required type="file" />
            </label>
            <label className="field span-2">
              <span>Comentario</span>
              <input name="caption" placeholder="Descripcion de la foto" type="text" />
            </label>
            <div className="form-actions span-2">
              <button className="button primary" type="submit">
                Subir foto
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {selectedProject && openWeeks.length === 0 && allWeeks.length > 0 ? (
        <section className="locked-banner">
          Todas las semanas estan cerradas. Abre una semana para subir fotos.
        </section>
      ) : null}

      {selectedProject && weeksWithPhotos.length === 0 ? (
        <section className="panel">
          <div className="empty-state">
            No hay fotos para esta obra.
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
            <span className="badge">{week.photos.length} fotos</span>
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
                {week.status === "OPEN" ? (
                  <ConfirmDelete action={deletePhoto}>
                    <input name="projectId" type="hidden" value={selectedId} />
                    <input name="weeklyPeriodId" type="hidden" value={week.id} />
                    <input name="id" type="hidden" value={photo.id} />
                    <button className="button danger" type="submit">
                      Eliminar
                    </button>
                  </ConfirmDelete>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </AppFrame>
  );
}
