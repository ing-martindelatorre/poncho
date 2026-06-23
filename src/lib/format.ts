import type { Decimal } from "@prisma/client/runtime/library";

export function formatCurrency(value: Decimal | number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("es-MX", {
    currency: "MXN",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(amount);
}

export function formatNumber(value: Decimal | number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(amount);
}

export function toNumberInputValue(value: Decimal | number | string | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return Number(value).toString();
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}
