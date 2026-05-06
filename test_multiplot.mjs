// End-to-end test for multi-plot (4 plots) generation.
// Loads the 2-plot template, simulates the generator's plot 3-6 append logic,
// then verifies the supplementary section is present.

import ExcelJS from "exceljs";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Reproduce just enough of the generator to drive a 4-plot scenario.
// The real generator is in src/lib/reportGenerator.ts (TS) - this is a
// JS twin used purely as a smoke test.
const SQFT_PER_DHUR = 182.25;

function herons(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  const s = (a + b + c) / 2;
  if (s - a <= 0 || s - b <= 0 || s - c <= 0) return 0;
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}
function multiTri(triangles) {
  return triangles.reduce((sum, t) => sum + herons(t.a, t.b, t.c), 0);
}
const ROUND_DOWN = (v, places) => {
  const f = Math.pow(10, -places);
  return Math.floor(v / f) * f;
};

function computePlot(p) {
  const fieldSqft = multiTri(p.fieldTriangles);
  const cad = (p.cadastralTriangles || []).some((t) => t.a || t.b || t.c)
    ? p.cadastralTriangles : p.fieldTriangles;
  const cadSqft = multiTri(cad);
  const lp = p.lalpurjaArea;
  const lpSqft = lp.bigha * 72900 + lp.kattha * 3645 + lp.dhur * SQFT_PER_DHUR;
  const cands = [fieldSqft, cadSqft, lpSqft].filter(v => v > 0);
  const validSqft = cands.length > 0 ? Math.min(...cands) : 0;
  const areaDhur = validSqft / SQFT_PER_DHUR;
  const wt = (p.marketRatePerDhur || 0) * 0.8 + ((p.govtRateTotal || 0) / 20) * 0.2;
  const market = areaDhur * (p.marketRatePerDhur || 0);
  const fmv = areaDhur * wt;
  const distress = fmv * 0.8;
  return {
    areaDhur, marketRounded: ROUND_DOWN(market, -4),
    fmvRounded: ROUND_DOWN(fmv, -4),
    distressRounded: ROUND_DOWN(distress, -3),
  };
}

async function run() {
  const buf = await readFile(join(__dirname, "public", "templates", "Report_2plot.xlsx"));
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.getWorksheet("Sheet1");

  // Build 4 plots
  const plots = [];
  for (let i = 1; i <= 4; i++) {
    plots.push({
      location: `Plot ${i} location`,
      plotNo: `P-${1000 + i}`,
      marketRatePerDhur: 100000 + i * 50000,
      govtRateTotal: 200000 + i * 30000,
      fieldTriangles: [{ a: 30, b: 60, c: 67.08 }, { a: 30, b: 60, c: 67.08 }],
      cadastralTriangles: [{ a: 0, b: 0, c: 0 }, { a: 0, b: 0, c: 0 }],
      lalpurjaArea: { bigha: 0, kattha: 0, dhur: 8 + i },
      building: { enabled: false },
    });
  }

  // Compute totals
  const perPlot = plots.map(computePlot);
  const totals = {
    market: perPlot.reduce((s, p) => s + p.marketRounded, 0),
    fmv: perPlot.reduce((s, p) => s + p.fmvRounded, 0),
    distress: perPlot.reduce((s, p) => s + p.distressRounded, 0),
  };

  // Override headline cells
  ws.getCell("N33").value = totals.market;
  ws.getCell("N34").value = totals.fmv;
  ws.getCell("N35").value = totals.distress;

  // Append supplementary section
  const startRow = Math.max(ws.actualRowCount, 360) + 6;
  let row = startRow;
  ws.getCell(row, 2).value = "ADDITIONAL PLOTS (3+) — computed values";
  row += 2;
  const headers = ["S.N.", "Owner", "Location", "Plot No.", "Area (Dhur)", "Mkt Rate", "Govt Rate", "Market Value", "FMV", "Distress"];
  headers.forEach((h, i) => { ws.getCell(row, 2 + i).value = h; });
  row++;
  for (let i = 2; i < plots.length; i++) {
    const p = plots[i], v = perPlot[i];
    [i + 1, "Owner X", p.location, p.plotNo, Math.round(v.areaDhur * 1000) / 1000,
     p.marketRatePerDhur, p.govtRateTotal, v.marketRounded, v.fmvRounded, v.distressRounded
    ].forEach((val, j) => { ws.getCell(row, 2 + j).value = val; });
    row++;
  }
  row += 2;
  ws.getCell(row, 2).value = "GRAND TOTAL — all plots";
  row++;
  ws.getCell(row, 2).value = "Total Market Value";
  ws.getCell(row, 8).value = totals.market;
  row++;
  ws.getCell(row, 2).value = "Total FMV";
  ws.getCell(row, 8).value = totals.fmv;
  row++;
  ws.getCell(row, 2).value = "Total Distress";
  ws.getCell(row, 8).value = totals.distress;

  const out = await wb.xlsx.writeBuffer();
  await writeFile(join(__dirname, "test_multiplot_output.xlsx"), Buffer.from(out));

  // Verify
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.load(out);
  const ws2 = wb2.getWorksheet("Sheet1");
  let pass = 0, fail = 0;
  const checks = [
    ["N33", totals.market],
    ["N34", totals.fmv],
    ["N35", totals.distress],
  ];
  for (const [coord, expected] of checks) {
    const got = ws2.getCell(coord).value;
    if (got === expected) { pass++; console.log(`  PASS ${coord} = ${got}`); }
    else { fail++; console.log(`  FAIL ${coord}: expected ${expected}, got ${got}`); }
  }
  // Verify supplementary section exists
  let foundSupplementary = false;
  ws2.eachRow((r) => {
    r.eachCell((c) => {
      if (typeof c.value === "string" && c.value.includes("ADDITIONAL PLOTS")) {
        foundSupplementary = true;
      }
    });
  });
  if (foundSupplementary) { pass++; console.log("  PASS supplementary section present"); }
  else { fail++; console.log("  FAIL supplementary section missing"); }

  console.log(`\nTotals: market=${totals.market} fmv=${totals.fmv} distress=${totals.distress}`);
  console.log(`Per-plot Dhur: ${perPlot.map(p => p.areaDhur.toFixed(3)).join(", ")}`);
  console.log(`\n${pass}/${pass + fail} checks passed.`);
}

run().catch(err => { console.error(err); process.exit(1); });
