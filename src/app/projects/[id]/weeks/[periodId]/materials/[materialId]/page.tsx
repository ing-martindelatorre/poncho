import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { MaterialForm } from "../material-form";
import { deleteMaterialDelivery } from "./deliveries/actions";
import { DeliveryForm } from "./deliveries/delivery-form";

export const dynamic = "force-dynamic";

type MaterialPageProps = {
  params: Promise<{ id: string; materialId: string; periodId: string }>;
};

async function getMaterial(weeklyPeriodId: string, id: string) {
  return prisma.materialPurchase.findFirst({
    include: {
      deliveries: {
        orderBy: { deliveryDate: "desc" },
      },
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

  const deliveredQuantity = purchase.deliveries.reduce(
    (total, delivery) => total + Number(delivery.quantity ?? 0),
    0,
  );
  const pendingQuantity =
    purchase.quantity === null ? null : Number(purchase.quantity) - deliveredQuantity;
  const balance = Number(purchase.total ?? 0) - Number(purchase.paidAmount ?? 0);

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
            <div>
              <dt>Saldo pago</dt>
              <dd>{formatCurrency(balance)}</dd>
            </div>
            <div>
              <dt>Cantidad pendiente</dt>
              <dd>
                {pendingQuantity === null
                  ? "Sin cantidad base"
                  : `${formatNumber(pendingQuantity)} ${purchase.unit ?? ""}`}
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="panel section-gap">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Entregas</p>
            <h2>Material recibido</h2>
          </div>
          <span className="badge">
            {formatNumber(deliveredQuantity)} {purchase.unit ?? ""}
          </span>
        </div>

        <div className="inline-create">
          <DeliveryForm
            materialPurchaseId={purchase.id}
            projectId={projectId}
            weeklyPeriodId={periodId}
          />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cantidad</th>
                <th>Notas</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {purchase.deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>{formatDate(delivery.deliveryDate)}</td>
                  <td>
                    {delivery.quantity ? formatNumber(delivery.quantity) : "-"}{" "}
                    {purchase.unit ?? ""}
                  </td>
                  <td>{delivery.notes ?? "-"}</td>
                  <td>
                    <form action={deleteMaterialDelivery}>
                      <input name="projectId" type="hidden" value={projectId} />
                      <input name="weeklyPeriodId" type="hidden" value={periodId} />
                      <input name="materialPurchaseId" type="hidden" value={purchase.id} />
                      <input name="id" type="hidden" value={delivery.id} />
                      <button className="button danger" type="submit">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {purchase.deliveries.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">Aun no hay entregas registradas.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppFrame>
  );
}
