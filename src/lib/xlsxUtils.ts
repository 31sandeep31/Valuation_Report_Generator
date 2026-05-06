// Helpers shared by reportGenerator and photoGenerator.
import ExcelJS from "exceljs";

export async function fetchTemplate(name: string): Promise<ArrayBuffer> {
  // Vite serves /public at the root; relative URLs work with `base: "./"` for
  // any deploy path.
  const url = `${import.meta.env.BASE_URL}templates/${name}`;
  const r = await fetch(url);
  if (!r.ok) {
    throw new Error(`Failed to fetch template ${name}: HTTP ${r.status}`);
  }
  return await r.arrayBuffer();
}

/**
 * Resolve a cell coordinate to its writable target.
 * If the cell is inside a merged range, return the merge's top-left coord.
 * (ExcelJS in some versions tolerates writing to merged cells, but always
 * targeting the top-left is safer.)
 */
export function resolveWritable(
  worksheet: ExcelJS.Worksheet,
  coord: string,
): string {
  // Walk merge ranges (worksheet.model.merges is an array of "A1:B2" strings)
  const merges: string[] = (worksheet.model as any).merges || [];
  for (const merge of merges) {
    if (cellInMerge(coord, merge)) {
      const [topLeft] = merge.split(":");
      return topLeft;
    }
  }
  return coord;
}

function cellInMerge(coord: string, merge: string): boolean {
  const [from, to] = merge.split(":");
  const f = splitCell(from);
  const t = splitCell(to);
  const c = splitCell(coord);
  return (
    c.col >= f.col && c.col <= t.col && c.row >= f.row && c.row <= t.row
  );
}

function splitCell(coord: string): { col: number; row: number } {
  const m = /^([A-Z]+)(\d+)$/.exec(coord);
  if (!m) throw new Error(`Bad cell coord: ${coord}`);
  return { col: colLettersToIndex(m[1]), row: parseInt(m[2], 10) };
}

function colLettersToIndex(letters: string): number {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

export function setCell(
  worksheet: ExcelJS.Worksheet,
  coord: string,
  value: string | number | undefined | null,
): void {
  if (value === undefined || value === null) return;
  const target = resolveWritable(worksheet, coord);
  // Write empty string by clearing the cell so blank fields actually appear blank.
  if (typeof value === "string" && value === "") {
    worksheet.getCell(target).value = null;
    return;
  }
  worksheet.getCell(target).value = value as any;
}

/**
 * Like setCell but skips empty strings, preserving the template default.
 * Use this for fields where a blank form input means "leave whatever the
 * template said" rather than "make this blank".
 */
export function setCellIfFilled(
  worksheet: ExcelJS.Worksheet,
  coord: string,
  value: string | number | undefined | null,
): void {
  if (value === undefined || value === null) return;
  if (typeof value === "string" && value === "") return;
  const target = resolveWritable(worksheet, coord);
  worksheet.getCell(target).value = value as any;
}

export function setFormula(
  worksheet: ExcelJS.Worksheet,
  coord: string,
  formula: string,
): void {
  const target = resolveWritable(worksheet, coord);
  worksheet.getCell(target).value = { formula } as any;
}

export function safeFilename(name: string): string {
  return (
    name
      .split("")
      .map((c) =>
        /[A-Za-z0-9 _-]/.test(c) ? c : "_",
      )
      .join("")
      .trim() || "Client"
  );
}
