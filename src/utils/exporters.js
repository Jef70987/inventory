import jsPDF from "jspdf";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile, writeFile } from "@tauri-apps/plugin-fs";

// ---------- CSV ----------
export async function exportCSV(defaultName, headers, rows) {
  const filePath = await save({
    defaultPath: defaultName,
    filters: [{ name: "CSV", extensions: ["csv"] }],
  });
  if (!filePath) return false;

  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ];
  await writeTextFile(filePath, lines.join("\n"));
  return true;
}

// ---------- PDF ----------
export async function exportPDF(defaultName, title, columns, rows, meta = {}) {
  const filePath = await save({
    defaultPath: defaultName,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (!filePath) return false;

  const doc = new jsPDF({
    orientation: columns.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let y = 24;

  if (meta.subtitle) {
    doc.text(meta.subtitle, 14, y);
    y += 5;
  }
  if (meta.generated) {
    doc.text(`Generated: ${meta.generated}`, 14, y);
    y += 6;
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const tableWidth = pageWidth - marginX * 2;
  const colWidth = tableWidth / columns.length;

  doc.setFillColor(30, 58, 95);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.rect(marginX, y, tableWidth, 8, "F");
  columns.forEach((c, i) => {
    doc.text(String(c), marginX + i * colWidth + 2, y + 5.5);
  });
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  rows.forEach((row, idx) => {
    if (y > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
    if (idx % 2 === 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(marginX, y, tableWidth, 7, "F");
    }
    row.forEach((cell, i) => {
      const text = cell === null || cell === undefined ? "" : String(cell);
      const truncated = text.length > 40 ? text.slice(0, 37) + "..." : text;
      doc.text(truncated, marginX + i * colWidth + 2, y + 5);
    });
    y += 7;
  });

  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Page ${p} of ${pages}`,
      pageWidth - 30,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  const arrayBuffer = doc.output("arraybuffer");
  await writeFile(filePath, new Uint8Array(arrayBuffer));
  return true;
}
