import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { PaymentForm } from "../payment-form";

export const dynamic = "force-dynamic";

type PaymentPageProps = {
  params: Promise<{ id: string; paymentId: string; periodId: string }>;
};

async function getPayment(weeklyPeriodId: string, id: string) {
  return prisma.payment.findFirst({
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

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id: projectId, paymentId, periodId } = await params;
  const payment = await getPayment(periodId, paymentId);

  if (!payment) {
    notFound();
  }

  return (
    <AppFrame active="weeks">
      <header className="topbar">
        <div>
          <p className="eyebrow">
            {payment.weeklyPeriod?.project.name} / Semana {payment.weeklyPeriod?.weekNumber}
          </p>
          <h1>Editar pago</h1>
        </div>
        <a className="button ghost" href={`/projects/${projectId}/weeks/${periodId}`}>
          Volver a semana
        </a>
      </header>

      <section className="split-layout">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Abono</p>
              <h2>{payment.description}</h2>
            </div>
          </div>
          <PaymentForm payment={payment} projectId={projectId} weeklyPeriodId={periodId} />
        </div>

        <aside className="panel side-panel">
          <p className="eyebrow">Monto</p>
          <h2>{formatCurrency(payment.amount)}</h2>
          <dl className="details-list">
            <div>
              <dt>Fecha</dt>
              <dd>{formatDate(payment.paidAt)}</dd>
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
