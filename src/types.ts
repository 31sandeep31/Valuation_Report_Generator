// Data model for the valuation report (mirrors system/src/models.py)

export interface Triangle {
  a: number;
  b: number;
  c: number;
}

export interface LalpurjaArea {
  bigha: number;
  kattha: number;
  dhur: number;
}

export interface Boundary {
  east: string;
  west: string;
  north: string;
  south: string;
}

export interface BuildingFloor {
  label: string;        // "G. F.", "F. F.", "S. F.", "T. F."
  area: number;         // sq ft
}

export interface Building {
  enabled: boolean;
  constructionType: string;     // "Framed Structure", "Load Bearing", etc.
  storiesText: string;          // "Three", "Two & Half"
  floors: BuildingFloor[];      // per-floor areas
  yearOfConstruction: number;   // numeric year
  ageYears: number;             // years since construction
  ratePerSqft: number;          // NRs per sq ft
  depreciationPctPerYear: number; // typically 2.0 for RCC
}

export interface Plot {
  location: string;
  plotNo: string;
  areaCertificate: string;
  marketRatePerDhur: number;
  govtRateTotal: number; // malpot rate; the report formula divides this by 20
  importance: string;
  accessBlueprint: string;
  accessSite: string;
  boundary: Boundary;
  fieldTriangles: Triangle[];
  cadastralTriangles: Triangle[];
  lalpurjaArea: LalpurjaArea;
  accessibilityText: string;
  building: Building;
}

export interface Engineer {
  name: string;
  title: string;
  necRegd: string;
}

export interface Submitter {
  name: string;
  address: string;
  contact: string;
  email: string;
}

export interface Bank {
  name: string;
  branch: string;
}

export interface Comments {
  importance: string;
  nearnessToRiver: string;
  highTensionLine: string;
  landslideFlood: string;
  monumentArea: string;
  otherComments: string;
}

export interface ValuationReport {
  jobName: string;
  reportDate: string;
  visitDate: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  ownerName: string;
  propertyType: string;
  bank: Bank;
  engineer: Engineer;
  submitter: Submitter;
  plots: Plot[];
  comments: Comments;
  // Photos uploaded by user (one File per land photo); first 6 -> plot 1, next 6 -> plot 2
  photos: File[];
}

// Helpers ------------------------------------------------------------------
export const emptyTriangle = (): Triangle => ({ a: 0, b: 0, c: 0 });
export const emptyBoundary = (): Boundary => ({ east: "", west: "", north: "", south: "" });
export const emptyLalpurja = (): LalpurjaArea => ({ bigha: 0, kattha: 0, dhur: 0 });

export const emptyBuilding = (): Building => ({
  enabled: false,
  constructionType: "Framed Structure",
  storiesText: "",
  floors: [
    { label: "G. F.", area: 0 },
    { label: "F. F.", area: 0 },
    { label: "S. F.", area: 0 },
  ],
  yearOfConstruction: 0,
  ageYears: 0,
  ratePerSqft: 0,
  depreciationPctPerYear: 2.0,
});

export const emptyPlot = (): Plot => ({
  location: "",
  plotNo: "",
  areaCertificate: "",
  marketRatePerDhur: 0,
  govtRateTotal: 0,
  importance: "Residential Purposed",
  accessBlueprint: "Yes",
  accessSite: "Yes",
  boundary: emptyBoundary(),
  fieldTriangles: [emptyTriangle(), emptyTriangle()],
  cadastralTriangles: [emptyTriangle(), emptyTriangle()],
  lalpurjaArea: emptyLalpurja(),
  accessibilityText: "",
  building: emptyBuilding(),
});

export const defaultReport = (): ValuationReport => ({
  jobName: "Client",
  reportDate: "",
  visitDate: "",
  clientName: "",
  clientAddress: "",
  clientPhone: "",
  ownerName: "",
  propertyType: "Land Only",
  bank: { name: "", branch: "" },
  engineer: { name: "Sandeep Kafle", title: "Civil Engineer", necRegd: "97322" },
  submitter: {
    name: "Mansang Engineering Consult",
    address: "Waling 01, Syangja",
    contact: "9847513054",
    email: "sandeepkafle31@gmail.com",
  },
  plots: [emptyPlot()],
  comments: {
    importance: "Residential Purposed",
    nearnessToRiver: "Far",
    highTensionLine: "None",
    landslideFlood: "Nill",
    monumentArea: "N/A",
    otherComments: "",
  },
  photos: [],
});
