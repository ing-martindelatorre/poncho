import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { LaborForm } from "../labor-form";

export const dynamic = "force-dynamic";

type LaborPageProps = {
  params: Promise<{ id: string; laborId: string; periodId: string }>;
};

async function getLaborPayment(weeklyPeriodId: string, id: string) {
  return prisma.laborPayment.findFirst({
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

export default async function LaborPage({ params }: LaborPageProps) {
  const { id: projectId, laborId, periodId } = await params;
  const payment = await getLaborPayment(periodId, laborId);

  if (!payment) {
    notFound();
  }

  return (
    <AppFrame active="weeks">
      <header className="topbar">
        <div>
          <p className="eyebrow">
            {payment.weeklyPeriod.project.name} / Semana {payment.weeklyPeriod.weekNumber}
          </p>
          <h1>Editar nomina</h1>
        </div>
        <a className="button ghost" href={`/projects/${projectId}/weeks/${periodId}`}>
          Volver a semana
        </a>
      </header>

      <section className="split-layout">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Pago</p>
              <h2>{payment.workerName}</h2>
            </div>
          </div>
          <LaborForm payment={payment} projectId={projectId} weeklyPeriodId={periodId} />
        </div>

        <aside className="panel side-panel">
          <p className="eyebrow">Total</p>
          <h2>{formatCurrency(payment.total)}</h2>
          <dl className="details-list">
            <div>
              <dt>Rol</dt>
              <dd>{payment.role ?? "Sin rol"}</dd>
            </div>
            <div>
              <dt>Notas</dt>
              <dd>{payment.notes ?? "Sin notas"}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </AppFrame>
  );
}
