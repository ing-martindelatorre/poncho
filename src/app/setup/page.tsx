import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createFirstAdmin } from "./actions";

export const dynamic = "force-dynamic";

type SetupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const [params, users] = await Promise.all([searchParams, prisma.user.count()]);

  if (users > 0) {
    redirect("/login");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-mark">P</span>
          <div>
            <strong>Poncho</strong>
            <small>Primer administrador</small>
          </div>
        </div>
        <h1>Configurar acceso</h1>
        {params.error === "short-password" ? (
          <p className="form-error">Usa una contrasena de al menos 10 caracteres.</p>
        ) : null}
        <form action={createFirstAdmin} className="form-grid">
          <label className="field span-2">
            <span>Nombre</span>
            <input name="name" required />
          </label>
          <label className="field span-2">
            <span>Correo</span>
            <input name="email" required type="email" />
          </label>
          <label className="field span-2">
            <span>Contrasena</span>
            <input name="password" required type="password" />
          </label>
          <div className="form-actions span-2">
            <button className="button primary" type="submit">
              Crear administrador
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
