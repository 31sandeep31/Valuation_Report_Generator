// Generates the Report.xlsx file from a ValuationReport.
// Mirrors system/src/report_generator.py.

import ExcelJS from "exceljs";
import { ONE_PLOT, TWO_PLOT, OnePlotMap, TwoPlotMap } from "../cellMap";
import { ValuationReport, Plot, Triangle, LalpurjaArea, Building } from "../types";
import { fetchTemplate, setCell, setFormula, safeFilename } from "./xlsxUtils";
import { computeReport, inWords } from "./calculations";

function pickTemplate(plotCount: number): string {
  // 1-plot template stays special; everything else (2-6) builds on the 2-plot
  // template and we append a supplementary section for plots 3+.
  return plotCount <= 1 ? "Report_1plot.xlsx" : "Report_2plot.xlsx";
}

function writeTriangles(
  ws: ExcelJS.Worksheet,
  cells: [string, string, string][],
  triangles: Triangle[],
): void {
  for (let i = 0; i < cells.length && i < triangles.length; i++) {
    const [a, b, c] = cells[i];
    const t = triangles[i];
    setCell(ws, a, t.a);
    setCell(ws, b, t.b);
    setCell(ws, c, t.c);
  }
}

function writeLalpurja(
  ws: ExcelJS.Worksheet,
  cells: [string, string, string],
  area: LalpurjaArea,
): void {
  setCell(ws, cells[0], area.bigha);
  setCell(ws, cells[1], area.kattha);
  setCell(ws, cells[2], area.dhur);
}

function withColon(text: string): string {
  if (!text) return "";
  return text.startsWith(":") ? text : `: ${text}`;
}

function fillCommon(
  ws: ExcelJS.Worksheet,
  m: OnePlotMap | TwoPlotMap,
  r: ValuationReport,
): void {
  if (r.reportDate) setCell(ws, m.date, `Date : ${r.reportDate}`);
  setCell(ws, m.bankName, r.bank.name);
  setCell(ws, m.bankBranch, r.bank.branch);
  setCell(ws, m.engineerName, r.engineer.name);
  setCell(ws, m.engineerTitle, r.engineer.title);
  setCell(ws, m.engineerNec, `NEC Regd. No-${r.engineer.necRegd}`);
  setCell(ws, m.propertyTypeLine, `The property consists of ${r.propertyType}`);

  setCell(ws, m.anchorClient, r.clientName);
  setCell(ws, m.anchorOwner, r.ownerName);
  setCell(ws, m.anchorAddress, r.clientAddress);
  setCell(ws, m.anchorLocationP1, r.plots[0].location);
  setCell(ws, m.anchorPlotNoP1, r.plots[0].plotNo);
  setCell(ws, m.anchorAreaP1, r.plots[0].areaCertificate);

  setCell(ws, m.clientPhone, r.clientPhone);

  if (r.visitDate) {
    setCell(
      ws,
      m.visitDateLine,
      `We have physically visited/inspected the properties on date of ${r.visitDate}.`,
    );
  }

  setCell(ws, m.accessibilityText, r.plots[0].accessibilityText);

  setCell(ws, m.coverSubmitterName, r.submitter.name);
  setCell(ws, m.coverSubmitterAddr, r.submitter.address);
  setCell(ws, m.coverContactConsultancy, `Contact:  ${r.submitter.contact}`);
  setCell(ws, m.coverEmail, `Email: ${r.submitter.email}`);
  if (r.bank.name) setCell(ws, m.coverBank, `  ${r.bank.name.toUpperCase()}`);
  setCell(ws, m.coverBranch, r.bank.branch);
  if (r.clientPhone) setCell(ws, m.coverContact, `Contact No :- ${r.clientPhone}`);

  setCell(ws, m.commentImportance, withColon(r.comments.importance));
  setCell(ws, m.commentRiver, withColon(r.comments.nearnessToRiver));
  setCell(ws, m.commentHighTension, withColon(r.comments.highTensionLine));
  setCell(ws, m.commentLandslide, withColon(r.comments.landslideFlood));
  setCell(ws, m.commentMonument, withColon(r.comments.monumentArea));
  setCell(ws, m.commentOther, withColon(r.comments.otherComments));
}

function fillOnePlot(ws: ExcelJS.Worksheet, r: ValuationReport): void {
  const m = ONE_PLOT;
  fillCommon(ws, m, r);
  const p1: Plot = r.plots[0];

  setCell(ws, m.coverLocation, `Property Located At : ${p1.location}`);

  setCell(ws, m.boundaryEast, p1.boundary.east);
  setCell(ws, m.boundaryWest, p1.boundary.west);
  setCell(ws, m.boundaryNorth, p1.boundary.north);
  setCell(ws, m.boundarySouth, p1.boundary.south);

  setCell(ws, m.accessImportance, p1.importance);
  setCell(ws, m.accessBlueprint, p1.accessBlueprint);
  setCell(ws, m.accessSite, p1.accessSite);

  if (p1.marketRatePerDhur) setCell(ws, m.rateMarketP1, p1.marketRatePerDhur);
  if (p1.govtRateTotal) setFormula(ws, m.rateGovtTotalCellP1, `${p1.govtRateTotal}/20`);

  writeTriangles(ws, m.triFieldP1, p1.fieldTriangles);
  const cad =
    p1.cadastralTriangles.some((t) => t.a || t.b || t.c)
      ? p1.cadastralTriangles
      : p1.fieldTriangles;
  writeTriangles(ws, m.triCadP1, cad);
  writeLalpurja(ws, m.lalpurjaP1, p1.lalpurjaArea);
}

function fillTwoPlot(ws: ExcelJS.Worksheet, r: ValuationReport): void {
  const m = TWO_PLOT;
  fillCommon(ws, m, r);
  const p1 = r.plots[0];
  const p2: Plot | undefined = r.plots[1];

  setCell(ws, m.coverLocation, `Property Located At : ${p1.location}`);

  if (p2) {
    setCell(ws, m.anchorLocationP2, p2.location);
    setCell(ws, m.anchorPlotNoP2, p2.plotNo);
    setCell(ws, m.anchorAreaP2, p2.areaCertificate);
    setCell(ws, m.coverLocationP2, `& Another Property Located At : ${p2.location}`);
  }

  setCell(ws, m.boundaryEastP1, p1.boundary.east);
  setCell(ws, m.boundaryWestP1, p1.boundary.west);
  setCell(ws, m.boundaryNorthP1, p1.boundary.north);
  setCell(ws, m.boundarySouthP1, p1.boundary.south);
  if (p2) {
    setCell(ws, m.boundaryEastP2, p2.boundary.east);
    setCell(ws, m.boundaryWestP2, p2.boundary.west);
    setCell(ws, m.boundaryNorthP2, p2.boundary.north);
    setCell(ws, m.boundarySouthP2, p2.boundary.south);
  }

  setCell(ws, m.accessImportanceP1, p1.importance);
  setCell(ws, m.accessBlueprintP1, p1.accessBlueprint);
  setCell(ws, m.accessSiteP1, p1.accessSite);
  if (p2) {
    setCell(ws, m.accessImportanceP2, p2.importance);
    setCell(ws, m.accessBlueprintP2, p2.accessBlueprint);
    setCell(ws, m.accessSiteP2, p2.accessSite);
  }

  if (p1.marketRatePerDhur) setCell(ws, m.rateMarketP1, p1.marketRatePerDhur);
  if (p1.govtRateTotal) setFormula(ws, m.rateGovtTotalCellP1, `${p1.govtRateTotal}/20`);
  if (p2) {
    if (p2.marketRatePerDhur) setCell(ws, m.rateMarketP2, p2.marketRatePerDhur);
    if (p2.govtRateTotal) setFormula(ws, m.rateGovtTotalCellP2, `${p2.govtRateTotal}/20`);
  }

  writeTriangles(ws, m.triFieldP1, p1.fieldTriangles);
  const cad1 = p1.cadastralTriangles.some((t) => t.a || t.b || t.c)
    ? p1.cadastralTriangles
    : p1.fieldTriangles;
  writeTriangles(ws, m.triCadP1, cad1);
  writeLalpurja(ws, m.lalpurjaP1, p1.lalpurjaArea);

  if (p2) {
    writeTriangles(ws, m.triFieldP2, p2.fieldTriangles);
    const cad2 = p2.cadastralTriangles.some((t) => t.a || t.b || t.c)
      ? p2.cadastralTriangles
      : p2.fieldTriangles;
    writeTriangles(ws, m.triCadP2, cad2);
    writeLalpurja(ws, m.lalpurjaP2, p2.lalpurjaArea);
  }
}

export interface GeneratedFile {
  filename: string;
  blob: Blob;
}

// ---------- Building writes ------------------------------------------------
// The 2-plot template's building rows live at:
//   Row 124-126 (table: type, stories, GF/FF/SF area)
//   Row 138 (value row that drives FMV / distress)
// The 1-plot template has the equivalent at rows 117-119, 131.
// We write computed values directly so building math contributes to totals
// even though the template's chained formulas only cover one building.
function writeBuildingForPlot(
  ws: ExcelJS.Worksheet,
  plotIndex: number,
  building: Building,
  is2Plot: boolean,
): void {
  if (!building.enabled) return;
  // Only plot 1 has a fully-formulated building section in the templates.
  // For plot 2+ we still write the area numbers (so they appear in the
  // building table) but their valuation is included via the totals override.
  if (plotIndex !== 0) return;

  // Construction type / stories
  if (is2Plot) {
    setCell(ws, "D124", building.constructionType);
    setCell(ws, "G124", building.storiesText);
    setCell(ws, "O124", `${building.yearOfConstruction || 0} Years ago`);
  } else {
    setCell(ws, "D117", building.constructionType);
    setCell(ws, "G117", building.storiesText);
    setCell(ws, "O117", `${building.yearOfConstruction || 0} Years ago`);
  }

  // Floor labels and areas (G. F., F. F., S. F. - up to 3 in template)
  const labelCells = is2Plot ? ["H124", "H125", "H126"] : ["H117", "H118", "H119"];
  const areaCells  = is2Plot ? ["J124", "J125", "J126"] : ["J117", "J118", "J119"];
  for (let i = 0; i < 3; i++) {
    const f = building.floors[i];
    if (f) {
      setCell(ws, labelCells[i], f.label);
      setCell(ws, areaCells[i], f.area);
    } else {
      setCell(ws, labelCells[i], "");
      setCell(ws, areaCells[i], 0);
    }
  }
}

// ---------- Headline totals override (rows N33, N34, N35) ------------------
// Override the cover-page headline numbers when computed totals diverge from
// what the template formulas would produce (i.e. for 3-6 plot reports, or
// when buildings on plot 2+ contribute to totals).
function writeHeadlineTotals(
  ws: ExcelJS.Worksheet,
  is2Plot: boolean,
  marketTotal: number,
  fmvTotal: number,
  distressTotal: number,
): void {
  // 1-plot uses N34/N35/N36, 2-plot uses N33/N34/N35
  if (is2Plot) {
    setCell(ws, "N33", marketTotal);
    setCell(ws, "N34", fmvTotal);
    setCell(ws, "N35", distressTotal);
    setCell(ws, "C36", `In Words : ${inWords(distressTotal)}`);
  } else {
    setCell(ws, "N34", marketTotal);
    setCell(ws, "N35", fmvTotal);
    setCell(ws, "N36", distressTotal);
    setCell(ws, "C37", `In Words : ${inWords(distressTotal)}`);
  }
}

// ---------- Supplementary section for plots 3-6 ----------------------------
// Append a "Supplementary Plots" section at the very end of the worksheet so
// reports with 3+ plots actually contain those plots' data + per-plot totals.
function appendSupplementaryPlots(
  ws: ExcelJS.Worksheet,
  r: ValuationReport,
): void {
  if (r.plots.length <= 2) return;

  const computed = computeReport(r.plots);
  // Find a clean starting row well past the existing content
  const startRow = Math.max(ws.actualRowCount, 360) + 6;
  let row = startRow;

  ws.getCell(row, 2).value = "ADDITIONAL PLOTS (3+) — computed values";
  ws.getCell(row, 2).font = { bold: true, size: 14 };
  row += 2;

  // Header row
  const headers = [
    "S.N.", "Owner", "Location", "Plot No.", "Area (Dhur)",
    "Mkt Rate / Dhur", "Govt Rate / Dhur (×20=Kattha)",
    "Market Value", "Fair Mkt Value", "Distress Value",
  ];
  headers.forEach((h, i) => {
    const cell = ws.getCell(row, 2 + i);
    cell.value = h;
    cell.font = { bold: true };
    cell.border = {
      top:    { style: "thin" }, bottom: { style: "thin" },
      left:   { style: "thin" }, right:  { style: "thin" },
    };
  });
  row++;

  // One row per plot 3+
  for (let i = 2; i < r.plots.length; i++) {
    const p = r.plots[i];
    const v = computed.perPlot[i];
    const cells = [
      i + 1,
      r.ownerName,
      p.location,
      p.plotNo,
      Math.round(v.areaDhur * 1000) / 1000,
      p.marketRatePerDhur || 0,
      p.govtRateTotal || 0,
      v.marketRounded,
      v.fmvRounded,
      v.distressRounded,
    ];
    cells.forEach((val, j) => {
      const cell = ws.getCell(row, 2 + j);
      cell.value = val as any;
      cell.border = {
        top:    { style: "thin" }, bottom: { style: "thin" },
        left:   { style: "thin" }, right:  { style: "thin" },
      };
    });
    row++;
  }

  // Building info per plot (if any building enabled on plots 2+)
  const buildingPlots = r.plots
    .map((p, idx) => ({ idx, p, v: computed.perPlot[idx] }))
    .filter(({ p }) => p.building.enabled);
  if (buildingPlots.length > 0) {
    row++;
    ws.getCell(row, 2).value = "BUILDING SUMMARY (all plots with buildings)";
    ws.getCell(row, 2).font = { bold: true };
    row++;
    const bHead = ["Plot #", "Type", "Stories", "Total sq ft", "Rate / sqft", "Gross", "Depreciated", "FMV (90%)", "Distress (90%)"];
    bHead.forEach((h, i) => {
      const c = ws.getCell(row, 2 + i);
      c.value = h; c.font = { bold: true };
      c.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });
    row++;
    for (const { idx, p, v } of buildingPlots) {
      const cells = [
        idx + 1, p.building.constructionType, p.building.storiesText,
        v.buildingTotalSqft, p.building.ratePerSqft || 0,
        Math.round(v.buildingValueGross),
        Math.round(v.buildingDepreciatedValue),
        Math.round(v.buildingFmv),
        Math.round(v.buildingDistress),
      ];
      cells.forEach((val, j) => {
        const c = ws.getCell(row, 2 + j);
        c.value = val as any;
        c.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
      });
      row++;
    }
  }

  // Grand total across all plots (1..N)
  row += 2;
  ws.getCell(row, 2).value = "GRAND TOTAL — all plots (1 through " + r.plots.length + ")";
  ws.getCell(row, 2).font = { bold: true, size: 13 };
  row += 1;
  const totalRows: [string, number][] = [
    ["Total Recommended Market Value (NRs)",       computed.marketTotal],
    ["Total Recommended Fair Market Value (NRs)",  computed.fmvTotal],
    ["Total Recommended Distress Value (NRs)",     computed.distressTotal],
  ];
  for (const [label, value] of totalRows) {
    ws.getCell(row, 2).value = label;
    ws.getCell(row, 2).font = { bold: true };
    ws.getCell(row, 8).value = value;
    ws.getCell(row, 8).font = { bold: true };
    row++;
  }
  row++;
  ws.getCell(row, 2).value = `In Words (Distress) : ${inWords(computed.distressTotal)}`;
  ws.getCell(row, 2).font = { italic: true };
}

export async function generateReport(r: ValuationReport): Promise<GeneratedFile> {
  if (r.plots.length === 0) throw new Error("Report has no plots");

  const buf = await fetchTemplate(pickTemplate(r.plots.length));
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.getWorksheet("Sheet1") ?? wb.worksheets[0];
  if (!ws) throw new Error("Template has no Sheet1");

  const is2Plot = r.plots.length > 1;
  if (!is2Plot) fillOnePlot(ws, r);
  else fillTwoPlot(ws, r);

  // Building writes (uses plot[0]'s building cells in the template)
  for (let i = 0; i < r.plots.length; i++) {
    writeBuildingForPlot(ws, i, r.plots[i].building, is2Plot);
  }

  // For 3-6 plots OR when any building contributes to totals beyond plot 1,
  // override the headline totals on the cover page with computed totals so
  // they reflect the full report.
  const totals = computeReport(r.plots);
  const hasExtraPlots = r.plots.length > 2;
  const hasBuildingBeyondP1 = r.plots.slice(1).some((p) => p.building.enabled);
  if (hasExtraPlots || hasBuildingBeyondP1) {
    writeHeadlineTotals(
      ws, is2Plot,
      totals.marketTotal, totals.fmvTotal, totals.distressTotal,
    );
  }

  // Supplementary section for plots 3-6
  if (r.plots.length > 2) {
    appendSupplementaryPlots(ws, r);
  }

  const out = await wb.xlsx.writeBuffer();
  return {
    filename: `${safeFilename(r.jobName)} - Report.xlsx`,
    blob: new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  };
}
