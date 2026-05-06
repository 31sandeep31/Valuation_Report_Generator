// Cell coordinate maps for the Report.xlsx templates.
// Mirrors system/src/cell_map.py - any changes there must be applied here too.

export interface OnePlotMap {
  date: string;
  bankName: string;
  bankBranch: string;
  clientPhone: string; // direct cell (not formula-fed)
  propertyTypeLine: string;
  visitDateLine: string;
  accessibilityText: string;
  engineerName: string;
  engineerTitle: string;
  engineerNec: string;
  // anchor cells - source-of-truth for many formulas
  anchorClient: string;
  anchorOwner: string;
  anchorAddress: string;
  anchorLocationP1: string;
  anchorPlotNoP1: string;
  anchorAreaP1: string;
  // cover page
  coverLocation: string;
  coverContact: string;
  coverBank: string;
  coverBranch: string;
  coverSubmitterName: string;
  coverSubmitterAddr: string;
  coverContactConsultancy: string;
  coverEmail: string;
  // boundaries (1 plot)
  boundaryEast: string;
  boundaryWest: string;
  boundaryNorth: string;
  boundarySouth: string;
  // accessibility importance row
  accessImportance: string;
  accessBlueprint: string;
  accessSite: string;
  // rate cells
  rateMarketP1: string;
  rateGovtTotalCellP1: string; // we write a formula `=<value>/20` here
  // triangle slots
  triFieldP1: [string, string, string][];
  triCadP1: [string, string, string][];
  lalpurjaP1: [string, string, string]; // bigha, kattha, dhur
  // comments
  commentImportance: string;
  commentRiver: string;
  commentHighTension: string;
  commentLandslide: string;
  commentMonument: string;
  commentOther: string;
}

export interface TwoPlotMap extends Omit<OnePlotMap,
  "boundaryEast" | "boundaryWest" | "boundaryNorth" | "boundarySouth" |
  "accessImportance" | "accessBlueprint" | "accessSite"> {
  // plot-2 anchors
  anchorLocationP2: string;
  anchorPlotNoP2: string;
  anchorAreaP2: string;
  coverLocationP2: string;
  // plot-1 + plot-2 boundaries
  boundaryEastP1: string;
  boundaryWestP1: string;
  boundaryNorthP1: string;
  boundarySouthP1: string;
  boundaryEastP2: string;
  boundaryWestP2: string;
  boundaryNorthP2: string;
  boundarySouthP2: string;
  // accessibility (per plot)
  accessImportanceP1: string;
  accessBlueprintP1: string;
  accessSiteP1: string;
  accessImportanceP2: string;
  accessBlueprintP2: string;
  accessSiteP2: string;
  // rates per plot
  rateMarketP2: string;
  rateGovtTotalCellP2: string;
  // plot-2 triangles
  triFieldP2: [string, string, string][];
  triCadP2: [string, string, string][];
  lalpurjaP2: [string, string, string];
}

// 1-plot template (based on Rupandehi Land/Report.xlsx)
export const ONE_PLOT: OnePlotMap = {
  date: "N9",
  bankName: "B11",
  bankBranch: "B12",
  clientPhone: "D20",
  propertyTypeLine: "B21",
  visitDateLine: "C30",
  accessibilityText: "B39",
  engineerName: "B45",
  engineerTitle: "B46",
  engineerNec: "B47",

  anchorClient: "H178",
  anchorOwner: "H179",
  anchorAddress: "H180",
  anchorLocationP1: "H181",
  anchorPlotNoP1: "H182",
  anchorAreaP1: "H183",

  coverLocation: "C56",
  coverContact: "C65",
  coverBank: "C69",
  coverBranch: "C70",
  coverSubmitterName: "C75",
  coverSubmitterAddr: "C76",
  coverContactConsultancy: "C77",
  coverEmail: "C78",

  boundaryEast: "E114",
  boundaryWest: "G114",
  boundaryNorth: "J114",
  boundarySouth: "L114",

  accessImportance: "E102",
  accessBlueprint: "I102",
  accessSite: "L102",

  rateMarketP1: "K232",
  rateGovtTotalCellP1: "K240",

  triFieldP1: [
    ["D187", "F187", "H187"],
    ["D188", "F188", "H188"],
  ],
  triCadP1: [
    ["D198", "F198", "H198"],
    ["D199", "F199", "H199"],
  ],
  lalpurjaP1: ["E193", "H193", "K193"],

  commentImportance: "H149",
  commentRiver: "H150",
  commentHighTension: "H151",
  commentLandslide: "H152",
  commentMonument: "H153",
  commentOther: "H154",
};

// 2-plot template (based on Parasi 2-Land/Report.xlsx)
export const TWO_PLOT: TwoPlotMap = {
  date: "N8",
  bankName: "B10",
  bankBranch: "B11",
  clientPhone: "D19",
  propertyTypeLine: "B20",
  visitDateLine: "C29",
  accessibilityText: "B38",
  engineerName: "B44",
  engineerTitle: "B45",
  engineerNec: "B46",

  anchorClient: "H168",
  anchorOwner: "H169",
  anchorAddress: "H170",
  anchorLocationP1: "H171",
  anchorPlotNoP1: "H172",
  anchorAreaP1: "H173",
  anchorLocationP2: "H213",
  anchorPlotNoP2: "H214",
  anchorAreaP2: "H215",

  coverLocation: "C57",
  coverLocationP2: "C58",
  coverContact: "C64",
  coverBank: "C68",
  coverBranch: "C69",
  coverSubmitterName: "C74",
  coverSubmitterAddr: "C75",
  coverContactConsultancy: "C76",
  coverEmail: "C77",

  boundaryEastP1: "E114",
  boundaryWestP1: "G114",
  boundaryNorthP1: "J114",
  boundarySouthP1: "L114",
  boundaryEastP2: "E116",
  boundaryWestP2: "G116",
  boundaryNorthP2: "J116",
  boundarySouthP2: "L116",

  accessImportanceP1: "E102",
  accessBlueprintP1: "I102",
  accessSiteP1: "L102",
  accessImportanceP2: "E103",
  accessBlueprintP2: "I103",
  accessSiteP2: "L103",

  rateMarketP1: "K264",
  rateGovtTotalCellP1: "K272",
  rateMarketP2: "K312",
  rateGovtTotalCellP2: "K320",

  triFieldP1: [
    ["D177", "F177", "H177"],
    ["D178", "F178", "H178"],
  ],
  triCadP1: [
    ["D190", "F190", "H190"],
    ["D191", "F191", "H191"],
  ],
  lalpurjaP1: ["E183", "H183", "K183"],

  triFieldP2: [
    ["D220", "F220", "H220"],
    ["D221", "F221", "H221"],
  ],
  triCadP2: [
    ["D231", "F231", "H231"],
    ["D232", "F232", "H232"],
  ],
  lalpurjaP2: ["E226", "H226", "K226"],

  commentImportance: "H149",
  commentRiver: "H150",
  commentHighTension: "H151",
  commentLandslide: "H152",
  commentMonument: "H153",
  commentOther: "H154",
};

// Photo.xlsx layout
export interface PhotoLayoutSlot {
  titleCells: [string, string]; // owner cell, plot info cell
  // photo anchors as ExcelJS image-anchor objects (col,row are 0-indexed)
  photoAnchors: { col: number; row: number }[];
  captionCells: string[][]; // [[row1: SE, S, SW], [row2: NW, N, NE]]
}

export const PHOTO_LAYOUT: Record<1 | 2, PhotoLayoutSlot> = {
  1: {
    titleCells: ["A1", "G1"],
    photoAnchors: [
      { col: 0, row: 1 }, { col: 4, row: 1 }, { col: 10, row: 1 },
      { col: 0, row: 18 }, { col: 4, row: 18 }, { col: 10, row: 18 },
    ],
    captionCells: [
      ["A13", "F13", "L13"],
      ["A30", "F30", "K30"],
    ],
  },
  2: {
    titleCells: ["A36", "G36"],
    photoAnchors: [
      { col: 0, row: 36 }, { col: 4, row: 36 }, { col: 10, row: 36 },
      { col: 0, row: 52 }, { col: 4, row: 52 }, { col: 10, row: 52 },
    ],
    captionCells: [
      ["A48", "F48", "L48"],
      ["A65", "F65", "K65"],
    ],
  },
};

export const PHOTO_DIRECTIONS = [
  "South-East", "South", "South-West",
  "North-West", "North", "North-East",
];
