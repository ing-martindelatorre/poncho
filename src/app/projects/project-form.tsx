import { ProjectStatus } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import { createProject, updateProject } from "./actions";
import { toDateInputValue, toNumberInputValue } from "@/lib/format";

type ProjectFormProject = {
  id: string;
  address: string | null;
  builtAreaM2: Decimal | null;
  clientName: string | null;
  name: string;
  notes: string | null;
  startDate: Date | null;
  status: ProjectStatus;
};

type ProjectFormProps = {
  project?: ProjectFormProject;
};

const statuses = [
  { label: "Activa", value: ProjectStatus.ACTIVE },
  { label: "Planeada", value: ProjectStatus.PLANNED },
  { label: "Pausada", value: ProjectStatus.PAUSED },
  { label: "Terminada", value: ProjectStatus.FINISHED },
];

export function ProjectForm({ project }: ProjectFormProps) {
  const isEditing = Boolean(project);

  return (
    <form action={isEditing ? updateProject : createProject} className="form-grid">
      {project ? <input name="id" type="hidden" value={project.id} /> : null}

      <label className="field span-2">
        <span>Nombre de obra</span>
        <input
          name="name"
          placeholder="Real Alcazar 1370"
          required
          type="text"
          defaultValue={project?.name ?? ""}
        />
      </label>

      <label className="field">
        <span>Cliente</span>
        <input
          name="clientName"
          placeholder="Nombre del cliente"
          type="text"
          defaultValue={project?.clientName ?? ""}
        />
      </label>

      <label className="field">
        <span>Estado</span>
        <select name="status" defaultValue={project?.status ?? ProjectStatus.ACTIVE}>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field span-2">
        <span>Direccion</span>
        <input
          name="address"
          placeholder="Calle, colonia, ciudad"
          type="text"
          defaultValue={project?.address ?? ""}
        />
      </label>

      <label className="field">
        <span>m2 construidos</span>
        <input
          min="0"
          name="builtAreaM2"
          placeholder="0"
          step="0.01"
          type="number"
          defaultValue={toNumberInputValue(project?.builtAreaM2)}
        />
      </label>

      <label className="field">
        <span>Fecha de inicio</span>
        <input
          name="startDate"
          type="date"
          defaultValue={toDateInputValue(project?.startDate)}
        />
      </label>

      <label className="field span-2">
        <span>Notas</span>
        <textarea
          name="notes"
          placeholder="Detalles generales de la obra"
          rows={4}
          defaultValue={project?.notes ?? ""}
        />
      </label>

      <div className="form-actions span-2">
        <button className="button primary" type="submit">
          {isEditing ? "Guardar cambios" : "Crear obra"}
        </button>
      </div>
    </form>
  );
}
