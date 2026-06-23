import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import {
  ContractorDeleteForm,
  ContractorForm,
  SupplierDeleteForm,
  SupplierForm,
} from "./catalog-forms";

export const dynamic = "force-dynamic";

async function getCatalogs() {
  const [suppliers, contractors] = await prisma.$transaction([
    prisma.supplier.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    prisma.contractor.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
  ]);

  return { contractors, suppliers };
}

export default async function CatalogsPage() {
  const { contractors, suppliers } = await getCatalogs();

  return (
    <AppFrame active="catalogs">
      <header className="topbar">
        <div>
          <p className="eyebrow">Catalogos</p>
          <h1>Proveedores y contratistas</h1>
        </div>
      </header>

      <section className="split-layout">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Proveedores</p>
              <h2>{suppliers.length} registrados</h2>
            </div>
          </div>

          <div className="inline-create">
            <SupplierForm />
          </div>

          <div className="catalog-list">
            {suppliers.map((supplier) => (
              <article className="catalog-row" key={supplier.id}>
                <SupplierForm supplier={supplier} />
                <div className="row-actions">
                  <span className="badge">{supplier.active ? "Activo" : "Inactivo"}</span>
                  <SupplierDeleteForm supplier={supplier} />
                </div>
              </article>
            ))}

            {suppliers.length === 0 ? (
              <div className="empty-state">Aun no hay proveedores.</div>
            ) : null}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Contratistas</p>
              <h2>{contractors.length} registrados</h2>
            </div>
          </div>

          <div className="inline-create">
            <ContractorForm />
          </div>

          <div className="catalog-list">
            {contractors.map((contractor) => (
              <article className="catalog-row" key={contractor.id}>
                <ContractorForm contractor={contractor} />
                <div className="row-actions">
                  <span className="badge">{contractor.active ? "Activo" : "Inactivo"}</span>
                  <ContractorDeleteForm contractor={contractor} />
                </div>
              </article>
            ))}

            {contractors.length === 0 ? (
              <div className="empty-state">Aun no hay contratistas.</div>
            ) : null}
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
