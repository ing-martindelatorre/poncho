import type { ReactNode } from "react";

type AppFrameProps = {
  active:
    | "catalogs"
    | "dashboard"
    | "imports"
    | "projects"
    | "weeks"
    | "work-items"
    | "materials"
    | "photos"
    | "users";
  children: ReactNode;
};

const navItems = [
  { key: "dashboard", href: "/", label: "Dashboard" },
  { key: "projects", href: "/projects", label: "Obras" },
  { key: "weeks", href: "/projects", label: "Semanas" },
  { key: "work-items", href: "/projects", label: "Destajos" },
  { key: "materials", href: "/projects", label: "Materiales" },
  { key: "photos", href: "/projects", label: "Fotos" },
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
