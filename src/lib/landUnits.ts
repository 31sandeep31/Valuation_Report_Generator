// Nepali land unit conversions and Heron's formula area calculation.
//
// Nepali Terai units (Bigha-Kattha-Dhur):
//   1 Bigha   = 20 Kattha   = 6,772.63 sq m  ≈ 72,900 sq ft
//   1 Kattha  = 20 Dhur     ≈ 3,645 sq ft
//   1 Dhur                  ≈ 182.25 sq ft   (16.93 sq m)
//
// Nepali Hill / Mountain units (Ropani-Aana-Paisa-Daam):
//   1 Ropani  = 16 Aana     ≈ 5,476 sq ft    (508.72 sq m)
//   1 Aana    = 4 Paisa     ≈ 342.25 sq ft
//   1 Paisa   = 4 Daam      ≈ 85.5625 sq ft
//   1 Daam                  ≈ 21.39 sq ft
//
// International:
//   1 hectare = 10,000 sq m = 107,639 sq ft
//   1 acre    = 43,560 sq ft = 4,047 sq m

// ---- canonical: square feet -----------------------------------------------
export const SQFT_PER_DHUR = 182.25;
export const SQFT_PER_KATTHA = SQFT_PER_DHUR * 20;          // 3645
export const SQFT_PER_BIGHA = SQFT_PER_KATTHA * 20;         // 72900

export const SQFT_PER_DAAM = 21.390625;                     // 5476/256
export const SQFT_PER_PAISA = SQFT_PER_DAAM * 4;            // 85.5625
export const SQFT_PER_AANA = SQFT_PER_PAISA * 4;            // 342.25
export const SQFT_PER_ROPANI = SQFT_PER_AANA * 16;          // 5476

export const SQFT_PER_SQM = 10.7639104167097;
export const SQFT_PER_HECTARE = SQFT_PER_SQM * 10000;
export const SQFT_PER_ACRE = 43560;

// ---- Terai compound numbers ----------------------------------------------
export interface BKD { bigha: number; kattha: number; dhur: number; }
export interface RAPD { ropani: number; aana: number; paisa: number; daam: number; }

export function bkdToSqft(v: BKD): number {
  return v.bigha * SQFT_PER_BIGHA + v.kattha * SQFT_PER_KATTHA + v.dhur * SQFT_PER_DHUR;
}

export function sqftToBkd(sqft: number): BKD {
  // Decompose into integer Bigha/Kattha + fractional Dhur (kept as decimal).
  const bigha = Math.floor(sqft / SQFT_PER_BIGHA);
  let rem = sqft - bigha * SQFT_PER_BIGHA;
  const kattha = Math.floor(rem / SQFT_PER_KATTHA);
  rem -= kattha * SQFT_PER_KATTHA;
  const dhur = rem / SQFT_PER_DHUR;
  return { bigha, kattha, dhur };
}

export function rapdToSqft(v: RAPD): number {
  return (
    v.ropani * SQFT_PER_ROPANI +
    v.aana * SQFT_PER_AANA +
    v.paisa * SQFT_PER_PAISA +
    v.daam * SQFT_PER_DAAM
  );
}

export function sqftToRapd(sqft: number): RAPD {
  const ropani = Math.floor(sqft / SQFT_PER_ROPANI);
  let rem = sqft - ropani * SQFT_PER_ROPANI;
  const aana = Math.floor(rem / SQFT_PER_AANA);
  rem -= aana * SQFT_PER_AANA;
  const paisa = Math.floor(rem / SQFT_PER_PAISA);
  rem -= paisa * SQFT_PER_PAISA;
  const daam = rem / SQFT_PER_DAAM;
  return { ropani, aana, paisa, daam };
}

// ---- generic ----
export type SimpleUnit =
  | "sqft" | "sqm" | "sqyard" | "acre" | "hectare"
  | "dhur" | "kattha" | "bigha"
  | "daam" | "paisa" | "aana" | "ropani";

export const SQFT_PER_UNIT: Record<SimpleUnit, number> = {
  sqft: 1,
  sqm: SQFT_PER_SQM,
  sqyard: 9,
  acre: SQFT_PER_ACRE,
  hectare: SQFT_PER_HECTARE,
  dhur: SQFT_PER_DHUR,
  kattha: SQFT_PER_KATTHA,
  bigha: SQFT_PER_BIGHA,
  daam: SQFT_PER_DAAM,
  paisa: SQFT_PER_PAISA,
  aana: SQFT_PER_AANA,
  ropani: SQFT_PER_ROPANI,
};

export const UNIT_LABEL: Record<SimpleUnit, string> = {
  sqft: "Square feet",
  sqm: "Square meters",
  sqyard: "Square yards",
  acre: "Acres",
  hectare: "Hectares",
  dhur: "Dhur",
  kattha: "Kattha",
  bigha: "Bigha",
  daam: "Daam",
  paisa: "Paisa",
  aana: "Aana",
  ropani: "Ropani",
};

export function convert(value: number, from: SimpleUnit, to: SimpleUnit): number {
  if (from === to) return value;
  return (value * SQFT_PER_UNIT[from]) / SQFT_PER_UNIT[to];
}

// ---- Triangle area (Heron's) ----------------------------------------------
/** Returns area in square feet. a, b, c are triangle side lengths. */
export function heronsArea(a: number, b: number, c: number): number {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  // Reject degenerate triangles (one side >= sum of the other two)
  if (a + b <= c || b + c <= a || c + a <= b) return NaN;
  const s = (a + b + c) / 2;
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}

/** Sum of multiple triangles' areas (sq ft). */
export function multiTriangleArea(triangles: { a: number; b: number; c: number }[]): number {
  return triangles.reduce((sum, t) => sum + (heronsArea(t.a, t.b, t.c) || 0), 0);
}

// ---- Formatting -----------------------------------------------------------
export function fmt(n: number, decimals = 4): string {
  if (!isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
