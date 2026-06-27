import assert from "node:assert/strict";
import test from "node:test";
import { csvEscape, sumMoney } from "../src/lib/reporting";

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
