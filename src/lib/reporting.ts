type MoneyKind = "CASH" | "INVOICED";

export function sumMoney<T extends { moneyKind: string } & Record<string, unknown>>(
  rows: T[],
  moneyKind: MoneyKind,
  field: keyof T = "total",
) {
  return rows
    .filter((row) => row.moneyKind === moneyKind)
    .reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

export function csvEscape(value: unknown) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function toCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}
