# Pre-committed design: generic-ballot comparison for the regime-certification paper

**Date: November 4, 2026.**
**Status: written and committed to the repository (github.com/Nsokol44/regime-certification) before any poll model was run against outcomes. No poll-based score, table or figure existed when this note was written.**

This note fixes the specification for adding poll-based environment rules to the
real-time House forecasting design of "Right ranking, wrong world". If any part of
this specification has to change after results are seen, the original and the
change will be reported side by side.

## 1. Data (as collected, before scoring)

`generic_ballot.csv` holds the final pre-election generic congressional ballot
for every House cycle 1994–2024, plus 1990 and 1992 (calibration only, not
scored) and 2026 (not scored; used only for the labeled statement in Section 6.3
of the paper). No year is missing and no value is imputed or interpolated.

- 1990–2004: Gallup's published final pre-election estimates, allocated
  likely-voter shares, taken from Gallup's uniform table "Gallup Final
  Pre-Election Generic Ballot, 1994–2004" (release of November 1, 2004) and the
  corresponding Gallup historical tables for 1990 and 1992. The 1992 value is a
  registered-voter figure (Gallup published no likely-voter final for 1992 in
  the tables retrieved); it is used for calibration only.
- 2006–2024: RealClearPolitics final generic-ballot averages (raw shares),
  retrieved from RealClearPolling, with each cycle's published averaging window
  recorded in the CSV.
- **Splice at 2006.** Recorded data decisions, made before scoring:
  - 1998: Gallup's contemporaneous release allocates its final poll to
    51.8/48.2; Gallup's later uniform 1994–2004 table gives 50.0/50.0. The
    uniform-table value is used, so the Gallup span comes from one published
    presentation. 1998 is not a certified (scored) target; the value enters
    only calibration means for later years.
  - 2002: RCP's final average (46.0/47.7 raw, surviving in a republication of
    RCP's table) exists, but the Gallup value is used so the pre-2006 span
    stays a single series. The RCP span starts at 2006, the first cycle whose
    final average is retrievable from the publisher's own archive.
  - 2008 and 2012: RCP's final averages survive only as margins (Dem +9.0 in
    2008, Rep +0.2 in 2012); the split shares could not be retrieved and were
    not constructed. Gallup's final pre-election polls stand in (2008 allocated
    estimate 53/41; 2012 likely voters incl. leaners 49/48) and are flagged as
    single-poll stand-ins in the CSV and the paper.
- Every value was checked against its archived source in `sources/` in a second
  pass on 2026-11-04, and the check is recorded in the CSV notes.
- Real-time constraint: every `as_of_date` is on or before that year's election
  day; `analysis3.py` asserts this when loading the file.

## 2. The three environment rules (added to `envs` in `analysis3.py`)

All three use the paper's existing structure model, counties, training design
and scoring. Notation: `poll_t` is the two-party Democratic share of the final
generic ballot in year t; `E_t` is the paper's environment (vote-weighted
contested-county House share).

1. **ST-poll-raw.** Ê_t = poll_t, used as published.
2. **ST-poll-cal** (primary poll baseline). Ê_t = poll_t + mean(E_s − poll_s)
   over all earlier years s < t that have a poll value (1990 and 1992 included
   when available). This calibrates the poll to the paper's environment
   definition, which differs from the national vote. Fallback: with fewer than
   2 earlier poll years, use ST-poll-raw for that target and flag it.
3. **ST-poll+signed** (combination). Ê_t = w·(ST-poll-cal point) +
   (1 − w)·(ST-signed scenario mean), with w from inverse-MSE weights:
   w = (1/MSE_poll) / (1/MSE_poll + 1/MSE_signed), where each MSE is that
   component's squared national environment error over earlier certified
   target years only (the poll component's error at year s is its own
   recursively computed ST-poll-cal error). Fallback: with fewer than 3
   earlier certified years for both components, w = 0.5 and the target is
   flagged. w is clipped to [0, 1].

## 3. Probabilities

- ST-poll-raw and ST-poll-cal: single-environment models; the county win
  probability uses the training residual standard deviation around the point
  forecast, exactly as ST-persist and ST-oracle do.
- ST-poll+signed: the ST-signed scenario set is shifted so its mean equals the
  combined point, and probabilities average over the shifted scenarios, so the
  spread logic matches ST-signed.

These rules are fixed. They will not be tuned.

## 4. Evaluation (fixed in advance)

- Same 12 certified targets (2002–2024), same metrics: MAE, RMSE, |bias|,
  common share, Brier, Spearman.
- Same paired year-bootstrap as `stats.py` (seed 20261104, 10,000 draws).
  Added comparisons:
  - ST-poll-cal minus ST-signed, by class, for MAE and Brier;
  - ST-poll+signed minus ST-poll-cal, by class, for MAE and Brier;
  - ST-oracle minus ST-poll-cal, by class, for MAE.
- Each environment rule's mean absolute national environment error by class,
  |Ê_t − E_t| in pp, for ST-persist, ST-signed, ST-poll-cal, ST-poll+signed
  and ST-oracle (new Table 6).
- Robustness: the three new rules run under all four existing options (base,
  weighted, noredist, onelag) and join the robustness table (Table 5).
- Figure 3 gains ST-poll-cal as a fourth series (color #eda100, distinct
  marker). A Figure 5 (national environment error by year) may be added.

## 5. Decision rule (stated before scoring)

- If ST-poll+signed beats ST-poll-cal on midterm MAE in at least 5 of 6
  midterms with a year-bootstrap interval excluding zero, the paper's headline
  becomes: the signed same-class prior adds information beyond polls.
- If it ties, the headline becomes: polls recover most of the gap; the signed
  prior is the right substitute when polls are absent. The scope statement in
  the Introduction and Discussion will say so.
- If ST-poll-cal is worse than ST-signed in midterms, that is reported
  directly.

## 6. Invariants

- Existing results must still reproduce: after the new rules are added, every
  pre-existing entry of `tables.json` and `paired.csv` must be unchanged.
- Real data only. No simulated or imputed poll values anywhere in the pipeline.
