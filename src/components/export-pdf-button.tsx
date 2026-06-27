"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type WeekRow = {
  cash: number;
  debt: number;
  honorarios: number;
  invoiced: number;
  label: string;
  payments: number;
  total: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
};

type ProjectData = {
  address: string | null;
  builtAreaM2: string | null;
  clientName: string | null;
  name: string;
};

type ExportPdfButtonProps = {
  project: ProjectData;
  rows: WeekRow[];
  totals: {
    cash: number;
    debt: number;
    honorarios: number;
    invoiced: number;
    payments: number;
    total: number;
  };
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function ExportPdfButton({ project, rows, totals }: ExportPdfButtonProps) {
  function handleExport() {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });
    const today = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });

    // ── Encabezado ──────────────────────────────────────────────────────────
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 280, 22, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RELACION DE OBRA", 14, 10);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(project.name.toUpperCase(), 14, 16);

    doc.setFontSize(8);
    doc.text(`Fecha: ${today}`, 230, 10, { align: "right" });
    if (project.clientName) doc.text(`Cliente: ${project.clientName}`, 230, 15, { align: "right" });
    if (project.address) doc.text(project.address, 230, 20, { align: "right" });

    // ── Métricas resumen ───────────────────────────────────────────────────
    doc.setTextColor(30, 41, 59);
    const metrics = [
      { label: "Efectivo", value: fmt(totals.cash) },
      { label: "Facturado", value: fmt(totals.invoiced) },
      { label: "Honorarios", value: fmt(totals.honorarios) },
      { label: "Total obra", value: fmt(totals.total) },
      { label: "Total abonos", value: fmt(totals.payments) },
      { label: "Saldo deudor", value: fmt(totals.debt) },
    ];
    const boxW = 42;
    metrics.forEach((m, i) => {
      const x = 14 + i * (boxW + 3);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, 26, boxW, 14, 2, 2, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(m.label, x + boxW / 2, 31, { align: "center" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(m.value, x + boxW / 2, 37, { align: "center" });
    });

    // ── Tabla por semana ───────────────────────────────────────────────────
    autoTable(doc, {
      startY: 44,
      head: [["Semana", "Periodo", "Fechas", "Efectivo", "Facturado", "Honorarios", "Total", "Abonos", "Deuda"]],
      body: rows.map((r) => [
        `Semana ${r.weekNumber}`,
        r.label,
        `${fmtDate(r.startDate)} – ${fmtDate(r.endDate)}`,
        fmt(r.cash),
        fmt(r.invoiced),
        fmt(r.honorarios),
        fmt(r.total),
        fmt(r.payments),
        fmt(r.debt),
      ]),
      foot: [[
        "TOTAL", "", "",
        fmt(totals.cash), fmt(totals.invoiced), fmt(totals.honorarios),
        fmt(totals.total), fmt(totals.payments), fmt(totals.debt),
      ]],
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 28 },
        2: { cellWidth: 38 },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 25, halign: "right" },
        6: { cellWidth: 25, halign: "right" },
        7: { cellWidth: 25, halign: "right" },
        8: { cellWidth: 25, halign: "right" },
      },
    });

    // ── Pie de página ──────────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Pagina ${i} de ${pageCount}`, 260, 208, { align: "right" });
      doc.text("Generado por Poncho", 14, 208);
    }

    const fileName = `${project.name.toLowerCase().replace(/[^a-z0-9]+/gi, "_")}_reporte.pdf`;
    doc.save(fileName);
  }

  return (
    <button className="button primary no-print" onClick={handleExport} type="button">
      Exportar PDF
    </button>
  );
}
