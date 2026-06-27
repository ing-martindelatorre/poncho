"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type WorkItem = { category: string; description: string; unit: string; volume: string; unitPrice: string; total: string; moneyKind: string };
type LaborPayment = { workerName: string; role: string; days: string; hours: string; rate: string; total: string };
type MaterialPurchase = { description: string; supplierName: string; invoiceNumber: string; total: string; paidAmount: string };
type Payment = { description: string; paidAt: string; method: string; amount: string };

type ExportWeekPdfButtonProps = {
  honorariosRate: number;
  period: {
    endDate: string;
    label: string;
    startDate: string;
    weekNumber: number;
  };
  project: { address: string | null; clientName: string | null; name: string };
  data: {
    laborPayments: LaborPayment[];
    materialPurchases: MaterialPurchase[];
    payments: Payment[];
    workItems: WorkItem[];
  };
  totals: { honorarios: number; laborTotal: number; materialTotal: number; payments: number; subtotal: number; total: number; workTotal: number };
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function ExportWeekPdfButton({ honorariosRate, period, project, data, totals }: ExportWeekPdfButtonProps) {
  function handleExport() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
    const today = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
    let y = 0;

    // ── Encabezado ───────────────────────────────────────────────────────
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 216, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(project.name.toUpperCase(), 14, 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Semana ${period.weekNumber} — ${period.label}`, 14, 17);
    doc.text(`${fmtDate(period.startDate)} al ${fmtDate(period.endDate)}`, 14, 23);

    doc.setFontSize(8);
    if (project.clientName) doc.text(`Cliente: ${project.clientName}`, 202, 10, { align: "right" });
    if (project.address) doc.text(project.address, 202, 16, { align: "right" });
    doc.text(`Generado: ${today}`, 202, 22, { align: "right" });

    // ── Métricas ─────────────────────────────────────────────────────────
    y = 32;
    const metrics = [
      { label: "Destajos", value: fmt(totals.workTotal) },
      { label: "Materiales", value: fmt(totals.materialTotal) },
      { label: "Nomina", value: fmt(totals.laborTotal) },
      { label: `Honorarios (${(honorariosRate * 100).toFixed(0)}%)`, value: fmt(totals.honorarios) },
      { label: "Total semana", value: fmt(totals.total) },
      { label: "Abonos", value: fmt(totals.payments) },
      { label: "Saldo deudor", value: fmt(totals.total - totals.payments) },
    ];
    const boxW = 26;
    metrics.forEach((m, i) => {
      const x = 14 + i * (boxW + 2);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, boxW, 13, 1.5, 1.5, "F");
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(m.label, x + boxW / 2, y + 4.5, { align: "center" });
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(m.value, x + boxW / 2, y + 10, { align: "center" });
    });
    y = 48;

    // ── Destajos ─────────────────────────────────────────────────────────
    if (data.workItems.length > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("DESTAJOS", 14, y);
      autoTable(doc, {
        startY: y + 2,
        head: [["Categoria", "Descripcion", "Unidad", "Vol.", "Precio unit.", "Total", "Tipo"]],
        body: data.workItems.map((i) => [
          i.category, i.description, i.unit,
          i.volume, fmt(Number(i.unitPrice)), fmt(Number(i.total)),
          i.moneyKind === "CASH" ? "Efectivo" : "Facturado",
        ]),
        foot: [["", "", "", "", "Subtotal destajos", fmt(totals.workTotal), ""]],
        styles: { fontSize: 7, cellPadding: 1.8 },
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
        footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 22 }, 1: { cellWidth: 50 }, 2: { cellWidth: 14 },
          3: { cellWidth: 12, halign: "right" }, 4: { cellWidth: 24, halign: "right" },
          5: { cellWidth: 24, halign: "right" }, 6: { cellWidth: 18 },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    }

    // ── Materiales ────────────────────────────────────────────────────────
    if (data.materialPurchases.length > 0) {
      if (y > 220) { doc.addPage(); y = 14; }
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("MATERIALES", 14, y);
      autoTable(doc, {
        startY: y + 2,
        head: [["Descripcion", "Proveedor", "Folio", "Total", "Pagado", "Tipo"]],
        body: data.materialPurchases.map((m) => [
          m.description, m.supplierName, m.invoiceNumber,
          fmt(Number(m.total)), fmt(Number(m.paidAmount)),
          "Efectivo",
        ]),
        foot: [["", "", "Subtotal materiales", fmt(totals.materialTotal), "", ""]],
        styles: { fontSize: 7, cellPadding: 1.8 },
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
        footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 55 }, 1: { cellWidth: 35 }, 2: { cellWidth: 22 },
          3: { cellWidth: 24, halign: "right" }, 4: { cellWidth: 24, halign: "right" }, 5: { cellWidth: 18 },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    }

    // ── Nómina ────────────────────────────────────────────────────────────
    if (data.laborPayments.length > 0) {
      if (y > 220) { doc.addPage(); y = 14; }
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("NOMINA", 14, y);
      autoTable(doc, {
        startY: y + 2,
        head: [["Trabajador", "Rol", "Dias", "Horas", "Tarifa", "Total"]],
        body: data.laborPayments.map((lp) => [
          lp.workerName, lp.role, lp.days, lp.hours,
          fmt(Number(lp.rate)), fmt(Number(lp.total)),
        ]),
        foot: [["", "", "", "", "Subtotal nomina", fmt(totals.laborTotal)]],
        styles: { fontSize: 7, cellPadding: 1.8 },
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
        footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 40 }, 1: { cellWidth: 30 }, 2: { cellWidth: 16, halign: "right" },
          3: { cellWidth: 16, halign: "right" }, 4: { cellWidth: 28, halign: "right" }, 5: { cellWidth: 28, halign: "right" },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    }

    // ── Abonos ────────────────────────────────────────────────────────────
    if (data.payments.length > 0) {
      if (y > 220) { doc.addPage(); y = 14; }
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("ABONOS", 14, y);
      autoTable(doc, {
        startY: y + 2,
        head: [["Descripcion", "Fecha", "Metodo", "Monto"]],
        body: data.payments.map((p) => [
          p.description, fmtDate(p.paidAt), p.method, fmt(Number(p.amount)),
        ]),
        foot: [["", "", "Total abonos", fmt(totals.payments)]],
        styles: { fontSize: 7, cellPadding: 1.8 },
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
        footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 70 }, 1: { cellWidth: 28 }, 2: { cellWidth: 28 }, 3: { cellWidth: 28, halign: "right" },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    }

    // ── Totales finales ───────────────────────────────────────────────────
    if (y > 235) { doc.addPage(); y = 14; }
    autoTable(doc, {
      startY: y,
      body: [
        ["Subtotal", fmt(totals.subtotal)],
        [`Honorarios (${(honorariosRate * 100).toFixed(0)}%)`, fmt(totals.honorarios)],
        ["Total semana", fmt(totals.total)],
        ["Total abonos", fmt(totals.payments)],
        ["Saldo deudor", fmt(totals.total - totals.payments)],
      ],
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 50, fontStyle: "bold" }, 1: { cellWidth: 35, halign: "right" } },
      tableWidth: 85,
      margin: { left: 116 },
      bodyStyles: { fillColor: [248, 250, 252] },
    });

    // ── Pie de página ─────────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Pagina ${i} de ${pageCount}`, 202, 275, { align: "right" });
      doc.text("Generado por Poncho", 14, 275);
    }

    const slug = `${project.name}_semana${period.weekNumber}`.toLowerCase().replace(/[^a-z0-9]+/gi, "_");
    doc.save(`${slug}.pdf`);
  }

  return (
    <button className="button primary no-print" onClick={handleExport} type="button">
      Exportar PDF
    </button>
  );
}
