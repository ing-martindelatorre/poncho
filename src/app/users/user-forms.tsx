import { UserRole } from "@prisma/client";
import { createUser, deleteUser, updateUser } from "./actions";

type UserRow = {
  active: boolean;
  email: string;
  id: string;
  name: string;
  role: UserRole;
};

const roles = [
  { label: "Admin", value: UserRole.ADMIN },
  { label: "Arquitecto", value: UserRole.ARCHITECT },
  { label: "Capturista", value: UserRole.CAPTURE },
  { label: "Solo lectura", value: UserRole.READ_ONLY },
];

export function UserForm({ user }: { user?: UserRow }) {
  const action = user ? updateUser : createUser;

  return (
    <form action={action} className="compact-form">
      {user ? <input name="id" type="hidden" value={user.id} /> : null}
      <input name="name" placeholder="Nombre" required defaultValue={user?.name ?? ""} />
      <input
        name="email"
        placeholder="correo@dominio.com"
        required
        type="email"
        defaultValue={user?.email ?? ""}
      />
      <select name="role" defaultValue={user?.role ?? UserRole.CAPTURE}>
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
      {user ? (
        <select name="active" defaultValue={String(user.active)}>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      ) : null}
      <input
        name="password"
        placeholder={user ? "Nueva contrasena opcional" : "Contrasena"}
        required={!user}
        type="password"
      />
      <button className="button primary" type="submit">
        {user ? "Guardar" : "Agregar"}
      </button>
    </form>
  );
}

export function UserDeleteForm({ user }: { user: UserRow }) {
  return (
    <form action={deleteUser}>
      <input name="id" type="hidden" value={user.id} />
      <button className="button danger" type="submit">
        Eliminar
      </button>
    </form>
  );
}
