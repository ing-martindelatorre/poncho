import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { UserDeleteForm, UserForm } from "./user-forms";

export const dynamic = "force-dynamic";

type UsersPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const roleLabels = {
  ADMIN: "Admin",
  ARCHITECT: "Arquitecto",
  CAPTURE: "Capturista",
  READ_ONLY: "Solo lectura",
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  await requireAdmin();
  const [params, users] = await Promise.all([
    searchParams,
    prisma.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] }),
  ]);

  return (
    <AppFrame active="users">
      <header className="topbar">
        <div>
          <p className="eyebrow">Seguridad</p>
          <h1>Usuarios</h1>
        </div>
      </header>

      {params.error === "short-password" ? (
        <section className="locked-banner">La contrasena debe tener al menos 10 caracteres.</section>
      ) : null}
      {params.error === "self-delete" ? (
        <section className="locked-banner">No puedes eliminar tu propio usuario.</section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Nuevo usuario</p>
            <h2>Acceso al sistema</h2>
          </div>
        </div>
        <div className="inline-create">
          <UserForm />
        </div>

        <div className="catalog-list">
          {users.map((user) => (
            <article className="catalog-row" key={user.id}>
              <UserForm user={user} />
              <div className="row-actions">
                <span className="badge">{roleLabels[user.role]}</span>
                <span className="badge">{user.active ? "Activo" : "Inactivo"}</span>
                <UserDeleteForm user={user} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppFrame>
  );
}
