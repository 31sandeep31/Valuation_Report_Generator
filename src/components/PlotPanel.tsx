import { useState } from "react";
import { Plot, Triangle, Building, BuildingFloor } from "../types";

type SubTab = "details" | "boundary" | "field" | "cad" | "lalpurja" | "building";

interface Props {
  plot: Plot;
  onChange: (next: Plot) => void;
}

export default function PlotPanel({ plot, onChange }: Props) {
  const [tab, setTab] = useState<SubTab>("details");

  const update = (patch: Partial<Plot>) => onChange({ ...plot, ...patch });

  const updateBoundary = (k: keyof Plot["boundary"], v: string) =>
    update({ boundary: { ...plot.boundary, [k]: v } });

  const updateLalpurja = (k: keyof Plot["lalpurjaArea"], v: number) =>
    update({ lalpurjaArea: { ...plot.lalpurjaArea, [k]: v } });

  const updateTriangle = (
    list: "fieldTriangles" | "cadastralTriangles",
    idx: number,
    side: keyof Triangle,
    value: number,
  ) => {
    const next = plot[list].map((t, i) =>
      i === idx ? { ...t, [side]: value } : t,
    );
    update({ [list]: next } as Partial<Plot>);
  };

  return (
    <div>
      <div className="subtab-bar">
        <button className={tab === "details" ? "active" : ""} onClick={() => setTab("details")}>Details</button>
        <button className={tab === "boundary" ? "active" : ""} onClick={() => setTab("boundary")}>Boundaries</button>
        <button className={tab === "field" ? "active" : ""} onClick={() => setTab("field")}>Field Triangles</button>
        <button className={tab === "cad" ? "active" : ""} onClick={() => setTab("cad")}>Cadastral Triangles</button>
        <button className={tab === "lalpurja" ? "active" : ""} onClick={() => setTab("lalpurja")}>Lalpurja Area</button>
        <button className={tab === "building" ? "active" : ""} onClick={() => setTab("building")}>Building</button>
      </div>

      {tab === "details" && (
        <div className="field-grid two">
          <label>Location</label>
          <input type="text" value={plot.location}
                 onChange={(e) => update({ location: e.target.value })} />

          <label>Plot No.</label>
          <input type="text" value={plot.plotNo}
                 onChange={(e) => update({ plotNo: e.target.value })} />

          <label>Area (per certificate)</label>
          <input type="text" value={plot.areaCertificate}
                 onChange={(e) => update({ areaCertificate: e.target.value })} />

          <label>Importance</label>
          <input type="text" value={plot.importance}
                 onChange={(e) => update({ importance: e.target.value })} />

          <label>Access in Blueprint</label>
          <input type="text" value={plot.accessBlueprint}
                 onChange={(e) => update({ accessBlueprint: e.target.value })} />

          <label>Access at Site</label>
          <input type="text" value={plot.accessSite}
                 onChange={(e) => update({ accessSite: e.target.value })} />

          <label>Market rate per Dhur (NRs)</label>
          <input type="number" value={plot.marketRatePerDhur || ""}
                 onChange={(e) => update({ marketRatePerDhur: parseFloat(e.target.value) || 0 })} />

          <label>Govt/Malpot rate per Kattha (NRs)</label>
          <input type="number" value={plot.govtRateTotal || ""}
                 onChange={(e) => update({ govtRateTotal: parseFloat(e.target.value) || 0 })} />

          <label>Accessibility paragraph</label>
          <textarea rows={3} value={plot.accessibilityText}
                    onChange={(e) => update({ accessibilityText: e.target.value })} />
        </div>
      )}

      {tab === "boundary" && (
        <div className="field-grid two">
          <label>East</label>
          <input type="text" value={plot.boundary.east}
                 onChange={(e) => updateBoundary("east", e.target.value)} />
          <label>West</label>
          <input type="text" value={plot.boundary.west}
                 onChange={(e) => updateBoundary("west", e.target.value)} />
          <label>North</label>
          <input type="text" value={plot.boundary.north}
                 onChange={(e) => updateBoundary("north", e.target.value)} />
          <label>South</label>
          <input type="text" value={plot.boundary.south}
                 onChange={(e) => updateBoundary("south", e.target.value)} />
        </div>
      )}

      {(tab === "field" || tab === "cad") && (
        <div>
          <div className="tri-table">
            <div className="header">Triangle</div>
            <div className="header">a (rft)</div>
            <div className="header">b (rft)</div>
            <div className="header">c (rft)</div>
            {(tab === "field" ? plot.fieldTriangles : plot.cadastralTriangles).map((t, i) => (
              <TriangleRow
                key={i}
                index={i}
                value={t}
                onChange={(side, v) => updateTriangle(
                  tab === "field" ? "fieldTriangles" : "cadastralTriangles",
                  i, side, v,
                )}
              />
            ))}
          </div>
          {tab === "cad" && (
            <p className="muted" style={{ marginTop: 12 }}>
              Leave all 0 to reuse Field Triangles for cadastral calc.
            </p>
          )}
        </div>
      )}

      {tab === "lalpurja" && (
        <div className="field-grid two">
          <label>Bigha</label>
          <input type="number" step="0.01" value={plot.lalpurjaArea.bigha || ""}
                 onChange={(e) => updateLalpurja("bigha", parseFloat(e.target.value) || 0)} />
          <label>Kattha</label>
          <input type="number" step="0.01" value={plot.lalpurjaArea.kattha || ""}
                 onChange={(e) => updateLalpurja("kattha", parseFloat(e.target.value) || 0)} />
          <label>Dhur</label>
          <input type="number" step="0.01" value={plot.lalpurjaArea.dhur || ""}
                 onChange={(e) => updateLalpurja("dhur", parseFloat(e.target.value) || 0)} />
        </div>
      )}

      {tab === "building" && (
        <BuildingForm
          building={plot.building}
          onChange={(b) => update({ building: b })}
        />
      )}
    </div>
  );
}

interface TriRowProps {
  index: number;
  value: Triangle;
  onChange: (side: keyof Triangle, v: number) => void;
}

function TriangleRow({ index, value, onChange }: TriRowProps) {
  return (
    <>
      <div>#{index + 1}</div>
      <input type="number" step="0.01" value={value.a || ""}
             onChange={(e) => onChange("a", parseFloat(e.target.value) || 0)} />
      <input type="number" step="0.01" value={value.b || ""}
             onChange={(e) => onChange("b", parseFloat(e.target.value) || 0)} />
      <input type="number" step="0.01" value={value.c || ""}
             onChange={(e) => onChange("c", parseFloat(e.target.value) || 0)} />
    </>
  );
}

interface BuildingFormProps {
  building: Building;
  onChange: (b: Building) => void;
}

function BuildingForm({ building, onChange }: BuildingFormProps) {
  const set = (patch: Partial<Building>) => onChange({ ...building, ...patch });
  const updateFloor = (i: number, key: keyof BuildingFloor, value: string | number) => {
    const floors = building.floors.map((f, idx) =>
      idx === i ? { ...f, [key]: value } : f,
    );
    set({ floors });
  };
  const addFloor = () => {
    const labels = ["G. F.", "F. F.", "S. F.", "T. F.", "Fourth F.", "Fifth F."];
    const next = labels[building.floors.length] ?? `Floor ${building.floors.length + 1}`;
    set({ floors: [...building.floors, { label: next, area: 0 }] });
  };
  const removeFloor = (i: number) =>
    set({ floors: building.floors.filter((_, idx) => idx !== i) });

  if (!building.enabled) {
    return (
      <div>
        <p className="muted">No building on this plot.</p>
        <button className="btn" onClick={() => set({ enabled: true })}>
          + Add building
        </button>
      </div>
    );
  }

  const totalSqft = building.floors.reduce((s, f) => s + (f.area || 0), 0);

  return (
    <div>
      <div className="row-buttons" style={{ marginBottom: 10 }}>
        <button className="btn secondary" onClick={() => set({ enabled: false })}>
          Remove building
        </button>
      </div>
      <div className="field-grid two">
        <label>Construction type</label>
        <input type="text" value={building.constructionType}
               onChange={(e) => set({ constructionType: e.target.value })} />
        <label>Stories (text, e.g. "Three")</label>
        <input type="text" value={building.storiesText}
               onChange={(e) => set({ storiesText: e.target.value })} />
        <label>Year of construction</label>
        <input type="number" value={building.yearOfConstruction || ""}
               onChange={(e) => set({ yearOfConstruction: parseInt(e.target.value, 10) || 0 })} />
        <label>Age (years ago)</label>
        <input type="number" value={building.ageYears || ""}
               onChange={(e) => set({ ageYears: parseFloat(e.target.value) || 0 })} />
        <label>Rate per sq ft (NRs)</label>
        <input type="number" value={building.ratePerSqft || ""}
               onChange={(e) => set({ ratePerSqft: parseFloat(e.target.value) || 0 })} />
        <label>Depreciation %/yr</label>
        <input type="number" step="0.1" value={building.depreciationPctPerYear || ""}
               onChange={(e) => set({ depreciationPctPerYear: parseFloat(e.target.value) || 0 })} />
      </div>

      <div className="section-title" style={{ marginTop: 14 }}>Floor areas (sq ft)</div>
      <div className="tri-table" style={{ gridTemplateColumns: "120px 1fr 60px" }}>
        <div className="header">Floor</div>
        <div className="header">Area (sq ft)</div>
        <div className="header"></div>
        {building.floors.map((f, i) => (
          <FloorRow key={i}
            floor={f}
            onChange={(k, v) => updateFloor(i, k, v)}
            onRemove={() => removeFloor(i)}
            canRemove={building.floors.length > 1}
          />
        ))}
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btn secondary" onClick={addFloor}>+ Add floor</button>
        <span className="muted">Total: <b>{totalSqft.toLocaleString()}</b> sq ft</span>
      </div>
    </div>
  );
}

interface FloorRowProps {
  floor: BuildingFloor;
  onChange: (k: keyof BuildingFloor, v: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
}
function FloorRow({ floor, onChange, onRemove, canRemove }: FloorRowProps) {
  return (
    <>
      <input type="text" value={floor.label}
             onChange={(e) => onChange("label", e.target.value)} />
      <input type="number" step="any" value={floor.area || ""}
             onChange={(e) => onChange("area", parseFloat(e.target.value) || 0)} />
      <button type="button" className="btn secondary small"
              disabled={!canRemove} onClick={onRemove}>✕</button>
    </>
  );
}
