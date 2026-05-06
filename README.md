# Vansavali Web — Browser Edition

Browser-based valuation report generator. Same outputs as the Python/Tkinter
version (`Report.xlsx` + `Photo.xlsx` for Nepal SBI Bank land valuations) but
runs entirely client-side in the browser — no server, no database, no upload
of customer data anywhere. Drop the static build on any host (Netlify,
Vercel, GitHub Pages, S3+CloudFront, plain Nginx) and it works.

## Stack

- **Vite + React + TypeScript** for the UI shell
- **ExcelJS** for reading/writing `.xlsx` (preserves formulas + merged cells)
- **file-saver** for triggering downloads
- **No backend.** Templates are static files in `public/templates/` that the
  page fetches at runtime; photos are read from a `<input type="file">`
  picker and never leave the browser.

## Folder layout

```
system_web/
├── public/templates/      Report_1plot.xlsx, Report_2plot.xlsx, Photo_1plot.xlsx, Photo_2plot.xlsx
├── src/
│   ├── App.tsx            tab shell
│   ├── main.tsx           React entry
│   ├── styles.css
│   ├── types.ts           TypeScript interfaces (mirror models.py)
│   ├── cellMap.ts         anchor cell coordinates (mirror cell_map.py)
│   ├── lib/
│   │   ├── xlsxUtils.ts       fetchTemplate / setCell / merged-cell helper
│   │   ├── reportGenerator.ts builds Report.xlsx from form state
│   │   └── photoGenerator.ts  builds Photo.xlsx + embeds photos
│   └── components/
│       ├── ClientTab.tsx
│       ├── PlotsTab.tsx
│       ├── PlotPanel.tsx
│       ├── CommentsTab.tsx
│       └── GenerateTab.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.node.json
└── README.md
```

## Local development

```bash
cd system_web
npm install
npm run dev          # http://localhost:5173 (hot reload)
```

## Production build

```bash
npm run build        # outputs to dist/
npm run preview      # serves dist/ on http://localhost:4173 for verification
```

`dist/` is fully self-contained; you can copy it to any static host.

## Deploy

### GitHub Pages

```bash
npm run build
# push dist/ as gh-pages branch
git -C dist init && git -C dist add . && git -C dist commit -m "deploy"
git -C dist push -f git@github.com:<you>/<repo>.git HEAD:gh-pages
```

The `vite.config.ts` uses `base: "./"` so the build works from any
sub-path (Pages typically serves at `/repo-name/`).

### Netlify

Connect the repo, set:
- Build command: `npm run build`
- Publish directory: `dist`

### Vercel

Import the repo, framework preset = "Vite", outputs to `dist`. Done.

### Plain Nginx / Apache / S3

Copy `dist/` to the document root. Make sure `.xlsx` is served with
`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
(Vite's `index.html` already references templates correctly).

## Usage

1. Open the deployed page in any modern browser (Chrome, Edge, Firefox, Safari).
2. **Tab 1** — Client / Bank / Engineer / Submitter. Defaults are pre-filled
   for Sandeep Kafle / Mansang Engineering Consult.
3. **Tab 2** — set plot count (1–5) and fill each plot's location, plot no,
   area, market rate, malpot rate, boundaries, triangle measurements,
   lalpurja area.
4. **Tab 3** — section-11 comments, then upload land photos using the file
   picker. Choose **all** photos at once; they sort alphabetically — first
   six go to plot 1, next six to plot 2, etc.
5. **Tab 4** — click **Generate**. The browser produces and downloads
   `<JobName> - Report.xlsx` and `<JobName> - Photo.xlsx`.
6. Open the downloaded files in Excel — formulas (areas via Heron's formula,
   weighted rates 80/20, market / fair-market / distress values, totals,
   summary, in-words) recalculate automatically.

Click **Load sample (Jeshika Subedi)** on Tab 4 to pre-fill the form with
the reference dataset.

## How input maps to Excel cells

The generator only writes to a small set of "anchor" cells that the 268
internal formulas read from. See `src/cellMap.ts` for the full map.

| Input | 1-plot | 2-plot |
|---|---|---|
| Date | N9 | N8 |
| Client name | H178 | H168 |
| Owner | H179 | H169 |
| Address | H180 | H170 |
| Plot 1 location / no / area | H181 / H182 / H183 | H171 / H172 / H173 |
| Plot 2 location / no / area | – | H213 / H214 / H215 |
| Phone | D20 | D19 |
| Engineer name / title / NEC | B45 / B46 / B47 | B44 / B45 / B46 |
| Field triangles (a, b, c) | D/F/H 187, 188 | D/F/H 177, 178 |
| Cadastral triangles | D/F/H 198, 199 | D/F/H 190, 191 |
| Lalpurja Bigha / Kattha / Dhur | E/H/K 193 | E/H/K 183 |
| Market rate per Dhur | K232 | K264, K312 |
| Govt malpot rate (÷ 20) | K240 | K272, K320 |
| Boundaries (E/W/N/S) | E/G/J/L 114 | row 114 (P1), row 116 (P2) |

Cells inside merged ranges are auto-redirected to the merge's top-left by
`xlsxUtils.resolveWritable`.

## Limitations

- **Plot count > 2** uses the 2-plot template; the GUI shows a notice and
  plots 3–5 must be appended manually in the generated `.xlsx` (or the
  templates extended). Same limitation as the Python edition.
- **Building/structure valuation** isn't wired up in the form yet (the
  template's building section stays blank → values default to 0).
- **No persistence.** Reload = fresh form. Add `localStorage` if needed.
- **Photo dimensions** are forced to 700 × 525 px to match the original
  templates' grid. Source photos can be any reasonable resolution; they
  are scaled.

## Privacy

Everything (templates, photos, generated files) lives in the browser tab.
No network requests after the initial page + template load. Closing the
tab discards everything.
