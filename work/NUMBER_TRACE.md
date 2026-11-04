# Number trace — "Right ranking, wrong world" (IJF submission)

Compiled 2026-11-04, after the generic-ballot comparison was added. Every number
below was checked against the pipeline outputs in this folder, not against the
text of any earlier draft.

## Method

- The full pipeline (build_panel.py → analysis3.py {base, weighted, noredist,
  onelag} → stats.py → tables.py → figs.py) was rerun from the raw Heideman
  summary file twice: once before the poll models existed (output byte-identical
  to the delivered tables.json and paired.csv, `cmp` clean) and once in a fresh
  directory after (byte-identical again). All pre-existing claims therefore
  trace to tables.json / paired.csv / results2_*.csv as regenerated.
- After the poll rules were added, every pre-existing entry of tables.json
  (t1–t5) and paired.csv was re-verified unchanged; only additions appeared
  (three Table 2 rows, ten Table 3 rows, twelve robustness-table cells, and the new environment-error table).

## Pre-existing claims (verified by reproduction; source: tables.json / paired.csv)

| Claim (location) | Value | Source |
|---|---|---|
| County forecasts per model (Abstract, §4.1) | 221,584 | results2_base.csv, sum of n over certified rows |
| Common share, pooled/persistence, midterm (§5.1, Abstract) | 26–29% | tables.json t2, Common M for PC-all/other/same, ST-persist |
| Common share, presidential (§5.1, Abstract) | 5–7% | tables.json t2, Common P |
| ST-signed midterm MAE vs PC-all (§5.3, Abstract) | 6.05 vs 6.67, −0.63 [0.45, 0.77] as improvement | t2; paired.csv struct_v2_signed vs pooled_all, M, mae |
| Gap closed to oracle (§5.3) | 49% | stats.py printout: 0.4934 |
| Brier M: PC-all 0.0875, ST-signed 0.0819, oracle 0.0711 (§5.3, Abstract) | as stated | tables.json t2 |
| ST-signed |bias| M 2.60 vs PC-all 4.29; common 15.3% (§5.3) | as stated | tables.json t2 |
| Spearman ranges (§5.1) | M 0.897–0.898, P 0.890–0.892 | results2_base.csv, mean rho by model/class; unchanged across all eleven models |
| Refused years (§5.6, Table 5): 1996 PC-all 11.02; 1998 ST-signed 9.27, ST-persist 7.85; 2000 ST-signed 7.59, PC-all 7.05 | as stated | tables.json t5 |
| Robustness (§5.7, Table 6): 5.86/6.59, 6.29/7.03, 6.09/6.72; P 5.82/5.92, 5.12/5.40 | as stated | tables.json t4 |
| 2026 scenarios (§6.3): swings −1.61 to +8.03, mean +3.13, E_2024 49.2% | as stated | analysis3.py printout; environment.csv (E_2024 = 0.4923) |
| Figure 3 paragraph (§5.3): 2006 understatement 6.3–7.5 pp; 2010 swing −8.03 | as stated | results2_base.csv bias by year; environment.csv |

## New poll claims (source: results2_base.csv certified rows, paired.csv, tables.json t2/t3/t4/t6, generic_ballot.csv)

| Claim (location) | Value | Source |
|---|---|---|
| ST-poll-raw midterm MAE (§5.4) | 5.57 | t2 row ST-poll-raw; mean of results2_base mae, struct_poll_raw, M |
| ST-poll-cal midterm MAE (Abstract, §5.4) | 5.59 | t2 row ST-poll-cal |
| ST-poll+signed midterm MAE (Abstract, §5.4, §6.1) | 5.41 | t2 row ST-poll+signed |
| Oracle midterm MAE (§5.4, §6.1) | 5.40 | t2 row ST-oracle |
| Gaps to oracle (§6.1): poll-cal 0.19, poll+signed 0.01 | 5.59−5.40, 5.41−5.40 | computed from t2 |
| Poll-cal − signed, M MAE (§5.4) | −0.46 [−1.40, +0.45], 2 of 6 | paired.csv struct_poll_cal vs struct_v2_signed, M, mae |
| Poll+signed − poll-cal, M MAE (§5.4) | −0.18 [−0.58, +0.16], 5 of 6 | paired.csv, M, mae |
| Poll+signed − poll-cal, P MAE (§5.4) | −0.06 [−0.10, −0.02], 5 of 6 | paired.csv, P, mae |
| Brier M: poll-cal 0.0711, oracle 0.0711, poll+signed 0.0722, signed 0.0819 (§5.4) | as stated | t2 Brier M column |
| 2002 poll failure (§5.4): MAE 8.88, worst of set; environment 2.2 pp too Republican | 8.88; env_err −2.20 | results2_base.csv, struct_poll_cal, t=2002 |
| Largest midterm swings are 2006, 2010 (§5.4) | +4.21, −8.03 | environment.csv differences |
| Environment error M (§5.4, Table 4): persist 3.96, signed 2.59, poll-cal 1.54, poll+signed 0.59 | as stated | tables.json t6; stats.py env-error printout |
| Environment error P (Table 4): 1.96, 2.11, 0.97, 0.90 | as stated | tables.json t6 |
| 2010 environment errors (§5.4): poll-cal −2.68, signed +6.27 | as stated | results2_base.csv env_err, t=2010 |
| Combination weights (§5.4): estimated w 0.71–0.81 from 2008; fallback 0.5 for 2002, 2004, 2006 | as stated | results2_base.csv poll_w, poll_w_fallback, struct_poll_signed |
| Poll-cal fallbacks used | none | results2_base.csv poll_cal_fallback all False |
| Robustness (§5.7): poll models beat ST-signed in all four specifications; poll+signed lowest non-oracle in three of four | as stated | tables.json t4 (baseline, weighted, onelag yes; noredist no, ST-poll-raw 5.26 is lower) |
| 2026 poll statement (§6.3): final average D 52.1 / R 43.3; implied calibrated environment 54.6% | 0.5461 two-party; calibration mean over 18 earlier years −0.0002; 0.5461 − 0.0002 = 0.5459 | generic_ballot.csv row 2026; environment.csv; computed |
| Poll design facts (§3): splice at 2006; stand-ins 2008, 2012; 1992 registered voters; no missing years | as stated | generic_ballot.csv (19 rows, 1990–2026 even years); POLL_SOURCES_MEMO.md |

## Numbering note

The work order named the environment-error table "Table 6" (the sixth table
built). Because Section 5.4 sits before the refused-years and robustness
tables, that numbering would have appeared out of order (1, 2, 3, 6, 4, 5);
the preflight audit flagged it (CAPTION-ORDER). The tables were renumbered to
appearance order in the final manuscript: environment error = Table 4,
refused years = Table 5, robustness = Table 6, with all in-text references
updated. Data keys in tables.json (t4 = robustness, t5 = refused, t6 =
environment error) are unchanged.

## Form checks

- Abstract: 199 words (counted from the built docx), limit 200.
- Highlights: 73, 78, 83, 80, 82 characters, limit 85 each.
- Em dashes in the built manuscript: 0.
- Fonts: after fix_fonts.py, the only font named in any part of all four docx
  files is Times New Roman (theme Calibri defaults normalized).
- Anonymized manuscript: no occurrence of the author's name, affiliation,
  email or ORCID in any part; core author metadata "Author"; repository link
  replaced by the anonymized placeholder.
