import { PeriodStatus } from "@prisma/client";
import { toDateInputValue } from "@/lib/format";
import { createWeeklyPeriod, updateWeeklyPeriod } from "./actions";

type WeekFormPeriod = {
  id: string;
  endDate: Date;
  label: string;
  notes: string | null;
  startDate: Date;
  status: PeriodStatus;
  weekNumber: number;
};

type WeekFormProps = {
  period?: WeekFormPeriod;
  projectId: string;
  suggestedWeekNumber?: number;
};

const statuses = [
  { label: "Abierta", value: PeriodStatus.OPEN },
  { label: "Cerrada", value: PeriodStatus.CLOSED },
];

export function WeekForm({ period, projectId, suggestedWeekNumber = 1 }: WeekFormProps) {
  const isEditing = Boolean(period);

  return (
    <form action={isEditing ? updateWeeklyPeriod : createWeeklyPeriod} className="form-grid">
      <input name="projectId" type="hidden" value={projectId} />
      {period ? <input name="id" type="hidden" value={period.id} /> : null}

      <label className="field">
        <span>Semana</span>
        <input
          min="1"
          name="weekNumber"
          required
          type="number"
          defaultValue={period?.weekNumber ?? suggestedWeekNumber}
        />
      </label>

      <label className="field">
        <span>Estado</span>
        <select name="status" defaultValue={period?.status ?? PeriodStatus.OPEN}>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field span-2">
        <span>Etiqueta</span>
        <input
          name="label"
          placeholder="15-20 de junio del 2026"
          required
          type="text"
          defaultValue={period?.label ?? ""}
        />
      </label>

      <label className="field">
        <span>Fecha inicial</span>
        <input
          name="startDate"
          required
          type="date"
          defaultValue={toDateInputValue(period?.startDate)}
        />
      </label>

      <label className="field">
        <span>Fecha final</span>
        <input
          name="endDate"
          required
          type="date"
          defaultValue={toDateInputValue(period?.endDate)}
        />
      </label>

      <label className="field span-2">
        <span>Notas</span>
        <textarea
          name="notes"
          placeholder="Avances, pendientes o contexto del corte"
          rows={3}
          defaultValue={period?.notes ?? ""}
        />
      </label>

      <div className="form-actions span-2">
        <button className="button primary" type="submit">
          {isEditing ? "Guardar semana" : "Crear semana"}
        </button>
      </div>
    </form>
  );
}
