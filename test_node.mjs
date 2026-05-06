// End-to-end smoke test: import the bundled generator and verify
// that anchor cells are populated correctly. Runs in Node.
//
//   node test_node.mjs
//
// This duplicates the browser flow but reads templates from disk and writes
// the output to disk for inspection.

import ExcelJS from "exceljs";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mirror the cell-map for the 2-plot template (just the anchors we test)
const TWO_PLOT = {
  date: "N8",
  bankName: "B10",
  bankBranch: "B11",
  clientPhone: "D19",
  anchorClient: "H168",
  anchorOwner: "H169",
  anchorAddress: "H170",
  anchorLocationP1: "H171",
  anchorPlotNoP1: "H172",
  anchorAreaP1: "H173",
  anchorLocationP2: "H213",
  anchorPlotNoP2: "H214",
  anchorAreaP2: "H215",
  rateMarketP1: "K264",
  rateMarketP2: "K312",
  triFieldP1: [["D177", "F177", "H177"], ["D178", "F178", "H178"]],
  triFieldP2: [["D220", "F220", "H220"], ["D221", "F221", "H221"]],
  lalpurjaP1: ["E183", "H183", "K183"],
  lalpurjaP2: ["E226", "H226", "K226"],
  engineerName: "B44",
  engineerTitle: "B45",
  engineerNec: "B46",
};

function resolveWritable(ws, coord) {
  const merges = ws.model?.merges || [];
  for (const m of merges) {
    const [from, to] = m.split(":");
    if (cellInMerge(coord, from, to)) return from;
  }
  return coord;
}
function cellInMerge(c, from, to) {
  const f = split(from), t = split(to), x = split(c);
  return x.col >= f.col && x.col <= t.col && x.row >= f.row && x.row <= t.row;
}
function split(c) {
  const m = /^([A-Z]+)(\d+)$/.exec(c);
  let n = 0; for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64);
  return { col: n, row: parseInt(m[2], 10) };
}
function setCell(ws, coord, v) {
  if (v === null || v === undefined) return;
  const target = resolveWritable(ws, coord);
  if (typeof v === "string" && v === "") {
    ws.getCell(target).value = null;
    return;
  }
  ws.getCell(target).value = v;
}

async function run() {
  const templatePath = join(__dirname, "public", "templates", "Report_2plot.xlsx");
  const buf = await readFile(templatePath);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.getWorksheet("Sheet1");

  // Apply Jeshika Subedi sample
  setCell(ws, TWO_PLOT.date, "Date : 15 July, 2025");
  setCell(ws, TWO_PLOT.bankName, "");      // blank per new defaults
  setCell(ws, TWO_PLOT.bankBranch, "");
  setCell(ws, TWO_PLOT.engineerName, "Sandeep Kafle");
  setCell(ws, TWO_PLOT.engineerTitle, "Civil Engineer");
  setCell(ws, TWO_PLOT.engineerNec, "97322");
  setCell(ws, TWO_PLOT.clientPhone, "9847126011/9847214180");
  setCell(ws, TWO_PLOT.anchorClient, "Miss. Jeshika Subedi");
  setCell(ws, TWO_PLOT.anchorOwner, "Mrs. Bhagawati Subedi");
  setCell(ws, TWO_PLOT.anchorAddress, "Ramgram Municipality, Ward No.-3, Parasi, Nawalparasi");
  setCell(ws, TWO_PLOT.anchorLocationP1, "Plot 1 location text");
  setCell(ws, TWO_PLOT.anchorPlotNoP1, "Parasi VDC : 3 / 1798 & 1796");
  setCell(ws, TWO_PLOT.anchorAreaP1, "(B-K-D) : 0-0-2 & 0-0-8 = 0-0-10 = 10.000 Dhur (total)");
  setCell(ws, TWO_PLOT.anchorLocationP2, "Plot 2 location text");
  setCell(ws, TWO_PLOT.anchorPlotNoP2, "Manjhariya VDC : 1-Ka  / 1878");
  setCell(ws, TWO_PLOT.anchorAreaP2, "(Bigha-Kattha-Dhur) : 0-0-12.50 = 12.500 Dhur");
  setCell(ws, TWO_PLOT.rateMarketP1, 250000);
  setCell(ws, TWO_PLOT.rateMarketP2, 100000);

  for (const [i, t] of [[0, [30, 60, 67.08]], [1, [30, 60, 67.08]]]) {
    const cells = TWO_PLOT.triFieldP1[i];
    setCell(ws, cells[0], t[0]); setCell(ws, cells[1], t[1]); setCell(ws, cells[2], t[2]);
  }
  for (const [i, t] of [[0, [24.33, 92.5, 95.16]], [1, [23.33, 91.58, 95.16]]]) {
    const cells = TWO_PLOT.triFieldP2[i];
    setCell(ws, cells[0], t[0]); setCell(ws, cells[1], t[1]); setCell(ws, cells[2], t[2]);
  }
  setCell(ws, TWO_PLOT.lalpurjaP1[2], 10);
  setCell(ws, TWO_PLOT.lalpurjaP2[2], 12.5);

  const out = await wb.xlsx.writeBuffer();
  const outPath = join(__dirname, "test_node_output.xlsx");
  await writeFile(outPath, Buffer.from(out));

  // Re-open and verify
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.load(out);
  const ws2 = wb2.getWorksheet("Sheet1");
  const checks = [
    ["N8", "Date : 15 July, 2025"],
    ["B10", null],
    ["B44", "Sandeep Kafle"],
    ["B45", "Civil Engineer"],
    ["B46", "97322"],
    ["H168", "Miss. Jeshika Subedi"],
    ["H169", "Mrs. Bhagawati Subedi"],
    ["H172", "Parasi VDC : 3 / 1798 & 1796"],
    ["H214", "Manjhariya VDC : 1-Ka  / 1878"],
    ["K264", 250000],
    ["K312", 100000],
    ["D177", 30],
    ["F177", 60],
    ["H177", 67.08],
    ["K183", 10],
    ["K226", 12.5],
    ["D19", "9847126011/9847214180"],
  ];
  let pass = 0, fail = 0;
  for (const [coord, expected] of checks) {
    const got = ws2.getCell(coord).value;
    const ok = expected === null
      ? (got === null || got === "" || got === undefined)
      : got === expected;
    if (ok) { pass++; console.log(`  PASS ${coord} = ${JSON.stringify(got)}`); }
    else { fail++; console.log(`  FAIL ${coord}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(got)}`); }
  }
  console.log(`\n${pass}/${pass + fail} cell checks passed.`);
  console.log(`Output written to: ${outPath}`);
}

run().catch(err => { console.error(err); process.exit(1); });
