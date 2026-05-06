import { useState } from "react";
import { ValuationReport, emptyPlot } from "../types";
import PlotPanel from "./PlotPanel";

const MAX_PLOTS = 5;

interface Props {
  report: ValuationReport;
  onChange: (next: ValuationReport) => void;
}

export default function PlotsTab({ report, onChange }: Props) {
  const [active, setActive] = useState(0);

  const setPlotCount = (n: number) => {
    n = Math.max(1, Math.min(MAX_PLOTS, n));
    let plots = [...report.plots];
    while (plots.length < n) plots.push(emptyPlot());
    if (plots.length > n) plots = plots.slice(0, n);
    if (active >= n) setActive(n - 1);
    onChange({ ...report, plots });
  };

  const updatePlot = (idx: number, plot: typeof report.plots[number]) => {
    const next = report.plots.map((p, i) => (i === idx ? plot : p));
    onChange({ ...report, plots: next });
  };

  return (
    <div>
      <div className="field-grid two">
        <label>Number of plots (1–{MAX_PLOTS})</label>
        <input
          type="number"
          min={1}
          max={MAX_PLOTS}
          value={report.plots.length}
          onChange={(e) => setPlotCount(parseInt(e.target.value, 10) || 1)}
          style={{ maxWidth: 90 }}
        />
      </div>
      {report.plots.length > 2 && (
        <div className="notice">
          Plots 3+ are computed in code and appended to the report as a
          <b> "Additional Plots"</b> section with per-plot Market / FMV /
          Distress values plus a grand total over all {report.plots.length} plots.
          Plot 1 + Plot 2 still use the template's live formulas.
        </div>
      )}

      <div className="plot-tabs">
        {report.plots.map((_, i) => (
          <button
            key={i}
            className={i === active ? "active" : ""}
            onClick={() => setActive(i)}
          >
            Plot {i + 1}
          </button>
        ))}
      </div>

      <PlotPanel
        plot={report.plots[active]}
        onChange={(p) => updatePlot(active, p)}
      />
    </div>
  );
}
