// Generates Photo.xlsx from a ValuationReport, embedding uploaded photos.

import ExcelJS from "exceljs";
import { PHOTO_LAYOUT, PHOTO_DIRECTIONS } from "../cellMap";
import { ValuationReport, Plot } from "../types";
import { fetchTemplate, safeFilename } from "./xlsxUtils";
import type { GeneratedFile } from "./reportGenerator";

function pickTemplate(plotCount: number): string {
  // For 3-6 plots, base on the 2-plot template and append additional plot
  // photo blocks programmatically below it.
  return plotCount <= 1 ? "Photo_1plot.xlsx" : "Photo_2plot.xlsx";
}

const PHOTO_BLOCK_HEIGHT = 34;          // rows per plot block (approx)
const PHOTO_DIRECTIONS_FULL = [
  "South-East", "South", "South-West",
  "North-West", "North", "North-East",
];

interface ExtraBlock {
  titleRow: number;
  topPhotoRow: number;
  topCaptionRow: number;
  bottomPhotoRow: number;
  bottomCaptionRow: number;
}

function extraBlockFor(plotIndex: number): ExtraBlock {
  // 1-based: plotIndex 2 (third plot) starts at row ~70 (just after plot 2's
  // last caption row at 65). Each block is ~34 rows.
  const baseStart = 71; // first row of the third plot's block
  const start = baseStart + (plotIndex - 2) * PHOTO_BLOCK_HEIGHT;
  return {
    titleRow: start,
    topPhotoRow: start + 1,
    topCaptionRow: start + 13,
    bottomPhotoRow: start + 17,
    bottomCaptionRow: start + 30,
  };
}

function caption(direction: string, plot: Plot): string {
  return `${direction} pictorial view of Land along ${plot.location}`;
}

function clearImages(ws: ExcelJS.Worksheet): void {
  // ExcelJS doesn't expose a clean removeAll API, so we manipulate the
  // internal _media list. Cast to any to bypass typing.
  const w = ws as any;
  if (Array.isArray(w._media)) w._media.length = 0;
  // Remove any drawing entries on the workbook side too
  const wb = ws.workbook as any;
  if (Array.isArray(wb.media)) wb.media.length = 0;
}

function extOf(filename: string): "jpeg" | "png" {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "png";
  return "jpeg";
}

async function fileToBuffer(f: File): Promise<ArrayBuffer> {
  return await f.arrayBuffer();
}

export async function generatePhotos(r: ValuationReport): Promise<GeneratedFile> {
  if (r.plots.length === 0) throw new Error("Report has no plots");

  const buf = await fetchTemplate(pickTemplate(r.plots.length));
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.getWorksheet("Sheet1") ?? wb.worksheets[0];
  if (!ws) throw new Error("Photo template has no Sheet1");

  clearImages(ws);

  // Sort photos alphabetically by name for stable order
  const sorted = [...r.photos].sort((a, b) => a.name.localeCompare(b.name));

  // 1-2 plots use template-defined layouts
  const builtinPlotCount = Math.min(r.plots.length, 2);
  for (let plotIdx = 0; plotIdx < builtinPlotCount; plotIdx++) {
    const layout = PHOTO_LAYOUT[(plotIdx + 1) as 1 | 2];
    const plot = r.plots[plotIdx];

    ws.getCell(layout.titleCells[0]).value = `Owner : ${r.ownerName}`;
    ws.getCell(layout.titleCells[1]).value = `Property with plot No.-${plot.plotNo}`;

    const start = plotIdx * 6;
    const plotPhotos = sorted.slice(start, start + 6);

    for (let slot = 0; slot < layout.photoAnchors.length; slot++) {
      if (slot >= plotPhotos.length) break;
      const file = plotPhotos[slot];
      const arrBuf = await fileToBuffer(file);
      const imageId = wb.addImage({
        buffer: arrBuf,
        extension: extOf(file.name),
      });
      const anchor = layout.photoAnchors[slot];
      ws.addImage(imageId, {
        tl: { col: anchor.col, row: anchor.row } as any,
        ext: { width: 700, height: 525 },
        editAs: "oneCell",
      });
    }

    for (let row = 0; row < layout.captionCells.length; row++) {
      const cells = layout.captionCells[row];
      for (let col = 0; col < cells.length; col++) {
        const slot = row * 3 + col;
        if (slot >= plotPhotos.length) break;
        ws.getCell(cells[col]).value = caption(PHOTO_DIRECTIONS[slot], plot);
      }
    }
  }

  // Plots 3+ use programmatically-appended blocks below the existing layout.
  for (let plotIdx = 2; plotIdx < r.plots.length; plotIdx++) {
    const block = extraBlockFor(plotIdx);
    const plot = r.plots[plotIdx];

    // Title row
    ws.getCell(block.titleRow, 1).value = `Owner : ${r.ownerName}`;
    ws.getCell(block.titleRow, 7).value = `Property with plot No.-${plot.plotNo}`;
    ws.getCell(block.titleRow, 1).font = { bold: true };
    ws.getCell(block.titleRow, 7).font = { bold: true };

    const start = plotIdx * 6;
    const plotPhotos = sorted.slice(start, start + 6);

    // Photo anchors - 3 across in two rows (top/bottom)
    const anchors: { col: number; row: number }[] = [
      { col: 0, row: block.topPhotoRow }, { col: 4, row: block.topPhotoRow }, { col: 10, row: block.topPhotoRow },
      { col: 0, row: block.bottomPhotoRow }, { col: 4, row: block.bottomPhotoRow }, { col: 10, row: block.bottomPhotoRow },
    ];
    for (let slot = 0; slot < anchors.length; slot++) {
      if (slot >= plotPhotos.length) break;
      const file = plotPhotos[slot];
      const arrBuf = await fileToBuffer(file);
      const imageId = wb.addImage({ buffer: arrBuf, extension: extOf(file.name) });
      ws.addImage(imageId, {
        tl: { col: anchors[slot].col, row: anchors[slot].row } as any,
        ext: { width: 700, height: 525 },
        editAs: "oneCell",
      });
    }

    // Captions - 3 in top row, 3 in bottom row (cells in cols A, F, K)
    const capCols = [1, 6, 11];
    for (let r0 = 0; r0 < 2; r0++) {
      const captionRow = r0 === 0 ? block.topCaptionRow : block.bottomCaptionRow;
      for (let c0 = 0; c0 < 3; c0++) {
        const slot = r0 * 3 + c0;
        if (slot >= plotPhotos.length) break;
        ws.getCell(captionRow, capCols[c0]).value =
          caption(PHOTO_DIRECTIONS_FULL[slot], plot);
      }
    }
  }

  const out = await wb.xlsx.writeBuffer();
  return {
    filename: `${safeFilename(r.jobName)} - Photo.xlsx`,
    blob: new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  };
}
