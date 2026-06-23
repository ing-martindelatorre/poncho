import { createPhoto } from "./actions";

type PhotoFormProps = {
  projectId: string;
  weeklyPeriodId: string;
};

export function PhotoForm({ projectId, weeklyPeriodId }: PhotoFormProps) {
  return (
    <form action={createPhoto} className="form-grid">
      <input name="projectId" type="hidden" value={projectId} />
      <input name="weeklyPeriodId" type="hidden" value={weeklyPeriodId} />

      <label className="field">
        <span>Foto</span>
        <input accept="image/*" name="photo" required type="file" />
      </label>

      <label className="field">
        <span>Comentario</span>
        <input name="caption" placeholder="Avance, ticket, remision" type="text" />
      </label>

      <div className="form-actions span-2">
        <button className="button primary" type="submit">
          Subir foto
        </button>
      </div>
    </form>
  );
}
