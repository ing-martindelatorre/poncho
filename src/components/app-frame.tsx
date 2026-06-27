import type { ReactNode } from "react";

type AppFrameProps = {
  active:
    | "catalogs"
    | "dashboard"
    | "imports"
    | "projects"
    | "weeks"
    | "materials"
    | "photos"
    | "users";
  children: ReactNode;
};

const navItems = [
  { key: "dashboard", href: "/", label: "Dashboard" },
  { key: "projects", href: "/projects", label: "Obras" },
  { key: "weeks", href: "/weeks", label: "Semanas" },
  { key: "materials", href: "/materials", label: "Materiales" },
  { key: "photos", href: "/photos", label: "Fotos" },
  { key: "catalogs", href: "/catalogs", label: "Catalogos" },
  { key: "imports", href: "/imports", label: "Importar" },
  { key: "users", href: "/users", label: "Usuarios" },
] as const;

export function AppFrame({ active, children }: AppFrameProps) {
  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Navegacion principal">
        <a className="brand" href="/">
          <span className="brand-mark">P</span>
          <div>
            <strong>Poncho</strong>
            <small>Control de obra</small>
          </div>
        </a>

        <nav className="nav-list">
          {navItems.map((item) => (
            <a
              className={item.key === active ? "nav-item active" : "nav-item"}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a className="nav-item logout-link" href="/logout">
          Salir
        </a>
      </aside>

      <section className="content">{children}</section>
    </main>
  );
}
