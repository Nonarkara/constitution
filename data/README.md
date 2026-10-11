# Constitution corpus

`constitution.json` contains 279 numbered provisions, 16 chapters and a separate transitory group (`chapter: 17`). Thai text incorporates Amendment No. 1, B.E. 2564 (2021), effective 22 November 2021. It replaced sections **83, 86 and 91**.

Thai is the authoritative legal language. The English PDF is a government-published Council of State translation of the original 2017 Constitution. English in sections 83, 86 and 91 is **historical text**, identified by `englishStatus: historical-2017-replaced-in-2021`; a reader must see this notice when viewing it. This project does not claim that a generated English or Chinese text is an official translation.

## Primary sources

- Original Royal Gazette Thai text, published 6 April 2017, Senate-hosted: https://www.senate.go.th/assets/portals/1/files/1%20(1)(1).PDF
- Senate consolidated Thai edition through Amendment No. 1 (2021): https://intranet.senate.go.th/assets/portals/15/fileups/114/files/con2560edit4.pdf
- Government-published English translation, OPDC: https://www.opdc.go.th/wp-content/uploads/2024/05/CONSTITUTION.pdf — linked from https://www.opdc.go.th/knowledge/law/opdc-lawthai/
- Senate legal information centre describes its consolidated edition as amended to the present: https://www.senate.go.th/view/93/หน้าแรกศูนย์ข้อมูลด้านกฎหมาย_v2/TH-TH
- Election Commission confirms the amendment's effective date and all three amended provisions: https://www.ect.go.th/th/uthaithani/db_193_uthaithani_cms_29/29279/

Retrieved 12 October 2026. This corpus records consolidation through 2021; it does not infer the enactment of later proposed amendments. The Senate digital-media catalogue lists a July 2026 seventh edition, but this extraction uses the downloaded PDF identified by its SHA-256. No later enacted amendment was found in the primary-source searches for this build; that search is not a perpetual guarantee.

Each provision has source URLs and one-based PDF page numbers for both languages. `meta.sources` records the source PDF checksums. Source PDFs are retained for audit and rebuilding.

## Rebuild and verify

With Python 3 and PyMuPDF (`pip install pymupdf`), run:

```sh
python3 scripts/extract_constitution.py
node scripts/validate-corpus.mjs
```

The extractor downloads missing source PDFs via `curl`, removes Gazette headers, recognizes section headings in increasing numeric order (wrapped references must not become headings), removes chapter/part headings and final countersignatures, and normalizes whitespace and Thai SARA AM glyph encoding. Current amended provisions are extracted from their specific body blocks in the Senate consolidated PDF, excluding margin labels and footnotes.

This is text extraction, not a certified manual transcription. Paragraph line breaks are normalized to spaces; numbered subsection markers remain. Integrity checks verify counts, numbering, source-page metadata, chapter coverage, replacement values and translation-version labels. These checks do not certify every glyph. Legal use should consult the linked PDF.
