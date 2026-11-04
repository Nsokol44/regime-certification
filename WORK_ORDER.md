# Work order: generic-ballot comparison for the IJF regime-certification paper

**Paper:** "Right ranking, wrong world: certifying county election forecasts by electoral regime" (N. J. Sokol). Target: *International Journal of Forecasting* (double-blind review).
**Issued:** November 4, 2026
**Goal:** Replace the oracle-only bound on poll-based forecasting with a real poll baseline and a poll-plus-signed combination. Then update the manuscript, tables, figures and code, and verify every number.

---

## 0. What is in this package

| Path | What it is |
|---|---|
| `work/` | Flat working folder. Every script runs from here, with no path changes. |
| `work/us_county_results_summary.csv` | Raw data: Heideman (2026) v1.0.0 county results, CC BY 4.0. Also in this folder: its data dictionary and gaps file. |
| `work/build_panel.py` | Builds `house_panel.csv` (county House shares, contested flag) and `environment.csv` (national environment E_t by year). |
| `work/analysis3.py` | The real-time models. Argument `base`, `weighted`, `noredist` or `onelag`; writes `results2_<opt>.csv`. |
| `work/stats.py` | Paired year-bootstrap comparisons, seed 20261104; writes `paired.csv`. |
| `work/tables.py` | Writes `tables.json`, which holds every table in the manuscript. |
| `work/figs.py` | Writes Figures 1–4 (PNG, 300 dpi, Times-style serif). |
| `work/manuscript.js` | Builds the manuscript .docx from `tables.json` and the figures. Run `node manuscript.js out.docx full` or `... anon`. All prose lives in this file. |
| `work/cover.js` | Builds the cover letter (`node cover.js cover out.docx`) and title page (`node cover.js tp out.docx`). |
| `manuscript/` | The current deliverables: full and anonymized manuscripts, title page, cover letter, and a PDF render. |

**Reproduction check.** The pipeline already reproduces `tables.json` byte for byte from the raw file. Confirm this before changing anything:

```
cd work
cp tables.json tables_ref.json
python build_panel.py us_county_results_summary.csv
for o in base weighted noredist onelag; do python analysis3.py $o; done
python stats.py && python tables.py && python figs.py
cmp tables.json tables_ref.json   # must print nothing
```

Requirements: Python 3.11+ with pandas, numpy, scipy and matplotlib; Node with `docx`.

---

## 1. Standing rules (apply throughout)

- **Real data only.** No simulated or imputed poll values. If a year's poll average cannot be sourced, leave that year out of the poll models, state which year in the paper, and do not fill it.
- **Pre-commit before scoring.** Write `POLL_DESIGN.md` (Section 3) and date it *before* running any poll model against outcomes. Do not change the specification after seeing results. If a change is unavoidable, report the original and the change side by side.
- **Real-time only.** A poll value counts only if it was published before election day of that year. Every calibration parameter for target year t uses data from years before t only.
- **Numbers unchanged unless the analysis changes them.** Existing results must still reproduce. Every number in the text must trace to a CSV/JSON output (Section 6).
- **Manuscript conventions:**
  - Times New Roman throughout.
  - No em dashes.
  - No AI-use line or generative-AI statement anywhere.
  - Code on GitHub (Nsokol44), not Zenodo. Citing the Heideman dataset's Zenodo DOI is fine, since that is a third-party data citation.
- **Neutrality.** Treat both parties symmetrically in text and figures. No partisan framing.

---

## 2. Task A: collect the generic-ballot series

Build `work/generic_ballot.csv` with one row per House election year, 1994–2024 (16 rows). Add 1990 and 1992 if available; they are not scored but help the calibration.

| Column | Content |
|---|---|
| `year` | Election year |
| `dem_pct`, `rep_pct` | Final pre-election generic congressional ballot average, Democratic and Republican, in percent |
| `dem_two_party` | dem_pct / (dem_pct + rep_pct) |
| `as_of_date` | Date of the final average, which must be on or before election day |
| `source` | Publisher and series name (e.g. RealClearPolitics final average; FiveThirtyEight generic ballot average; a published table in Bafumi, Erikson and Wlezien) |
| `source_url_or_citation` | URL or full citation |
| `notes` | Anything nonstandard (likely voters vs registered voters, a single poll used because no average exists, and so on) |

**Source rules:**
- Prefer **one consistent series** for all years. If no single series covers 1994–2024, use a published academic compilation for the early years (the Bafumi, Erikson and Wlezien papers and their replication data are the first place to look). Record the splice year in `notes` and in the paper.
- Use **final pre-election** values, not post-election revisions.
- Archive the source pages or files as you go: save a PDF or screenshot to `work/sources/` with the year in the filename.
- Have a second pass check every value against its source and record the check in `notes` ("verified against source, <date>").

---

## 3. Task B: write the pre-commitment (`work/POLL_DESIGN.md`)

Date the file, and commit it to the repo before Task C. It must fix the following.

**New environment rules**, each added to the existing `envs` dictionary in `analysis3.py`. They use the same structure model, the same counties and the same scoring as the current models.

1. **ST-poll-raw.** Ê_t = `dem_two_party` for year t, used as published.
2. **ST-poll-cal** (primary poll baseline). Ê_t = poll_t + mean(E_s − poll_s) over all earlier target years s < t that have a poll value. This calibrates the poll to the paper's environment definition: the vote-weighted contested-county House share, which differs from the national vote. Require at least 2 earlier years; otherwise fall back to ST-poll-raw and flag it.
3. **ST-poll+signed** (combination). Ê_t = w·(ST-poll-cal point) + (1 − w)·(ST-signed scenario mean), with w = inverse-MSE weights computed from each component's environment errors over earlier certified target years only. Require at least 3 earlier certified years for both components; otherwise use w = 0.5 and flag it. Clip w to [0, 1].

**Probabilities.**
- For ST-poll-raw and ST-poll-cal, use the training residual standard deviation around the single environment, exactly as `struct_persist` and `struct_oracle` do now.
- For ST-poll+signed, shift the ST-signed scenario set so its mean equals the combined point, and average over the scenarios, so its spread logic matches ST-signed.
- State these rules in the design file. Do not tune them.

**Evaluation.** Use the same 12 certified targets (2002–2024) and the same metrics: MAE, RMSE, |bias|, common share, Brier and Spearman. Run the same paired year-bootstrap (seed 20261104). Add these comparisons to `stats.py`:
- ST-poll-cal minus ST-signed, by class, for MAE and Brier
- ST-poll+signed minus ST-poll-cal, by class, for MAE and Brier
- ST-oracle minus ST-poll-cal, by class, for MAE

Also report each environment rule's mean absolute *national* environment error by class, |Ê_t − E_t| in pp, for ST-persist, ST-signed, ST-poll-cal, ST-poll+signed and ST-oracle.

**Robustness.** Run the three new rules under all four options (`base`, `weighted`, `noredist`, `onelag`) and add them to Table 5.

**Decision rule, stated in advance.** Write all three outcomes in the design file before scoring:
- If ST-poll+signed beats ST-poll-cal on midterm MAE in at least 5 of 6 midterms with a year-bootstrap interval excluding zero, the paper's headline becomes "the signed same-class prior adds information beyond polls."
- If it ties, the headline becomes "polls recover most of the gap; the signed prior is the right substitute when polls are absent," and the scope statement in the Introduction and Discussion says so.
- If ST-poll-cal is worse than ST-signed in midterms, report that directly.

---

## 4. Task C: implement and run

1. Add a loader for `generic_ballot.csv` in `analysis3.py`. Keep it keyed by year, and make sure there is no lookahead (assert that the poll used for year t is dated on or before election day of t).
2. Add the three environment rules exactly as pre-committed.
3. Map the new model keys in `tables.py` (`names` dict): `struct_poll_raw` → ST-poll-raw, `struct_poll_cal` → ST-poll-cal, `struct_poll_signed` → ST-poll+signed. Add the new rows to Tables 2, 3 and 5. Add a new **Table 6** with the national environment error by rule and class.
4. Rerun the full pipeline in the order shown in Section 0.
5. **Existing numbers must not move.** Before editing the manuscript, diff the old and new `tables.json`. Only the new rows and Table 6 may differ. If any existing value changes, stop and find out why.
6. **Figures:**
   - Add ST-poll-cal to Figure 3 (mean county error by year) as a fourth series, using the next palette color `#eda100` and a distinct marker.
   - Optionally add a small Figure 5: national environment error by year for ST-persist, ST-signed, ST-poll-cal and ST-poll+signed.

---

## 5. Task D: update the manuscript (`manuscript.js`)

Edit the prose in `manuscript.js` and rebuild with `node manuscript.js ... full` and `... anon`. Change only what the new results require.

| Location | Change |
|---|---|
| Abstract | Add one sentence with the poll result. Keep the abstract at or under 200 words. |
| Section 1, third paragraph | Add the poll comparison as part of the first or second contribution, worded according to the pre-committed decision rule. |
| Section 2.2, last two sentences | Currently say that fundamentals-only models "are the case this paper addresses." Revise to say that the paper tests both settings. |
| Section 3 | Add a paragraph describing `generic_ballot.csv`: the source or sources, any splice year, and any missing years. |
| Section 4.2 | Add the three poll rules, with formulas and the fallback rules. |
| New Section 5.4 "Polls" (renumber later subsections) | Results for poll-raw, poll-cal and poll+signed, Table 6, the paired comparisons, and the stated decision outcome. |
| Section 6.1, second paragraph | Currently argues from the oracle bound ("about 0.65 points ... beyond the signed scenario model"). Replace it with the measured poll result. |
| Section 6.4, third limitation | Currently says the oracle bound "is a bound and not a test." Replace it with the remaining limits of the poll series: the splice, likely versus registered voters, and house effects. |
| Section 6.3 (2026) | Optionally report the final 2026 generic-ballot average and the implied ST-poll-cal environment, labeled the same way as the existing scenario set (stated after election day, not a forecast of record). |
| References | Add every poll source cited, in APA style matching the existing list. Verify each reference exists, with authors, year, title, journal, volume and pages. |
| Highlights | Revise one highlight if the headline changes. Each highlight must stay at or under 85 characters. |

Also update `cover.js`: in the second paragraph of the cover letter, add one sentence with the poll result.

---

## 6. Task E: verification (required before handing back)

1. **Number trace.** Make a table (`work/NUMBER_TRACE.md`) of every number in the abstract, highlights and Sections 5–7. For each, list the file and field it comes from. Check each against the output, not against memory.
2. **Reproduction.** Run the pipeline in a fresh copy of `work/` from the raw file plus `generic_ballot.csv`, and confirm that `tables.json` matches.
3. **Render.** Convert both manuscripts to PDF and look at every page:
   - tables don't overflow the margins
   - figures are legible
   - there are no orphaned captions
   - `pdffonts` shows only Times New Roman (or Liberation Serif in a LibreOffice render); no fallback fonts
4. **Anonymization.** Search the anonymized .docx text and its metadata for "Sokol", "utk", "Nsokol44" and "ORCID"; there must be no hits. The repo link must read "[repository link removed for anonymized review]".
5. **Style.** No em dashes. No AI line. Run the voice-and-formatting pass with the Manuscript Preflight tool (`python -m preflight check` / `fix`). Language editing only: numbers and citations unchanged.

---

## 7. Also before submission (not part of the poll task)

- Create the public repo `github.com/Nsokol44/regime-certification` and push `work/` (scripts, `generic_ballot.csv`, `POLL_DESIGN.md`, `sources/`, README). Leave the raw Heideman file out of git if its size is a problem, and link the release instead.
- Confirm IJF has no APC for the subscription route and no submission or page fees (Elsevier guide for authors). The author only submits to free-to-publish journals.
- Submit the **anonymized** manuscript plus the separate title page and cover letter. IJF uses double-blind review.

---

## 8. Hand back

Return:
- updated `work/` with every output
- `POLL_DESIGN.md`, dated, plus the commit hash where it was committed
- `NUMBER_TRACE.md`
- rebuilt manuscripts (full and anonymized), title page and cover letter
- PDF renders
- a one-paragraph summary: which decision-rule outcome occurred, what changed in the headline, and anything that deviated from this order
