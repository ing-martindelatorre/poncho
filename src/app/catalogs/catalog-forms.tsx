import {
  createContractor,
  createSupplier,
  createWorkCatalogItem,
  deleteContractor,
  deleteSupplier,
  deleteWorkCatalogItem,
  updateContractor,
  updateSupplier,
  updateWorkCatalogItem,
} from "./actions";

type WorkCatalogItem = {
  active: boolean;
  category: string;
  description: string;
  id: string;
  unit: string;
  unitPrice: unknown;
};

export function WorkCatalogForm({ item }: { item?: WorkCatalogItem }) {
  const action = item ? updateWorkCatalogItem : createWorkCatalogItem;

  return (
    <form action={action} className="compact-form">
      {item ? <input name="id" type="hidden" value={item.id} /> : null}

      <input name="category" placeholder="Categoria (Albanileria)" required defaultValue={item?.category ?? ""} />
      <input name="description" placeholder="Concepto (Enjarre de pared)" required defaultValue={item?.description ?? ""} />
      <input name="unit" placeholder="Unidad (M2, ML, PZA)" required defaultValue={item?.unit ?? ""} />
      <input
        min="0"
        name="unitPrice"
        placeholder="Precio unitario"
        required
        step="0.01"
        type="number"
        defaultValue={item ? String(item.unitPrice) : ""}
      />
      {item ? (
        <select name="active" defaultValue={String(item.active)}>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      ) : null}
      <button className="button primary" type="submit">
        {item ? "Guardar" : "Agregar"}
      </button>
    </form>
  );
}

export function WorkCatalogDeleteForm({ item }: { item: WorkCatalogItem }) {
  return (
    <form action={deleteWorkCatalogItem}>
      <input name="id" type="hidden" value={item.id} />
      <button className="button danger" type="submit">
        Eliminar
      </button>
    </form>
  );
}

type Supplier = {
  active: boolean;
  email: string | null;
  id: string;
  name: string;
  notes: string | null;
  phone: string | null;
  taxId: string | null;
};

type Contractor = {
  active: boolean;
  email: string | null;
  id: string;
  name: string;
  notes: string | null;
  phone: string | null;
  trade: string | null;
};

export function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const action = supplier ? updateSupplier : createSupplier;

  return (
    <form action={action} className="compact-form">
      {supplier ? <input name="id" type="hidden" value={supplier.id} /> : null}

      <input name="name" placeholder="Proveedor" required defaultValue={supplier?.name ?? ""} />
      <input name="phone" placeholder="Telefono" defaultValue={supplier?.phone ?? ""} />
      <input name="email" placeholder="Correo" type="email" defaultValue={supplier?.email ?? ""} />
      <input name="taxId" placeholder="RFC" defaultValue={supplier?.taxId ?? ""} />
      <input name="notes" placeholder="Notas" defaultValue={supplier?.notes ?? ""} />
      {supplier ? (
        <select name="active" defaultValue={String(supplier.active)}>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      ) : null}
      <button className="button primary" type="submit">
        {supplier ? "Guardar" : "Agregar"}
      </button>
    </form>
  );
}

export function SupplierDeleteForm({ supplier }: { supplier: Supplier }) {
  return (
    <form action={deleteSupplier}>
      <input name="id" type="hidden" value={supplier.id} />
      <button className="button danger" type="submit">
        Eliminar
      </button>
    </form>
  );
}

export function ContractorForm({ contractor }: { contractor?: Contractor }) {
  const action = contractor ? updateContractor : createContractor;

  return (
    <form action={action} className="compact-form">
      {contractor ? <input name="id" type="hidden" value={contractor.id} /> : null}

      <input
        name="name"
        placeholder="Contratista"
        required
        defaultValue={contractor?.name ?? ""}
      />
      <input name="trade" placeholder="Oficio" defaultValue={contractor?.trade ?? ""} />
      <input name="phone" placeholder="Telefono" defaultValue={contractor?.phone ?? ""} />
      <input
        name="email"
        placeholder="Correo"
        type="email"
        defaultValue={contractor?.email ?? ""}
      />
      <input name="notes" placeholder="Notas" defaultValue={contractor?.notes ?? ""} />
      {contractor ? (
        <select name="active" defaultValue={String(contractor.active)}>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      ) : null}
      <button className="button primary" type="submit">
        {contractor ? "Guardar" : "Agregar"}
      </button>
    </form>
  );
}

export function ContractorDeleteForm({ contractor }: { contractor: Contractor }) {
  return (
    <form action={deleteContractor}>
      <input name="id" type="hidden" value={contractor.id} />
      <button className="button danger" type="submit">
        Eliminar
      </button>
    </form>
  );
}
