import { login } from "./actions";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-mark">P</span>
          <div>
            <strong>Poncho</strong>
            <small>Control de obra</small>
          </div>
        </div>
        <h1>Iniciar sesion</h1>
        {params.error ? <p className="form-error">Correo o contrasena incorrectos.</p> : null}
        <form action={login} className="form-grid">
          <input name="next" type="hidden" value={params.next ?? "/"} />
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
              Entrar
            </button>
          </div>
        </form>
        <a className="muted-link" href="/setup">
          Crear primer administrador
        </a>
      </section>
    </main>
  );
}
