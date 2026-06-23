import { MoneyKind } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import { toNumberInputValue } from "@/lib/format";
import { createLaborPayment, updateLaborPayment } from "./actions";

type LaborFormPayment = {
  id: string;
  days: Decimal | null;
  hours: Decimal | null;
  moneyKind: MoneyKind;
  notes: string | null;
  rate: Decimal;
  role: string | null;
  total: Decimal;
  workerName: string;
};

type LaborFormProps = {
  payment?: LaborFormPayment;
  projectId: string;
  weeklyPeriodId: string;
};

const moneyKinds = [
  { label: "Efectivo", value: MoneyKind.CASH },
  { label: "Facturado", value: MoneyKind.INVOICED },
];

export function LaborForm({ payment, projectId, weeklyPeriodId }: LaborFormProps) {
  const isEditing = Boolean(payment);

  return (
    <form action={isEditing ? updateLaborPayment : createLaborPayment} className="form-grid">
      <input name="projectId" type="hidden" value={projectId} />
      <input name="weeklyPeriodId" type="hidden" value={weeklyPeriodId} />
      {payment ? <input name="id" type="hidden" value={payment.id} /> : null}

      <label className="field">
        <span>Trabajador</span>
        <input
          name="workerName"
          placeholder="Pablo"
          required
          type="text"
          defaultValue={payment?.workerName ?? ""}
        />
      </label>

      <label className="field">
        <span>Rol</span>
        <input name="role" placeholder="Albanil, ayudante" defaultValue={payment?.role ?? ""} />
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

      <label className="field">
        <span>Dias</span>
        <input
          min="0"
          name="days"
          step="0.01"
          type="number"
          defaultValue={toNumberInputValue(payment?.days)}
        />
      </label>

      <label className="field">
        <span>Horas</span>
        <input
          min="0"
          name="hours"
          step="0.01"
          type="number"
          defaultValue={toNumberInputValue(payment?.hours)}
        />
      </label>

      <label className="field">
        <span>Tarifa</span>
        <input
          min="0"
          name="rate"
          required
          step="0.01"
          type="number"
          defaultValue={toNumberInputValue(payment?.rate)}
        />
      </label>

      <label className="field">
        <span>Total</span>
        <input
          min="0"
          name="total"
          placeholder="Calcula con dias/horas y tarifa"
          step="0.01"
          type="number"
          defaultValue={toNumberInputValue(payment?.total)}
        />
      </label>

      <label className="field span-2">
        <span>Notas</span>
        <textarea
          name="notes"
          placeholder="Detalle del pago"
          rows={3}
          defaultValue={payment?.notes ?? ""}
        />
      </label>

      <div className="form-actions span-2">
        <button className="button primary" type="submit">
          {isEditing ? "Guardar nomina" : "Agregar nomina"}
        </button>
      </div>
    </form>
  );
}
