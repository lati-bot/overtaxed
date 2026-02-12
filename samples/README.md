# Overtaxed PDF Restructure — Sample Files

These sample PDFs illustrate the before/after of the proposed PDF restructure (see `../PDF-RESTRUCTURE-PROPOSAL.md`). They use **fake data** for a fictional Houston property at 1234 Oak Street.

## Files

### `current-sample.pdf` (3 pages) — The "Before"
Approximation of the current monolithic PDF that mixes everything together:
- **Page 1:** Branded header, property summary cards, breakdown tables, legal brief, comps table
- **Page 2:** 5-step filing instructions with dense paragraphs and jargon (iSettle, ARB, iFile, §42.26)
- **Page 3:** Hearing script (serif font, dashed box), colored info boxes, miscellaneous bullets

**Problem it shows:** Everything in one document. The appraiser sees your hearing script. The homeowner sees legal jargon. Nobody knows where to start.

### `proposed-guide.pdf` (2 pages) — The "Quick Start Guide"
What the homeowner reads. NOT submitted to anyone.
- **Page 1:** Hero block with savings, 3 big numbered steps, form-filling box, account number prominently displayed, "worries" FAQ table
- **Page 2:** Hearing script (what to say), pushback response table

**What changed:** 5 steps → 3. Jargon eliminated. Clear separation between "your instructions" and "your evidence." Feels like an Apple product manual.

### `proposed-evidence.pdf` (2 pages) — The "Evidence Packet"
What gets uploaded to HCAD and brought to hearings. Professional, authoritative.
- Clean header: "2025 Tax Year — Uniform & Equal Analysis"
- Subject property box
- 3-part Statement of Unequal Appraisal (modeled on Deji's winning format)
- 9-comp table with account numbers
- Statistical summary
- No Overtaxed branding in header (small footer credit only)
- B&W friendly, no emojis, no colored instruction boxes

**What changed:** Looks like a real appraisal report, not a startup's marketing PDF. No filing instructions or hearing scripts cluttering the evidence.

## How These Were Made
Generated with Python + ReportLab. Source: `generate_pdfs.py` in this folder.

## Purpose
Share with Deji and other users for feedback on the structural split before implementation.
