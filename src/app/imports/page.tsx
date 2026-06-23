import { AppFrame } from "@/components/app-frame";
import { importWeeklySummary } from "./actions";

export const dynamic = "force-dynamic";

type ImportsPageProps = {
  searchParams: Promise<{ imported?: string }>;
};

export default async function ImportsPage({ searchParams }: ImportsPageProps) {
  const params = await searchParams;

  return (
    <AppFrame active="imports">
      <header className="topbar">
        <div>
          <p className="eyebrow">Importador</p>
          <h1>Excel a Poncho</h1>
        </div>
        <a className="button ghost" href="/imports/template">
          Descargar plantilla CSV
        </a>
      </header>

      {params.imported ? (
        <section className="locked-banner">
          Importacion completada: {params.imported} semanas procesadas.
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Historico</p>
            <h2>Cargar resumen semanal</h2>
          </div>
        </div>
        <form action={importWeeklySummary} className="form-grid">
          <label className="field span-2">
            <span>Archivo CSV</span>
            <input accept=".csv,text/csv" name="file" required type="file" />
          </label>
          <div className="form-actions span-2">
            <button className="button primary" type="submit">
              Importar
            </button>
          </div>
        </form>
      </section>

      <section className="panel section-gap">
        <p className="eyebrow">Formato</p>
        <h2>Columnas esperadas</h2>
        <p className="muted-copy">
          Guarda tu Excel como CSV con columnas: project_name, address, client_name,
          week_number, label, start_date, end_date, cash, invoiced, payments.
        </p>
      </section>
    </AppFrame>
  );
}
