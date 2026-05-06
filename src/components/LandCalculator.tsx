import { useState } from "react";
import {
  SimpleUnit, UNIT_LABEL, convert, fmt,
  bkdToSqft, sqftToBkd, rapdToSqft, sqftToRapd,
  heronsArea, multiTriangleArea,
  SQFT_PER_DHUR, SQFT_PER_KATTHA, SQFT_PER_SQM,
} from "../lib/landUnits";

type SubTool = "convert" | "compound" | "area";

export default function LandCalculator() {
  const [tool, setTool] = useState<SubTool>("convert");
  return (
    <div>
      <div className="subtab-bar">
        <button className={tool === "convert" ? "active" : ""} onClick={() => setTool("convert")}>
          Unit Converter
        </button>
        <button className={tool === "compound" ? "active" : ""} onClick={() => setTool("compound")}>
          Compound (Bigha-Kattha-Dhur / Ropani-Aana-Paisa-Daam)
        </button>
        <button className={tool === "area" ? "active" : ""} onClick={() => setTool("area")}>
          Area from Triangles
        </button>
      </div>
      {tool === "convert" && <ConvertTool />}
      {tool === "compound" && <CompoundTool />}
      {tool === "area" && <AreaTool />}
    </div>
  );
}

const ALL_UNITS: SimpleUnit[] = [
  "dhur", "kattha", "bigha",
  "daam", "paisa", "aana", "ropani",
  "sqft", "sqm", "sqyard", "acre", "hectare",
];

function ConvertTool() {
  const [value, setValue] = useState<number>(1);
  const [from, setFrom] = useState<SimpleUnit>("dhur");

  return (
    <div>
      <p className="muted">
        Enter a value in any unit and see it expressed in every other unit.
      </p>
      <div className="field-grid">
        <label>Value</label>
        <input type="number" step="any" value={value || ""}
               onChange={(e) => setValue(parseFloat(e.target.value) || 0)} />
        <label>From unit</label>
        <select value={from} onChange={(e) => setFrom(e.target.value as SimpleUnit)}>
          {ALL_UNITS.map((u) => <option key={u} value={u}>{UNIT_LABEL[u]}</option>)}
        </select>
      </div>

      <div className="convert-grid">
        {ALL_UNITS.filter((u) => u !== from).map((u) => (
          <div key={u} className="convert-card">
            <div className="convert-card-unit">{UNIT_LABEL[u]}</div>
            <div className="convert-card-value">{fmt(convert(value, from, u), 6)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompoundTool() {
  const [bigha, setBigha] = useState(0);
  const [kattha, setKattha] = useState(0);
  const [dhur, setDhur] = useState(0);

  const [ropani, setRopani] = useState(0);
  const [aana, setAana] = useState(0);
  const [paisa, setPaisa] = useState(0);
  const [daam, setDaam] = useState(0);

  const bkdSqft = bkdToSqft({ bigha, kattha, dhur });
  const bkdEquivRapd = sqftToRapd(bkdSqft);

  const rapdSqft = rapdToSqft({ ropani, aana, paisa, daam });
  const rapdEquivBkd = sqftToBkd(rapdSqft);

  return (
    <div className="compound-grid">
      <div className="compound-card">
        <h3>Terai · Bigha-Kattha-Dhur → everything else</h3>
        <div className="field-grid">
          <label>Bigha</label>
          <input type="number" step="any" value={bigha || ""}
                 onChange={(e) => setBigha(parseFloat(e.target.value) || 0)} />
          <label>Kattha</label>
          <input type="number" step="any" value={kattha || ""}
                 onChange={(e) => setKattha(parseFloat(e.target.value) || 0)} />
          <label>Dhur</label>
          <input type="number" step="any" value={dhur || ""}
                 onChange={(e) => setDhur(parseFloat(e.target.value) || 0)} />
        </div>
        <div className="result-box">
          <Row k="Total Dhur" v={fmt(bkdSqft / SQFT_PER_DHUR, 4)} />
          <Row k="Total Kattha" v={fmt(bkdSqft / SQFT_PER_KATTHA, 4)} />
          <Row k="Square feet" v={fmt(bkdSqft, 2)} />
          <Row k="Square meters" v={fmt(bkdSqft / SQFT_PER_SQM, 2)} />
          <Row k="Hectares" v={fmt(bkdSqft / 107639.104, 6)} />
          <Row k="Acres" v={fmt(bkdSqft / 43560, 6)} />
          <Row
            k="Equivalent Ropani-Aana-Paisa-Daam"
            v={`${bkdEquivRapd.ropani}r · ${bkdEquivRapd.aana}a · ${bkdEquivRapd.paisa}p · ${fmt(bkdEquivRapd.daam, 2)}d`}
          />
        </div>
      </div>

      <div className="compound-card">
        <h3>Hill · Ropani-Aana-Paisa-Daam → everything else</h3>
        <div className="field-grid">
          <label>Ropani</label>
          <input type="number" step="any" value={ropani || ""}
                 onChange={(e) => setRopani(parseFloat(e.target.value) || 0)} />
          <label>Aana</label>
          <input type="number" step="any" value={aana || ""}
                 onChange={(e) => setAana(parseFloat(e.target.value) || 0)} />
          <label>Paisa</label>
          <input type="number" step="any" value={paisa || ""}
                 onChange={(e) => setPaisa(parseFloat(e.target.value) || 0)} />
          <label>Daam</label>
          <input type="number" step="any" value={daam || ""}
                 onChange={(e) => setDaam(parseFloat(e.target.value) || 0)} />
        </div>
        <div className="result-box">
          <Row k="Square feet" v={fmt(rapdSqft, 2)} />
          <Row k="Square meters" v={fmt(rapdSqft / SQFT_PER_SQM, 2)} />
          <Row k="Hectares" v={fmt(rapdSqft / 107639.104, 6)} />
          <Row k="Acres" v={fmt(rapdSqft / 43560, 6)} />
          <Row
            k="Equivalent Bigha-Kattha-Dhur"
            v={`${rapdEquivBkd.bigha}B · ${rapdEquivBkd.kattha}K · ${fmt(rapdEquivBkd.dhur, 3)}D`}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="result-row">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}

function AreaTool() {
  const [rows, setRows] = useState<{ a: number; b: number; c: number }[]>([
    { a: 0, b: 0, c: 0 },
  ]);

  const update = (i: number, side: "a" | "b" | "c", v: number) => {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [side]: v } : r)));
  };
  const add = () => setRows([...rows, { a: 0, b: 0, c: 0 }]);
  const remove = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  const totalSqft = multiTriangleArea(rows);

  return (
    <div>
      <p className="muted">
        Enter the three side lengths (in <b>rft</b>, running feet) for each triangular
        sub-plot. Heron's formula gives the area; the table sums all triangles.
      </p>
      <div className="tri-table area-tri-table">
        <div className="header">#</div>
        <div className="header">a (rft)</div>
        <div className="header">b (rft)</div>
        <div className="header">c (rft)</div>
        <div className="header">Area (sq ft)</div>
        <div className="header"></div>
        {rows.map((r, i) => {
          const area = heronsArea(r.a, r.b, r.c);
          return (
            <TriRow key={i}
              index={i}
              row={r}
              areaSqft={area}
              onChange={(s, v) => update(i, s, v)}
              onRemove={() => remove(i)}
              canRemove={rows.length > 1}
            />
          );
        })}
      </div>

      <div style={{ marginTop: 10 }}>
        <button className="btn secondary" onClick={add}>+ Add triangle</button>
      </div>

      <div className="result-box" style={{ marginTop: 18 }}>
        <Row k="Total area · sq ft" v={fmt(totalSqft, 2)} />
        <Row k="Total area · Dhur" v={fmt(totalSqft / SQFT_PER_DHUR, 4)} />
        <Row k="Total area · Kattha" v={fmt(totalSqft / SQFT_PER_KATTHA, 4)} />
        <Row k="Total area · sq m" v={fmt(totalSqft / SQFT_PER_SQM, 2)} />
        {(() => {
          const r = sqftToRapd(totalSqft);
          return <Row
            k="Total · Ropani-Aana-Paisa-Daam"
            v={`${r.ropani}r · ${r.aana}a · ${r.paisa}p · ${fmt(r.daam, 2)}d`}
          />;
        })()}
        {(() => {
          const b = sqftToBkd(totalSqft);
          return <Row
            k="Total · Bigha-Kattha-Dhur"
            v={`${b.bigha}B · ${b.kattha}K · ${fmt(b.dhur, 3)}D`}
          />;
        })()}
      </div>
    </div>
  );
}

interface TriRowProps {
  index: number;
  row: { a: number; b: number; c: number };
  areaSqft: number;
  onChange: (side: "a" | "b" | "c", value: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function TriRow({ index, row, areaSqft, onChange, onRemove, canRemove }: TriRowProps) {
  return (
    <>
      <div>{index + 1}</div>
      <input type="number" step="0.01" value={row.a || ""}
             onChange={(e) => onChange("a", parseFloat(e.target.value) || 0)} />
      <input type="number" step="0.01" value={row.b || ""}
             onChange={(e) => onChange("b", parseFloat(e.target.value) || 0)} />
      <input type="number" step="0.01" value={row.c || ""}
             onChange={(e) => onChange("c", parseFloat(e.target.value) || 0)} />
      <div className="area-cell">
        {!isFinite(areaSqft) ? <span className="err">degenerate triangle</span>
          : fmt(areaSqft, 2)}
      </div>
      <button
        type="button"
        className="btn secondary small"
        onClick={onRemove}
        disabled={!canRemove}
        title="Remove triangle"
      >
        ✕
      </button>
    </>
  );
}
