# Poll Sources Memo — Final Pre-Election Generic Congressional Ballot

**Collection date:** 2026-11-04. **Collector's task:** final pre-election generic-ballot
values for every even year 1994–2024, plus 1990 and 1992 (calibration only) and 2026.
**Output:** `generic_ballot.csv` (19 rows) + archived sources in `sources/`.

## Conventions used

- **Two series, one splice.** Gallup's published final pre-election generic-ballot
  estimates cover 1990–2004; RealClearPolitics (RCP) final averages cover 2006–2026.
  **The splice is at 2006.** Two documented single-poll stand-ins (Gallup finals) sit
  inside the RCP span, for 2008 and 2012, because RCP's split shares for those cycles
  could not be retrieved (margins only — see "Not retrieved" below).
- **Gallup values are Gallup's published ALLOCATED likely-voter estimates** (undecided
  allocated; the shares sum to 100). For 1994–2004 they are taken from a single uniform
  table in Gallup's Nov 1, 2004 release, "Gallup Final Pre-Election Generic Ballot,
  1994–2004". Raw (unallocated) LV results are recorded in the per-year entries.
- **RCP values are raw average shares** (Dem + Rep < 100; the remainder is
  undecided/other and polls RCP excludes). `dem_two_party` in the CSV normalizes both
  series to a common quantity: dem_pct / (dem_pct + rep_pct).
- **as_of_date** = last day of RCP's published averaging window for RCP rows; last
  field date of the final poll for Gallup rows. Every as_of_date is on or before that
  year's election day (verified programmatically at CSV build time).
- **Access note:** realclearpolitics.com itself was blocked in the collection
  environment; RCP values were taken from RealClearPolling.com, RCP's current official
  domain, which carries the same per-cycle "RCP Average" tables, plus one verbatim
  republication of RCP's historical midterm table for the 2002 cross-check.
- Values are **final pre-election figures as published**; no post-election revisions,
  no interpolation, no constructed splits. Where two credible sources disagree, both
  are reported here and the consistent-series value is in the CSV.

## Per-year entries

### 1990 — Dem 54.0 / Rep 46.0 (calibration only)
- Series/publisher: Gallup final pre-election poll, allocated likely-voter estimate.
- Citation: Gallup, "Democrats Hold Edge In House Vote" (1998-11-02), table "Generic
  Congressional Ballot 1950–1998 Final Pre-Election Figures Based on Likely Voters",
  https://news.gallup.com/poll/4144/democrats-hold-edge-house-vote.aspx
- Archive: `sources/GB_1990_Gallup.txt` (+ `sources/GB_2010_Gallup_topline_trends.txt`)
- Basis/notes: Final survey conducted Oct 25–28, 1990 (dates from Gallup's 2010 final
  topline trend table, which also lists the LV result as 54/46 with no undecided share
  reported). Corroborated by Gallup's companion 1998 release (poll 4147, same 54/46)
  and by the Rep share 46.0 in Gallup's 2004 accuracy table. One later Gallup chart
  (poll 21928) prints the 1990 final LV lead as +6 rather than +8; the three
  explicit-share tables agree on 54/46, which is what the CSV carries.
- Confidence: Medium-high.

### 1992 — Dem 51.0 / Rep 41.0 (calibration only)
- Series/publisher: Gallup final pre-election poll, **registered voters**.
- Citation: Gallup, "Control of U.S. House Looks Too Close to Call" (2004-11-01),
  final pre-election trend table, https://news.gallup.com/poll/13879/Control-US-House-Looks-Too-Close-Call.aspx
- Archive: `sources/GB_1992_Gallup.txt`
- Basis/notes: Poll conducted Oct 23–25, 1992, incl. leaners; 8% undecided/other. No
  likely-voter final for 1992 appears in the Gallup trend tables retrieved; the RV
  figure is the published final value available. Corroborated identically in Gallup's
  2012 final topline trend table.
- Confidence: Medium (RV basis; trend-table sourcing only).

### 1994 — Dem 46.5 / Rep 53.5
- Series/publisher: Gallup final pre-election poll, allocated LV estimate.
- Citation: Gallup (2004-11-01), table "Gallup Final Pre-Election Generic Ballot,
  1994–2004", URL as 1992 above.
- Archive: `sources/GB_1994_2004_Gallup.txt` (+ dates in `sources/GB_2010_Gallup_topline_trends.txt`)
- Basis/notes: Final survey Nov 2–6, 1994; raw LV (incl. leaners) 44/51 with 5%
  undecided/other per Gallup's 2010 topline trends; allocated to 46.5/53.5. The
  allocated figure is independently repeated in Gallup's 1998 release table (46.5/53.5).
- Confidence: High.

### 1996 — Dem 49.5 / Rep 50.5
- Series/publisher: Gallup allocated LV estimate (same table as 1994).
- Archive: `sources/GB_1994_2004_Gallup.txt`
- Basis/notes: Final survey Nov 3–4, 1996; raw LV 48/45 (7% undecided/other).
  (Gallup's Jan 2006 forecasting release prints a 1996 final LV lead of +3 Rep in one
  summary, inconsistent with its own allocated table; the allocated table with
  explicit shares is used.)
- Confidence: High for the table value; the internal Gallup inconsistency is noted.

### 1998 — Dem 50.0 / Rep 50.0  ⚠ source disagreement
- Series/publisher: Gallup allocated LV estimate (same uniform 1994–2004 table).
- Archive: `sources/GB_1994_2004_Gallup.txt`; contemporaneous release in
  `sources/GB_1998_Gallup.txt`; raw trend in `sources/GB_2010_Gallup_topline_trends.txt`
- Basis/notes: Final survey Oct 29–Nov 1, 1998; raw LV 49/45 (6% undecided/other) —
  agreed by the contemporaneous release and the 2010 topline trend.
  **Disagreement:** Gallup's contemporaneous release (Nov 2, 1998) states in text that
  proportional allocation of 49/45 gives **51.8 / 48.2** (its printed table row reads
  "54.8 / 48.2" with advantage 3.6 — internally inconsistent, evidently a typo for
  51.8). Gallup's later uniform tables (2004 and 2005 releases) list the 1998
  allocated final as **50.0 / 50.0**. The CSV uses 50.0/50.0 for single-table series
  consistency across 1994–2004; users who prefer the contemporaneous figure should
  substitute 51.8/48.2 (dem_two_party 0.518).
- Confidence: Medium-high (raw value certain; allocated value disputed within Gallup).

### 2000 — Dem 50.5 / Rep 49.5
- Series/publisher: Gallup allocated LV estimate (same table).
- Archive: `sources/GB_1994_2004_Gallup.txt`
- Basis/notes: Final survey Nov 5–6, 2000; raw LV 49/45 (6% undecided/other).
- Confidence: High.

### 2002 — Dem 47.0 / Rep 53.0  ⚠ cross-series disagreement
- Series/publisher: Gallup allocated LV estimate (same table).
- Archive: `sources/GB_1994_2004_Gallup.txt`; raw poll + dates in
  `sources/GB_2002_PollingReport.txt`; RCP cross-check in
  `sources/GB_2002_RCP_republication.txt`
- Basis/notes: Final CNN/USA Today/Gallup survey Oct 31–Nov 3, 2002; raw LV 45 Dem /
  51 Rep (4% other/undecided), allocated to 47.0/53.0.
  **Disagreement:** RCP's own final average for 2002 (window 10/26–11/3) was
  **Dem 46.0 / Rep 47.7** (raw shares, R +1.7), known from a verbatim republication of
  RCP's historical midterm table (SelectSmart post, May 20, 2022; its 2006–2018 rows
  match RealClearPolling exactly). The two sources disagree on the two-party split
  (Gallup allocated: Dem 47.0%; RCP raw: Dem 49.1% two-party). The CSV uses the Gallup
  value to keep 1994–2004 a single series; a RealClearPolling cycle page for 2002
  could not be located to confirm the RCP row from the publisher's own site.
- Confidence: High for the Gallup value as published; the RCP alternative is documented.

### 2004 — Dem 50.5 / Rep 49.5
- Series/publisher: Gallup final pre-election poll, allocated LV estimate.
- Archive: `sources/GB_1994_2004_Gallup.txt`
- Basis/notes: Final CNN/USA Today/Gallup poll Oct 29–31, 2004: raw LV 48/47 (5%
  undecided/other), allocated 50.5/49.5 — Gallup's headline final estimate, published
  Nov 1, 2004. RCP also ran a generic-ballot average in 2004; per FAIR's reproduction
  of RCP's history it was tied (neither party led), but its Dem/Rep split shares were
  not retrievable, so the Gallup final stands as the cycle value within the Gallup block.
- Confidence: High.

### 2006 — Dem 52.1 / Rep 40.6  ← SPLICE POINT
- Series/publisher: RealClearPolitics final average (RealClearPolling).
- Citation: RealClearPolling, "This Day In History — Generic Ballot 2026 vs. 2022,
  2018, 2014, 2010", https://www.realclearpolling.com/polls/this-day-in-history/generic-ballot/2026-vs-2022-vs-2018-vs-2014-vs-2010
- Archive: `sources/GB_2006_RCP.txt`
- Basis/notes: Averaging window 11/1–11/5/2006; raw average shares. Cross-confirmed by
  the republication of RCP's midterm table (same window and values).
- Confidence: High.

### 2008 — Dem 53.0 / Rep 41.0  (single-poll stand-in)
- Series/publisher: Gallup final pre-election poll (stand-in for the RCP average).
- Citation: Gallup, "Democrats Lead Big on Generic Ballot" (2008-11-02),
  https://news.gallup.com/poll/111709/Democrats-Lead-Big-Generic-Ballot.aspx
- Archive: `sources/GB_2008_Gallup.txt`
- Basis/notes: Gallup Poll Daily tracking Oct 31–Nov 2, 2008; Gallup's "final
  pre-election allocated estimate", traditional likely-voter model: 53/41.
  **Not retrieved:** RCP's final 2008 average split shares. RCP's final margin
  (Dem +9.0) is documented in republications of RCP's biennium table, but no
  retrievable source gives its Dem/Rep split, and a split was not constructed from
  the margin. Note the Gallup stand-in (D +12) is larger than the RCP average margin.
- Confidence: High as a Gallup final; medium as an average substitute.

### 2010 — Dem 41.3 / Rep 50.7
- Series/publisher: RCP final average. Citation: TDIH page (as 2006).
- Archive: `sources/GB_2010_RCP.txt`
- Basis/notes: Window 10/25–10/31/2010; raw shares. (For reference, Gallup's own 2010
  final poll, Oct 28–31, had LV 40/55 under its lower-turnout model — a single poll,
  not the average; not used.)
- Confidence: High.

### 2012 — Dem 49.0 / Rep 48.0  (single-poll stand-in)
- Series/publisher: Gallup final pre-election poll (stand-in for the RCP average).
- Citation: Gallup News Service, "Final Pre-Election Poll — Final Topline"
  (Timberline 937080), http://gallup.com/file/poll/158540/Congress_121106.pdf
- Archive: `sources/GB_2012_Gallup.txt`
- Basis/notes: Gallup Daily tracking Nov 1–4, 2012; Q.16/16A combined (incl. leaners),
  likely voters: Dem 49 / Rep 48 / 3% other-undecided.
  **Not retrieved:** RCP's final 2012 average split shares; its final margin (Rep +0.2)
  is documented, but no retrievable source gives the split, and none was constructed.
  (Sidebar "RCP Average 47.5/47.3" figures circulating in 2012-era RCP article PDFs are
  stale snapshots from the articles' scrape dates, not the final average — do not use.)
- Confidence: High as a Gallup final; medium as an average substitute.

### 2014 — Dem 43.2 / Rep 45.6
- Series/publisher: RCP final average. Citation: TDIH page (as 2006).
- Archive: `sources/GB_2014_RCP.txt`
- Basis/notes: Window 10/15–11/2/2014; raw shares.
- Confidence: High.

### 2016 — Dem 46.0 / Rep 45.4
- Series/publisher: RCP final average.
- Citation: RealClearPolling, "2016 Generic Congressional Vote",
  https://www.realclearpolling.com/polls/state-of-the-union/2016/generic-congressional-vote
- Archive: `sources/GB_2016_RCP.txt`
- Basis/notes: Window 11/1–11/7/2016; raw shares.
- Confidence: High.

### 2018 — Dem 49.7 / Rep 42.4
- Series/publisher: RCP final average. Citation: TDIH page (as 2006).
- Archive: `sources/GB_2018_RCP.txt`
- Basis/notes: Window 10/13–11/3/2018; raw shares.
- Confidence: High.

### 2020 — Dem 49.3 / Rep 42.5
- Series/publisher: RCP final average.
- Citation: RealClearPolling, "2020 Generic Congressional Vote",
  https://www.realclearpolling.com/polls/state-of-the-union/2020/generic-congressional-vote
- Archive: `sources/GB_2020_RCP.txt`
- Basis/notes: Window 10/25–11/2/2020; raw shares.
- Confidence: High.

### 2022 — Dem 45.5 / Rep 48.0
- Series/publisher: RCP final average.
- Citation: RealClearPolling, "2022 Generic Congressional Vote",
  https://www.realclearpolling.com/polls/state-of-the-union/2022/generic-congressional-vote
- Archive: `sources/GB_2022_RCP.txt`
- Basis/notes: Window 10/18–11/6/2022 (closes two days before election day); raw shares.
- Confidence: High.

### 2024 — Dem 46.7 / Rep 47.0
- Series/publisher: RCP final average.
- Citation: RealClearPolling, "2024 Generic Congressional Vote",
  https://www.realclearpolling.com/polls/state-of-the-union/2024/generic-congressional-vote
- Archive: `sources/GB_2024_RCP.txt`
- Basis/notes: Window 10/14–11/2/2024; raw shares.
- Confidence: High.

### 2026 — Dem 52.1 / Rep 43.3
- Series/publisher: RCP final average. Citation: TDIH page (as 2006).
- Archive: `sources/GB_2026_RCP.txt`
- Basis/notes: Window 10/9–11/1/2026, 22 polls listed on the page; raw shares.
  Cross-checks: a Nov 2, 2026 Hesitation Media summary and a Nov 3, 2026 news article
  both report the same final RCP figures (52.1/43.3, D +8.8). A Delaware Online
  snapshot published Nov 2, 2026 read 52.0/43.1 (D +8.9) — an intermediate snapshot;
  the final window value from RealClearPolling is used.
- Confidence: High.

## Not retrieved (honest gaps)

- **RCP average split shares, 2008 and 2012:** margins only (2008: Dem +9.0; 2012:
  Rep +0.2) from republications of RCP's biennium table. No retrievable page or
  document gives the Dem/Rep splits; splits were **not** constructed from margins.
  Gallup's published final polls stand in for these two cycles and are flagged in the CSV.
- **RCP average split shares, 2004:** RCP's 2004 average was tied; splits not
  retrievable. Gallup's final poll is used (it is inside the Gallup block anyway).
- **RCP 2002 from the publisher's own current site:** no RealClearPolling cycle page
  for 2002 was located; the RCP value (46.0/47.7) is documented only via republication
  and is reported as a cross-check, not used in the CSV.
- The Bafumi–Erikson–Wlezien generic-ballot compilation was not needed: Gallup's own
  published final-poll series covers 1990–2004 completely, and RCP covers 2006–2026.

## Summary

- **Coverage:** all 16 required cycles 1994–2024 are in the CSV, plus 1990, 1992
  (calibration) and 2026 — 19 rows, **no missing years**.
- **Series:** Gallup final pre-election polls (allocated LV; 1992 is RV) for
  1990–2004; RealClearPolitics final averages for 2006–2026.
- **Splice point: 2006** (first RCP cycle). Within the RCP span, 2008 and 2012 are
  flagged single-poll Gallup stand-ins because RCP's splits for those cycles are
  documented only as margins.
- **Known disagreements:** 1998 (Gallup contemporaneous allocated 51.8/48.2 vs Gallup
  uniform-table 50.0/50.0 — CSV uses the latter) and 2002 (Gallup allocated 47.0/53.0
  vs RCP average 46.0/47.7 — CSV uses the former). Both are reported in full above.
