"use client";

import { MoneyKind } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";
import { useState } from "react";
import { toNumberInputValue } from "@/lib/format";
import { createWorkItem, updateWorkItem } from "./actions";

type CatalogEntry = {
  category: string;
  description: string;
  id: string;
  unit: string;
  unitPrice: unknown;
};

type WorkItemFormItem = {
  id: string;
  category: string;
  description: string;
  height: Decimal | null;
  length: Decimal | null;
  moneyKind: MoneyKind;
  notes: string | null;
  pieces: Decimal | null;
  unit: string;
  unitPrice: Decimal;
  volume: Decimal;
  width: Decimal | null;
};

type WorkItemFormProps = {
  catalog?: CatalogEntry[];
  item?: WorkItemFormItem;
  projectId: string;
  weeklyPeriodId: string;
};

const moneyKinds = [
  { label: "Efectivo", value: MoneyKind.CASH },
  { label: "Facturado", value: MoneyKind.INVOICED },
];

export function WorkItemForm({ catalog = [], item, projectId, weeklyPeriodId }: WorkItemFormProps) {
  const isEditing = Boolean(item);

  const [category, setCategory] = useState(item?.category ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [unit, setUnit] = useState(item?.unit ?? "");
  const [unitPrice, setUnitPrice] = useState(toNumberInputValue(item?.unitPrice) ?? "");

  function applyFromCatalog(e: React.ChangeEvent<HTMLSelectElement>) {
    const entry = catalog.find((c) => c.id === e.target.value);
    if (!entry) return;
    setCategory(entry.category);
    setDescription(entry.description);
    setUnit(entry.unit);
    setUnitPrice(String(entry.unitPrice));
  }

  return (
    <form action={isEditing ? updateWorkItem : createWorkItem} className="form-grid">
      <input name="projectId" type="hidden" value={projectId} />
      <input name="weeklyPeriodId" type="hidden" value={weeklyPeriodId} />
      {item ? <input name="id" type="hidden" value={item.id} /> : null}

      {!isEditing && catalog.length > 0 ? (
        <label className="field span-2">
          <span>Concepto del catalogo</span>
          <select onChange={applyFromCatalog} defaultValue="">
            <option value="">-- Seleccionar concepto --</option>
            {catalog.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.category} / {entry.description} ({entry.unit})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="field">
        <span>Categoria</span>
        <input
          name="category"
          placeholder="Albanileria"
          required
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </label>

      <label className="field">
        <span>Tipo</span>
        <select name="moneyKind" defaultValue={item?.moneyKind ?? MoneyKind.CASH}>
          {moneyKinds.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field span-2">
        <span>Descripcion</span>
        <input
          name="description"
          placeholder="Enjarre azotea y hormigon 3er nivel"
          required
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="field">
        <span>Unidad</span>
        <input
          name="unit"
          placeholder="M2, ML, KG, PZA"
          required
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
      </label>

      <label className="field">
        <span>Volumen</span>
        <input
          min="0"
          name="volume"
          required
          step="0.001"
          type="number"
          defaultValue={toNumberInputValue(item?.volume)}
        />
      </label>

      <label className="field">
        <span>Precio unitario</span>
        <input
          min="0"
          name="unitPrice"
          required
          step="0.01"
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
        />
      </label>

      <label className="field">
        <span>Piezas</span>
        <input
          min="0"
          name="pieces"
          step="0.001"
          type="number"
          defaultValue={toNumberInputValue(item?.pieces)}
        />
      </label>

      <label className="field">
        <span>Largo</span>
        <input
          min="0"
          name="length"
          step="0.001"
          type="number"
          defaultValue={toNumberInputValue(item?.length)}
        />
      </label>

      <label className="field">
        <span>Ancho</span>
        <input
          min="0"
          name="width"
          step="0.001"
          type="number"
          defaultValue={toNumberInputValue(item?.width)}
        />
      </label>

      <label className="field">
        <span>Alto</span>
        <input
          min="0"
          name="height"
          step="0.001"
          type="number"
          defaultValue={toNumberInputValue(item?.height)}
        />
      </label>

      <label className="field span-2">
        <span>Notas</span>
        <textarea
          name="notes"
          placeholder="Medidas, referencias o aclaraciones"
          rows={3}
          defaultValue={item?.notes ?? ""}
        />
      </label>

      <div className="form-actions span-2">
        <button className="button primary" type="submit">
          {isEditing ? "Guardar destajo" : "Agregar destajo"}
        </button>
      </div>
    </form>
  );
}
