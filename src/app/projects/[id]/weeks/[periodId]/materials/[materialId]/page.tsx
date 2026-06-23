import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { MaterialForm } from "../material-form";

export const dynamic = "force-dynamic";

type MaterialPageProps = {
  params: Promise<{ id: string; materialId: string; periodId: string }>;
};

async function getMaterial(weeklyPeriodId: string, id: string) {
  return prisma.materialPurchase.findFirst({
    include: {
      supplier: true,
      weeklyPeriod: {
        include: {
          project: true,
        },
      },
    },
    where: { id, weeklyPeriodId },
  });
}

export default async function MaterialPage({ params }: MaterialPageProps) {
  const { id: projectId, materialId, periodId } = await params;
  const purchase = await getMaterial(periodId, materialId);

  if (!purchase) {
    notFound();
  }

  return (
    <AppFrame active="materials">
      <header className="topbar">
        <div>
          <p className="eyebrow">
            {purchase.weeklyPeriod?.project.name} / Semana {purchase.weeklyPeriod?.weekNumber}
          </p>
          <h1>Editar material</h1>
        </div>
        <a className="button ghost" href={`/projects/${projectId}/weeks/${periodId}`}>
          Volver a semana
        </a>
      </header>

      <section className="split-layout">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Compra</p>
              <h2>{purchase.description}</h2>
            </div>
          </div>
          <MaterialForm
            projectId={projectId}
            purchase={purchase}
            weeklyPeriodId={periodId}
          />
        </div>

        <aside className="panel side-panel">
          <p className="eyebrow">Total</p>
          <h2>{formatCurrency(purchase.total)}</h2>
          <dl className="details-list">
            <div>
              <dt>Proveedor</dt>
              <dd>{purchase.supplier?.name ?? "Sin proveedor"}</dd>
            </div>
            <div>
              <dt>Factura / remision</dt>
              <dd>{purchase.invoiceNumber ?? "Sin folio"}</dd>
            </div>
            <div>
              <dt>Notas</dt>
              <dd>{purchase.notes ?? "Sin notas"}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </AppFrame>
  );
}
