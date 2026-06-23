export function parseCsv(text: string) {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
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

export function rowsToObjects(rows: string[][]) {
  const [header, ...data] = rows;

  if (!header) {
    return [];
  }

  const keys = header.map((key) => key.trim().toLowerCase());

  return data.map((row) =>
    Object.fromEntries(keys.map((key, index) => [key, row[index]?.trim() ?? ""])),
  );
}

export function numberFromCsv(value: string | undefined) {
  const clean = String(value ?? "")
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/,/g, "");
  const number = Number(clean);

  return Number.isFinite(number) ? number : 0;
}
