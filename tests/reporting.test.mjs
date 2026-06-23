import assert from "node:assert/strict";
import test from "node:test";

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function sumMoney(rows, moneyKind, field = "total") {
  return rows
    .filter((row) => row.moneyKind === moneyKind)
    .reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

test("csvEscape quotes commas and quotes", () => {
  assert.equal(csvEscape('Factura "A", cemento'), '"Factura ""A"", cemento"');
});

test("sumMoney filters by money kind", () => {
  assert.equal(
    sumMoney(
      [
        { moneyKind: "CASH", total: 10 },
        { moneyKind: "INVOICED", total: 20 },
        { moneyKind: "CASH", total: 5 },
      ],
      "CASH",
    ),
    15,
  );
});
