import { MoneyKind, PurchaseStatus } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import { toNumberInputValue } from "@/lib/format";
import { createMaterialPurchase, updateMaterialPurchase } from "./actions";

type MaterialFormPurchase = {
  id: string;
  description: string;
  invoiceNumber: string | null;
  moneyKind: MoneyKind;
  notes: string | null;
  paidAmount: Decimal;
  quantity: Decimal | null;
  status: PurchaseStatus;
  supplier: { name: string } | null;
  total: Decimal;
  unit: string | null;
  unitPrice: Decimal | null;
};

type MaterialFormProps = {
  projectId: string;
  purchase?: MaterialFormPurchase;
  weeklyPeriodId: string;
};

const moneyKinds = [
  { label: "Efectivo", value: MoneyKind.CASH },
  { label: "Facturado", value: MoneyKind.INVOICED },
];

const statuses = [
  { label: "Ordenado", value: PurchaseStatus.ORDERED },
  { label: "Parcial", value: PurchaseStatus.PARTIAL },
  { label: "Entregado", value: PurchaseStatus.DELIVERED },
];

export function MaterialForm({ projectId, purchase, weeklyPeriodId }: MaterialFormProps) {
  const isEditing = Boolean(purchase);

  return (
    <form
      action={isEditing ? updateMaterialPurchase : createMaterialPurchase}
      className="form-grid"
    >
      <input name="projectId" type="hidden" value={projectId} />
      <input name="weeklyPeriodId" type="hidden" value={weeklyPeriodId} />
      {purchase ? <input name="id" type="hidden" value={purchase.id} /> : null}

      <label className="field">
        <span>Proveedor</span>
        <input
          name="supplierName"
          placeholder="El Gallo"
          type="text"
          defaultValue={purchase?.supplier?.name ?? ""}
        />
      </label>

      <label className="field">
        <span>Tipo</span>
        <select name="moneyKind" defaultValue={purchase?.moneyKind ?? MoneyKind.CASH}>
          {moneyKinds.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field span-2">
        <span>Descripcion</span>
        <input
          name="description"
          placeholder="Cemento, acero, arena, factura o remision"
          required
          type="text"
          defaultValue={purchase?.description ?? ""}
        />
      </label>

      <label className="field">
        <span>Factura / remision</span>
        <input
          name="invoiceNumber"
          placeholder="F.24518"
          type="text"
          defaultValue={purchase?.invoiceNumber ?? ""}
        />
      </label>

      <label className="field">
        <span>Estado</span>
        <select name="status" defaultValue={purchase?.status ?? PurchaseStatus.ORDERED}>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Cantidad</span>
        <input
          min="0"
          name="quantity"
          step="0.001"
          type="number"
          defaultValue={toNumberInputValue(purchase?.quantity)}
        />
      </label>

      <label className="field">
        <span>Unidad</span>
        <input name="unit" placeholder="PZA, KG, M3" defaultValue={purchase?.unit ?? ""} />
      </label>

      <label className="field">
        <span>Precio unitario</span>
        <input
          min="0"
          name="unitPrice"
          step="0.01"
          type="number"
          defaultValue={toNumberInputValue(purchase?.unitPrice)}
        />
      </label>

      <label className="field">
        <span>Total</span>
        <input
          min="0"
          name="total"
          placeholder="Calcula si hay cantidad y precio"
          step="0.01"
          type="number"
          defaultValue={toNumberInputValue(purchase?.total)}
        />
      </label>

      <label className="field">
        <span>Pagado</span>
        <input
          min="0"
          name="paidAmount"
          step="0.01"
          type="number"
          defaultValue={toNumberInputValue(purchase?.paidAmount)}
        />
      </label>

      <label className="field span-2">
        <span>Notas</span>
        <textarea
          name="notes"
          placeholder="Entrega pendiente, condiciones o referencia"
          rows={3}
          defaultValue={purchase?.notes ?? ""}
        />
      </label>

      <div className="form-actions span-2">
        <button className="button primary" type="submit">
          {isEditing ? "Guardar material" : "Agregar material"}
        </button>
      </div>
    </form>
  );
}
