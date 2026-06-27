import { AppFrame } from "@/components/app-frame";
import { prisma } from "@/lib/db";
import {
  ContractorDeleteForm,
  ContractorForm,
  SupplierDeleteForm,
  SupplierForm,
  WorkCatalogDeleteForm,
  WorkCatalogForm,
} from "./catalog-forms";

export const dynamic = "force-dynamic";

async function getCatalogs() {
  const [suppliers, contractors, workCatalog] = await prisma.$transaction([
    prisma.supplier.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    prisma.contractor.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    prisma.workCatalog.findMany({
      orderBy: [{ active: "desc" }, { category: "asc" }, { description: "asc" }],
    }),
  ]);

  return { contractors, suppliers, workCatalog };
}

export default async function CatalogsPage() {
  const { contractors, suppliers, workCatalog } = await getCatalogs();

  return (
    <AppFrame active="catalogs">
      <header className="topbar">
        <div>
          <p className="eyebrow">Catalogos</p>
          <h1>Proveedores y contratistas</h1>
        </div>
      </header>

      <section className="panel section-gap">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Catalogo de conceptos</p>
            <h2>{workCatalog.length} conceptos</h2>
          </div>
        </div>

        <div className="inline-create">
          <WorkCatalogForm />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Concepto</th>
                <th>Unidad</th>
                <th>Precio unitario</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {workCatalog.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td><strong>{item.description}</strong></td>
                  <td>{item.unit}</td>
                  <td>{String(item.unitPrice)}</td>
                  <td><span className="badge">{item.active ? "Activo" : "Inactivo"}</span></td>
                  <td className="row-actions">
                    <WorkCatalogForm item={item} />
                    <WorkCatalogDeleteForm item={item} />
                  </td>
                </tr>
              ))}
              {workCatalog.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">Aun no hay conceptos en el catalogo.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

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
