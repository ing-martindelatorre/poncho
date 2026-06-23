import { createMaterialDelivery } from "./actions";

type DeliveryFormProps = {
  materialPurchaseId: string;
  projectId: string;
  weeklyPeriodId: string;
};

export function DeliveryForm({
  materialPurchaseId,
  projectId,
  weeklyPeriodId,
}: DeliveryFormProps) {
  return (
    <form action={createMaterialDelivery} className="form-grid">
      <input name="projectId" type="hidden" value={projectId} />
      <input name="weeklyPeriodId" type="hidden" value={weeklyPeriodId} />
      <input name="materialPurchaseId" type="hidden" value={materialPurchaseId} />

      <label className="field">
        <span>Fecha</span>
        <input name="deliveryDate" required type="date" />
      </label>

      <label className="field">
        <span>Cantidad entregada</span>
        <input min="0" name="quantity" step="0.001" type="number" />
      </label>

      <label className="field span-2">
        <span>Notas</span>
        <input name="notes" placeholder="Remision, detalle o comentario" />
      </label>

      <div className="form-actions span-2">
        <button className="button primary" type="submit">
          Registrar entrega
        </button>
      </div>
    </form>
  );
}
