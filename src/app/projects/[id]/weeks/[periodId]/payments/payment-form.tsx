import { MoneyKind, PaymentMethod } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import { toDateInputValue, toNumberInputValue } from "@/lib/format";
import { createPayment, updatePayment } from "./actions";

type PaymentFormPayment = {
  id: string;
  amount: Decimal;
  description: string;
  method: PaymentMethod;
  moneyKind: MoneyKind;
  notes: string | null;
  paidAt: Date;
};

type PaymentFormProps = {
  payment?: PaymentFormPayment;
  projectId: string;
  weeklyPeriodId: string;
};

const moneyKinds = [
  { label: "Efectivo", value: MoneyKind.CASH },
  { label: "Facturado", value: MoneyKind.INVOICED },
];

const methods = [
  { label: "Transferencia", value: PaymentMethod.TRANSFER },
  { label: "Efectivo", value: PaymentMethod.CASH },
  { label: "Cheque", value: PaymentMethod.CHECK },
  { label: "Tarjeta", value: PaymentMethod.CARD },
  { label: "Otro", value: PaymentMethod.OTHER },
];

export function PaymentForm({ payment, projectId, weeklyPeriodId }: PaymentFormProps) {
  const isEditing = Boolean(payment);

  return (
    <form action={isEditing ? updatePayment : createPayment} className="form-grid">
      <input name="projectId" type="hidden" value={projectId} />
      <input name="weeklyPeriodId" type="hidden" value={weeklyPeriodId} />
      {payment ? <input name="id" type="hidden" value={payment.id} /> : null}

      <label className="field span-2">
        <span>Descripcion</span>
        <input
          name="description"
          placeholder="Abono efectivo, abono facturado"
          required
          type="text"
          defaultValue={payment?.description ?? ""}
        />
      </label>

      <label className="field">
        <span>Monto</span>
        <input
          min="0"
          name="amount"
          required
          step="0.01"
          type="number"
          defaultValue={toNumberInputValue(payment?.amount)}
        />
      </label>

      <label className="field">
        <span>Fecha</span>
        <input name="paidAt" type="date" defaultValue={toDateInputValue(payment?.paidAt)} />
      </label>

      <label className="field">
        <span>Metodo</span>
        <select name="method" defaultValue={payment?.method ?? PaymentMethod.TRANSFER}>
          {methods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Tipo</span>
        <select name="moneyKind" defaultValue={payment?.moneyKind ?? MoneyKind.CASH}>
          {moneyKinds.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field span-2">
        <span>Notas</span>
        <textarea
          name="notes"
          placeholder="Referencia bancaria, comentario o folio"
          rows={3}
          defaultValue={payment?.notes ?? ""}
        />
      </label>

      <div className="form-actions span-2">
        <button className="button primary" type="submit">
          {isEditing ? "Guardar pago" : "Agregar pago"}
        </button>
      </div>
    </form>
  );
}
