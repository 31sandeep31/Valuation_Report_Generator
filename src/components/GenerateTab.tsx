import { useState } from "react";
import { saveAs } from "file-saver";
import { ValuationReport } from "../types";
import { generateReport } from "../lib/reportGenerator";
import { generatePhotos } from "../lib/photoGenerator";

interface Props {
  report: ValuationReport;
  onLoadSample: () => void;
}

export default function GenerateTab({ report, onLoadSample }: Props) {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<{ type: "info" | "ok" | "err"; text: string }[]>([]);

  const append = (type: "info" | "ok" | "err", text: string) =>
    setLog((prev) => [...prev, { type, text }]);

  const validate = (): string | null => {
    if (!report.clientName.trim()) return "Client name is required.";
    if (report.plots.length === 0 || !report.plots[0].plotNo.trim())
      return "Plot 1 plot-number is required.";
    return null;
  };

  const onGenerate = async () => {
    setLog([]);
    const err = validate();
    if (err) { append("err", err); return; }

    setBusy(true);
    try {
      append("info", "Generating Report.xlsx ...");
      const rep = await generateReport(report);
      saveAs(rep.blob, rep.filename);
      append("ok", `  -> downloaded ${rep.filename}`);

      append("info", "Generating Photo.xlsx ...");
      const ph = await generatePhotos(report);
      saveAs(ph.blob, ph.filename);
      append("ok", `  -> downloaded ${ph.filename}`);

      if (report.plots.length > 2) {
        append("info",
          `Note: ${report.plots.length} plots requested. Plots 1-2 use the ` +
          `template's live formulas; plots 3+ are computed in code and appended ` +
          `as 'Additional Plots' with per-plot Market / FMV / Distress + a grand ` +
          `total over all plots.`);
      }
      append("ok", "Done. Open the files in Excel to recalculate formulas.");
    } catch (e: any) {
      console.error(e);
      append("err", `ERROR: ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p>
        Click <b>Generate</b> to create <code>Report.xlsx</code> and <code>Photo.xlsx</code>;
        both files will download to your machine. Open them in Excel — the
        templates contain 157 / 268 formulas that recalculate on open
        (areas, weighted rates, Market / Fair Market / Distress values, totals).
      </p>

      <div className="row-buttons" style={{ marginTop: 12 }}>
        <button className="btn" disabled={busy} onClick={onGenerate}>
          {busy ? "Generating..." : "Generate"}
        </button>
        <button className="btn secondary" disabled={busy} onClick={onLoadSample}>
          Load sample (Jeshika Subedi)
        </button>
      </div>

      <div className="section-title" style={{ marginTop: 18 }}>Log</div>
      <div className="log">
        {log.length === 0 && <span className="muted">(idle)</span>}
        {log.map((l, i) => (
          <div key={i} className={l.type === "err" ? "err" : l.type === "ok" ? "ok" : ""}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
