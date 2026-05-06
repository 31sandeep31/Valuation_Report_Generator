// Programmatic equivalents of the Excel formulas in the templates.
// Used to compute totals across all plots (including 3-6 plots that the
// formula network in the template can't reach).

import { Plot, Building } from "../types";
import { multiTriangleArea, SQFT_PER_DHUR } from "./landUnits";

export interface PlotValuation {
  areaDhur: number;          // computed from triangles, in Dhur
  weightedRate: number;      // 80% market + 20% (govt/20)
  marketValue: number;       // rate * area
  fairMarketValue: number;   // weighted * area
  distressValueLand: number; // 80% of FMV (land only)
  // Building-derived (zero if building disabled)
  buildingTotalSqft: number;
  buildingValueGross: number;          // total sqft * ratePerSqft
  buildingDepreciatedValue: number;    // gross * (1 - dep% * age)
  buildingFmv: number;                 // 90% of depreciated
  buildingDistress: number;            // 90% of FMV building
  // Per-plot totals (land + building)
  marketTotal: number;
  fmvTotal: number;
  distressTotal: number;
  // Round-down values used in reports
  marketRounded: number;
  fmvRounded: number;
  distressRounded: number;
}

const ROUND_DOWN = (v: number, places: number): number => {
  // Excel's ROUNDDOWN(v, -4) rounds toward zero to the nearest 10000.
  const factor = Math.pow(10, -places);
  return Math.floor(v / factor) * factor;
};

export function computePlot(plot: Plot): PlotValuation {
  // Use cadastral if any non-zero, else field
  const cad = plot.cadastralTriangles.some((t) => t.a || t.b || t.c)
    ? plot.cadastralTriangles
    : plot.fieldTriangles;
  const fieldSqft = multiTriangleArea(plot.fieldTriangles);
  const cadSqft = multiTriangleArea(cad);
  // Lalpurja area in sq ft
  const lp = plot.lalpurjaArea;
  const lpSqft = lp.bigha * 72900 + lp.kattha * 3645 + lp.dhur * SQFT_PER_DHUR;
  // The valuation uses MIN(field, cadastral, lalpurja) per the template's K196 / K237.
  const candidates = [fieldSqft, cadSqft, lpSqft].filter((v) => v > 0);
  const validSqft = candidates.length > 0 ? Math.min(...candidates) : 0;
  const areaDhur = validSqft / SQFT_PER_DHUR;

  const marketRate = plot.marketRatePerDhur || 0;
  const govtRatePerDhur = (plot.govtRateTotal || 0) / 20;
  const weightedRate = marketRate * 0.8 + govtRatePerDhur * 0.2;

  const marketValue = areaDhur * marketRate;
  const fairMarketValue = areaDhur * weightedRate;
  const distressValueLand = fairMarketValue * 0.8;

  // Building
  const b: Building = plot.building;
  let buildingTotalSqft = 0;
  let buildingValueGross = 0;
  let buildingDepreciatedValue = 0;
  let buildingFmv = 0;
  let buildingDistress = 0;
  if (b.enabled) {
    buildingTotalSqft = b.floors.reduce((s, f) => s + (f.area || 0), 0);
    buildingValueGross = buildingTotalSqft * (b.ratePerSqft || 0);
    const depFactor = Math.max(
      0,
      1 - ((b.depreciationPctPerYear || 0) / 100) * (b.ageYears || 0),
    );
    buildingDepreciatedValue = buildingValueGross * depFactor;
    buildingFmv = buildingDepreciatedValue * 0.9;
    buildingDistress = buildingFmv * 0.9;
  }

  const marketTotal = marketValue + buildingDepreciatedValue;
  const fmvTotal = fairMarketValue + buildingFmv;
  const distressTotal = distressValueLand + buildingDistress;

  return {
    areaDhur,
    weightedRate,
    marketValue,
    fairMarketValue,
    distressValueLand,
    buildingTotalSqft,
    buildingValueGross,
    buildingDepreciatedValue,
    buildingFmv,
    buildingDistress,
    marketTotal,
    fmvTotal,
    distressTotal,
    marketRounded: ROUND_DOWN(marketTotal, -4),
    fmvRounded: ROUND_DOWN(fmvTotal, -4),
    distressRounded: ROUND_DOWN(distressTotal, -3),
  };
}

export interface ReportTotals {
  marketTotal: number;
  fmvTotal: number;
  distressTotal: number;
  perPlot: PlotValuation[];
}

export function computeReport(plots: Plot[]): ReportTotals {
  const perPlot = plots.map(computePlot);
  return {
    marketTotal: perPlot.reduce((s, p) => s + p.marketRounded, 0),
    fmvTotal: perPlot.reduce((s, p) => s + p.fmvRounded, 0),
    distressTotal: perPlot.reduce((s, p) => s + p.distressRounded, 0),
    perPlot,
  };
}

export function inWords(amount: number): string {
  const n = Math.round(amount);
  if (n === 0) return "Rupees Zero Only";
  return `Rupees ${numToWordsIN(n)} Only`;
}

// Indian-style number-to-words (Crore / Lakh / Thousand) used in the templates.
const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy",
  "Eighty", "Ninety",
];

function twoDigit(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10), o = n % 10;
  return TENS[t] + (o ? " " + ONES[o] : "");
}
function threeDigit(n: number): string {
  const h = Math.floor(n / 100), r = n % 100;
  if (h && r) return ONES[h] + " Hundred " + twoDigit(r);
  if (h) return ONES[h] + " Hundred";
  return twoDigit(r);
}
function numToWordsIN(n: number): string {
  if (n < 0) return "Minus " + numToWordsIN(-n);
  if (n < 1000) return threeDigit(n);
  if (n < 100000) {
    const t = Math.floor(n / 1000), r = n % 1000;
    return threeDigit(t) + " Thousand" + (r ? " " + threeDigit(r) : "");
  }
  if (n < 10000000) {
    const l = Math.floor(n / 100000), r = n % 100000;
    return threeDigit(l) + " Lakh" + (r ? " " + numToWordsIN(r) : "");
  }
  const c = Math.floor(n / 10000000), r = n % 10000000;
  return numToWordsIN(c) + " Crore" + (r ? " " + numToWordsIN(r) : "");
}
