import { ChangeEvent } from "react";
import { ValuationReport } from "../types";

interface Props {
  report: ValuationReport;
  onChange: (next: ValuationReport) => void;
}

export default function CommentsTab({ report, onChange }: Props) {
  const setCm = (k: keyof ValuationReport["comments"], v: string) =>
    onChange({ ...report, comments: { ...report.comments, [k]: v } });

  const onPhotosChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    onChange({ ...report, photos: files });
  };

  const clearPhotos = () =>
    onChange({ ...report, photos: [] });

  const sortedNames = [...report.photos]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((f) => f.name);

  return (
    <div>
      <div className="section-title">COMMENTS (Section 11)</div>
      <div className="field-grid two">
        <label>Importance</label>
        <input type="text" value={report.comments.importance}
               onChange={(e) => setCm("importance", e.target.value)} />
        <label>Nearness to river</label>
        <input type="text" value={report.comments.nearnessToRiver}
               onChange={(e) => setCm("nearnessToRiver", e.target.value)} />
        <label>High-tension line</label>
        <input type="text" value={report.comments.highTensionLine}
               onChange={(e) => setCm("highTensionLine", e.target.value)} />
        <label>Landslide / flood</label>
        <input type="text" value={report.comments.landslideFlood}
               onChange={(e) => setCm("landslideFlood", e.target.value)} />
        <label>Monument area</label>
        <input type="text" value={report.comments.monumentArea}
               onChange={(e) => setCm("monumentArea", e.target.value)} />
        <label>Other comments</label>
        <input type="text" value={report.comments.otherComments}
               onChange={(e) => setCm("otherComments", e.target.value)} />
      </div>

      <div className="section-title">PHOTOS</div>
      <p className="muted" style={{ marginBottom: 8 }}>
        Pictorial views: 6 photos per plot, ordered SE, S, SW, NW, N, NE.
        First 6 (alphabetical) → Plot 1; next 6 → Plot 2, etc.
      </p>
      <div className="file-input">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/jpg,image/bmp,.jpg,.jpeg,.png,.bmp"
          onChange={onPhotosChange}
        />
        <button className="btn secondary" onClick={clearPhotos}>Clear</button>
        <span className="muted">{report.photos.length} selected</span>
      </div>
      {sortedNames.length > 0 && (
        <div className="file-list">
          <ol>
            {sortedNames.map((n) => <li key={n}>{n}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}
