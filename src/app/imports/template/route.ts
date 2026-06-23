const template = [
  [
    "project_name",
    "address",
    "client_name",
    "week_number",
    "label",
    "start_date",
    "end_date",
    "cash",
    "invoiced",
    "payments",
  ],
  [
    "Real Alcazar 1370",
    "Jardines Providencia, Tepatitlan",
    "Cliente ejemplo",
    "27",
    "15-20 DE JUNIO DEL 2026",
    "2026-06-15",
    "2026-06-20",
    "46108.54",
    "12195.00",
    "0.00",
  ],
];

export function GET() {
  const csv = `\uFEFF${template.map((row) => row.join(",")).join("\n")}\n`;

  return new Response(csv, {
    headers: {
      "Content-Disposition": 'attachment; filename="poncho_import_template.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
