import assert from "node:assert/strict";
import test from "node:test";

function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field.trim());
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      field = "";
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }

  return rows;
}

function rowsToObjects(rows) {
  const [header, ...data] = rows;
  const keys = header.map((key) => key.trim().toLowerCase());
  return data.map((row) =>
    Object.fromEntries(keys.map((key, index) => [key, row[index]?.trim() ?? ""])),
  );
}

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
