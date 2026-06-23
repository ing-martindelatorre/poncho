import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { WorkItemForm } from "../work-item-form";

export const dynamic = "force-dynamic";

type WorkItemPageProps = {
  params: Promise<{ id: string; periodId: string; workItemId: string }>;
};

async function getWorkItem(weeklyPeriodId: string, id: string) {
  return prisma.workItem.findFirst({
    include: {
      weeklyPeriod: {
        include: {
          project: true,
        },
      },
    },
    where: { id, weeklyPeriodId },
  });
}

export default async function WorkItemPage({ params }: WorkItemPageProps) {
  const { id: projectId, periodId, workItemId } = await params;
  const item = await getWorkItem(periodId, workItemId);

  if (!item) {
    notFound();
  }

  return (
    <AppFrame active="weeks">
      <header className="topbar">
        <div>
          <p className="eyebrow">
            {item.weeklyPeriod.project.name} / Semana {item.weeklyPeriod.weekNumber}
          </p>
          <h1>Editar destajo</h1>
        </div>
        <a className="button ghost" href={`/projects/${projectId}/weeks/${periodId}`}>
          Volver a semana
        </a>
      </header>

      <section className="split-layout">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Concepto</p>
              <h2>{item.description}</h2>
            </div>
          </div>
          <WorkItemForm item={item} projectId={projectId} weeklyPeriodId={periodId} />
        </div>

        <aside className="panel side-panel">
          <p className="eyebrow">Total</p>
          <h2>{formatCurrency(item.total)}</h2>
          <dl className="details-list">
            <div>
              <dt>Categoria</dt>
              <dd>{item.category}</dd>
            </div>
            <div>
              <dt>Unidad</dt>
              <dd>{item.unit}</dd>
            </div>
            <div>
              <dt>Notas</dt>
              <dd>{item.notes ?? "Sin notas"}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </AppFrame>
  );
}
