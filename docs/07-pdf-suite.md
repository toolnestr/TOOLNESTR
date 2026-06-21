# 07 — PDF Suite (iLovePDF-style)

You asked for the full iLovePDF toolset. I checked iLovePDF's actual tool list and tested
feasibility. **Short answer: I can build ~80% of it to run 100% in the visitor's browser**
(fast, free, private — files never upload). A handful (Office-format conversions) genuinely
need a server or a paid conversion API; those are clearly marked and deferred.

## Legend
- ✅ **Browser** = runs fully client-side, free, works now (libraries: `pdf-lib`, `pdf.js`,
  `jsPDF`, `Tesseract.js` for OCR, `qpdf-wasm` for passwords).
- 🟠 **Heavy but doable** = client-side but needs a bigger library/WASM download.
- ⛔ **Needs server / paid API** = can't be done well for free in-browser (fidelity requires
  LibreOffice/Ghostscript on a server, or a paid API like CloudConvert/ConvertAPI).

## Group 1 — Organize (all ✅ Browser)
| Tool | Feasible? | Notes |
|------|-----------|-------|
| Merge PDF | ✅ | Combine files in chosen order |
| Split PDF | ✅ | By page range or into single pages |
| Remove Pages | ✅ | Delete selected pages |
| Extract Pages | ✅ | Pull out chosen pages |
| Organize / Reorder PDF | ✅ | Drag-and-drop page reorder, rotate, delete |
| Scan to PDF | ✅ | Uses device camera (getUserMedia) → PDF |

## Group 2 — Optimize
| Tool | Feasible? | Notes |
|------|-----------|-------|
| Compress PDF | ✅ (good for image-heavy) | Downsample/re-encode images via canvas. Won't beat server compression on text-only PDFs, but works well on the common case |
| OCR PDF (make scans searchable) | 🟠 | `Tesseract.js` WASM — works, downloads ~2–5MB + language data |
| Repair PDF | 🟠 | Limited; can re-save/recover some files, not all |

## Group 3 — Convert TO PDF
| Tool | Feasible? | Notes |
|------|-----------|-------|
| JPG/PNG to PDF | ✅ | Very high demand, easy |
| HTML to PDF | ✅ | From URL/pasted HTML (browser render → PDF); layout fidelity ~good |
| Word to PDF (.docx) | ⛔ | Needs LibreOffice/server or paid API for fidelity |
| Excel to PDF | ⛔ | Server/paid API |
| PowerPoint to PDF | ⛔ | Server/paid API |

## Group 4 — Convert FROM PDF
| Tool | Feasible? | Notes |
|------|-----------|-------|
| PDF to JPG/PNG | ✅ | Render pages to images (pdf.js) |
| PDF to Word (.docx) | ⛔ | Real conversion needs server/paid API. (A rough text-only export is possible but low quality) |
| PDF to Excel | ⛔ | Table extraction — server/paid API |
| PDF to PowerPoint | ⛔ | Server/paid API |
| PDF to PDF/A | ⛔ | Needs Ghostscript/server |

## Group 5 — Edit (✅ Browser, but more UI work)
| Tool | Feasible? | Notes |
|------|-----------|-------|
| Edit PDF (add text/images/shapes) | ✅ 🟠 | Doable with pdf-lib + canvas overlay; bigger build |
| Rotate PDF | ✅ | Easy |
| Add Page Numbers | ✅ | Easy |
| Add Watermark (text/image) | ✅ | Easy |
| Crop PDF | ✅ | Adjust page boxes |

## Group 6 — Security
| Tool | Feasible? | Notes |
|------|-----------|-------|
| Protect PDF (password) | 🟠 | `qpdf-wasm` encrypts in-browser (~heavier download) |
| Unlock PDF (remove known password) | 🟠 | `qpdf-wasm` / pdf.js with password |
| Sign PDF | ✅ | Draw/upload signature, place on page, flatten |
| Redact PDF | ✅ 🟠 | Cover + rasterize page so hidden text is truly removed |
| Compare PDF | ✅ | Render both, visual diff |

## Group 7 — Advanced
| Tool | Feasible? | Notes |
|------|-----------|-------|
| Fill PDF Forms | ✅ | pdf-lib reads/fills form fields |
| Create PDF Forms | 🟠 | Possible, larger build |
| AI Summarizer / Translate PDF | ⛔ (AI) | Deferred with other AI tools |

## What this means for our plan

**We CAN build, free + in-browser (the money-makers, ~22 tools):**
Merge, Split, Remove Pages, Extract Pages, Organize/Reorder, Rotate, Page Numbers, Watermark,
Crop, Compress, JPG↔PDF, PDF→JPG, HTML→PDF, Sign, Redact, Compare, Fill Forms, Scan-to-PDF,
OCR, Protect, Unlock, Repair.

**We DEFER (need a server or paid API):**
Word/Excel/PowerPoint ↔ PDF, PDF/A. These are the only true gaps. Options when we get there:
1. **Skip them** (the browser-native 22 already cover most search demand), or
2. **Add a paid conversion API** (CloudConvert / ConvertAPI have free tiers ~25–500
   conversions/day) routed through our backend, or
3. **Run our own converter** (a small LibreOffice service) — most work, lowest cost at scale.

**Recommendation:** build the 22 browser-native PDF tools first (they're high-traffic and cost
nothing), launch and rank them, then decide on Office conversions once we see real demand and
have ad revenue to cover an API. The Office conversions are also where a **backend** earns its
keep — see [08-backend-admin.md](08-backend-admin.md).

## SEO note
Each PDF tool is its own page (`/pdf/merge-pdf`, `/pdf/jpg-to-pdf`, …) with intro + how-to +
FAQ — same recipe as other tools. PDF keywords are competitive (Smallpdf/iLovePDF), so we win
with long-tail ("merge 2 pdf files", "jpg to pdf without losing quality", "remove pages from
pdf free") and the privacy angle ("files never leave your device").
