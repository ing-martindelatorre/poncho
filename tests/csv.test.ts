import assert from "node:assert/strict";
import test from "node:test";
import { parseCsv, rowsToObjects } from "../src/lib/csv";

test("parseCsv handles quoted commas", () => {
  assert.deepEqual(parseCsv('name,total\n"Real, Alcazar",100\n'), [
    ["name", "total"],
    ["Real, Alcazar", "100"],
  ]);
});

test("rowsToObjects lowercases headers", () => {
  assert.deepEqual(rowsToObjects([["Name", "Total"], ["Obra", "123"]]), [
    { name: "Obra", total: "123" },
  ]);
});
