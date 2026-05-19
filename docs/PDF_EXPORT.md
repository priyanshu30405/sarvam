# Exporting submission docs to PDF

Use **one** of these workflows (whichever is fastest on your machine).

## Option A — From the browser (simplest)

1. Open `docs/SUBMISSION.md` or `docs/CONSOLIDATED_FOR_PDF.md` in **Cursor / VS Code** preview, or paste the Markdown into **StackEdit**, **Dillinger**, or GitHub (rendered README on a gist).
2. **Print → Save as PDF** from the browser.
3. Zoom to ~100%, ensure headings and the links table are not clipped.

## Option B — Pandoc (if installed)

From the repo root:

```powershell
pandoc docs/CONSOLIDATED_FOR_PDF.md -o CompanyX-Frontend-Submission.pdf --pdf-engine=xelatex
```

If you do not have LaTeX, try:

```powershell
pandoc docs/CONSOLIDATED_FOR_PDF.md -o submission.html
```

Then open `submission.html` in a browser and print to PDF.

## Option C — Word / Google Docs

Paste the Markdown (or the rendered preview text) into a document, apply **Heading 1 / 2** styles to match structure, insert the links as **hyperlinks**, then export as PDF.
