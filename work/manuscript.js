const fs = require('fs');
const D = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, BorderStyle, ImageRun, LineRuleType, PageBreak, Footer, PageNumber } = D;
const T = JSON.parse(fs.readFileSync('tables.json', 'utf8'));
const F = "Times New Roman";
const SZ = 24;
const MODE = process.argv[3] || 'full'; // full | anon
const run = (t, o = {}) => new TextRun({ text: t, font: F, size: o.size || SZ, bold: o.b, italics: o.i, superScript: o.sup, subScript: o.sub });
// inline markup: *italic*, **bold**
function parse(s, size) {
  const out = []; const re = /(\*\*[^*]+\*\*|\*[^*]+\*|_\{[^}]+\})/g; let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(run(s.slice(last, m.index), { size }));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(run(tok.slice(2, -2), { b: true, size })); else if (tok.startsWith('_{')) out.push(run(tok.slice(2, -1), { sub: true, i: /^[a-z]/.test(tok.slice(2,-1)), size })); else out.push(run(tok.slice(1, -1), { i: true, size }));
    last = m.index + tok.length;
  }
  if (last < s.length) out.push(run(s.slice(last), { size }));
  return out;
}
const DS = { line: 480, lineRule: LineRuleType.AUTO };
const P = (s, o = {}) => new Paragraph({ spacing: { ...DS, after: 0 }, indent: o.noindent ? undefined : { firstLine: 720 }, alignment: o.align, children: parse(s) });
const PN = (s) => P(s, { noindent: true });
const H1 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(s, { b: true })] });
const H2 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(s, { b: true, i: true })] });
const bd = { style: BorderStyle.SINGLE, size: 4, color: "000000" }, nb = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
function table(widths, rows, caption, note) {
  const total = widths.reduce((a, b) => a + b, 0);
  const tr = rows.map((r, i) => new TableRow({
    tableHeader: i === 0, children: r.map((c, j) => new TableCell({
      width: { size: widths[j], type: WidthType.DXA },
      borders: { top: i === 0 ? bd : nb, bottom: (i === 0 || i === rows.length - 1) ? bd : nb, left: nb, right: nb },
      margins: { top: 40, bottom: 40, left: 80, right: 80 },
      children: [new Paragraph({ alignment: j === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, children: [run(c, { size: 20, b: i === 0 })] })]
    }))
  }));
  const out = [new Paragraph({ spacing: { before: 240, after: 120 }, keepNext: true, children: parse(caption) }),
  new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, rows: tr })];
  if (note) out.push(new Paragraph({ spacing: { before: 80, after: 240 }, children: parse(note, 20) }));
  return out;
}
function figure(file, w, h, caption) {
  return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240 }, keepNext: true, children: [new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: w, height: h } })] }),
  new Paragraph({ spacing: { before: 120, after: 240 }, children: parse(caption) })];
}
const k = [];
// ---------- Title page ----------
k.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [run("Right ranking, wrong world: certifying county election forecasts by electoral regime", { b: true, size: 28 })] }));
if (MODE === 'full') {
  k.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [run("Nicholas J. Sokol")] }));
  k.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [run("Department of Geography and Sustainability, University of Tennessee, Knoxville, TN, USA", { i: true })] }));
  k.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 }, children: [run("Corresponding author: nsokol@utk.edu; ORCID: 0000-0002-4798-0056")] }));
}
k.push(new Paragraph({ spacing: { before: 240, after: 120 }, children: [run("Abstract", { b: true })] }));
k.push(PN("County election forecasts can rank places well and still miss the level of the vote, because the national environment that sets the level does not carry over from one kind of election to another. We test this in a real-time design over 16 U.S. House cycles, 1994 to 2024, with 221,584 county forecasts per model in the 12 evaluated cycles. Pooled models with a single intercept, and models that carry the last national result forward, put 26 to 29 percent of their county mean squared error in a common national component in midterm years, against 5 to 7 percent in presidential years. Labeling the regime alone does not help: an unsigned same-class environment is no better than pooling. What transfers is the environment signed by the party of the sitting president, expressed as scenarios from past same-class elections. That model cuts midterm county error by 0.63 points against pooling in all six evaluated midterms, closes about half of the gap to an oracle environment, and improves the Brier score from 0.0875 to 0.0819. It gives no gain in presidential years, where swings carry no consistent sign. A certification rule that requires two same-class precedents refuses the one case, 1998, in which a single precedent produced the worst forecast of the set."));
k.push(new Paragraph({ spacing: { before: 240 }, children: [run("Keywords: ", { b: true }), run("election forecasting; regime shift; selective prediction; midterm elections; county; forecast evaluation")] }));
k.push(new Paragraph({ spacing: { before: 240, after: 120 }, children: [run("Highlights", { b: true })] }));
["County error from the national environment concentrates in midterm years.",
  "Labeling the regime is not enough: unsigned same-class pooling does no better.",
  "Swings signed by the president's party close half the midterm gap to an oracle.",
  "The signed model gives no gain in presidential years, where swings have no sign.",
  "A certification rule refuses forecasts that rest on a single same-class precedent."].forEach(h =>
    k.push(new Paragraph({ bullet: { level: 0 }, children: [run(h)] })));
k.push(new Paragraph({ children: [new PageBreak()] }));

// ---------- 1 Introduction ----------
k.push(H1("1. Introduction"));
k.push(P("A county election forecast does two jobs at once. It ranks places, saying which counties will vote more Democratic than others, and it sets a level, saying how Democratic the country as a whole will be. The two jobs draw on different information. County rank is persistent, carried by demography, settlement and long-run partisanship, and a lagged vote share recovers most of it. The level is the national environment, and it moves from one election to the next with the economy, presidential approval and the kind of election being held. A forecaster can do the first job well and the second badly, and when that happens the error is not spread across counties at random. It is shared, and it shows up as a single wave that moves every county the same way."));
k.push(P("This paper asks when that shared error is large, and what kind of model removes it. The concern is practical. Fundamentals-based county models, of the kind used for targeting, planning and market analysis as well as for forecasting, are often fitted on one kind of election and applied to another. A model trained on presidential cycles and run in a midterm year carries a presidential-year level into an election that political science has long known behaves differently (Tufte, 1975; Campbell, 1987; Erikson, 1988). Pooled regression intercepts make the transfer easy to miss, because the intercept quietly absorbs whatever average environment the training years happened to have."));
k.push(P("We make three contributions. First, we measure how county forecast error divides between a common national component and county-specific error in every combination of training and target class, using real-time U.S. House forecasts for 16 cycles from 1994 to 2024. The common component is a midterm problem: it accounts for 26 to 29 percent of county mean squared error in midterm years under pooled and persistence models, against 5 to 7 percent in presidential years. Second, we show that labeling the regime is not what fixes it. A model that learns the environment only from past elections of the same class, without regard to which party holds the presidency, does no better than pooling. What transfers is the swing signed by the president's party, the midterm penalty in forecasting form. Expressed as a set of scenarios drawn from past same-class elections, it cuts midterm county error in every evaluated midterm and closes about half of the gap to an oracle that knows the true national result. Third, we state and test a certification rule for this class of model: a forecast is issued for a regime only when at least two same-class precedents exist. The rule refuses the one case in our record, 1998, in which a single precedent produced the worst forecast of any model."));
k.push(P("The certification rule connects election forecasting to the literature on selective prediction, in which a forecaster may abstain when the evidence for a case is too thin (Chow, 1970; El-Yaniv and Wiener, 2010; Geifman and El-Yaniv, 2017). In that literature the abstention decision is usually driven by a confidence score. Here it is driven by a structural fact about the training record, the number of past elections of the same kind, which a forecaster can check before fitting anything."));

// ---------- 2 Related work ----------
k.push(H1("2. Related work"));
k.push(H2("2.1 National swing and local structure"));
k.push(P("Separating a national swing from a stable local pattern is one of the oldest ideas in electoral analysis. Uniform swing treats every constituency as moving by the same amount (Butler and Stokes, 1969), and uniform partisan swing remains a standard device for evaluating electoral systems (Gelman and King, 1994). Modern state-level forecasting models build the same separation into their structure, with a national component and correlated state deviations (Linzer, 2013; Heidemanns, Gelman and Morris, 2020). County-level forecasting is less common. Ahmed and Pesaran (2022) produced real-time county forecasts of the 2020 presidential election and found that a pooled national model with variable selection performed best, and Zeng, Zhong and Xu (2024) use transfer learning across states and elections in a spatial autoregressive model. These studies forecast presidential elections from presidential training data. None of them asks what happens when the training and target elections are of different kinds."));
k.push(H2("2.2 Midterm loss"));
k.push(P("The president's party usually loses ground in midterm elections. Tufte (1975) tied the size of the loss to presidential approval and the economy, Campbell (1987) explained it through the surge and decline of turnout and partisan intensity between presidential and midterm years, and Erikson (1988) argued that the loss reflects a penalty against the presidential party that is largely independent of the previous presidential margin. Whatever its cause, the regularity implies that the direction of a midterm swing is predictable from who holds the White House, while its size is not. Poll-based House forecasts use the generic congressional ballot to set the national environment directly (Bafumi, Erikson and Wlezien, 2010). Fundamentals-only county models do not have that input, and they are the case this paper addresses."));
k.push(H2("2.3 Forecasting under regime change and selective prediction"));
k.push(P("Forecast failure in economics is often traced to shifts in the mean of the process rather than to errors in its dynamics (Clements and Hendry, 1999), which is the same diagnosis as a misplaced national level. Evaluation practice for such settings favors genuinely out-of-sample, real-time designs (Tashman, 2000) and proper scoring rules for probabilities (Brier, 1950; Gneiting and Raftery, 2007). Selective prediction formalizes the option to abstain, trading coverage for accuracy (Chow, 1970; El-Yaniv and Wiener, 2010; Geifman and El-Yaniv, 2017). We borrow that framing but replace the confidence score with a precedent count, so that the abstention decision rests on whether the training record contains the kind of election being forecast."));

// ---------- 3 Data ----------
k.push(H1("3. Data"));
k.push(P("We use county-level U.S. House general election returns from the Heideman (2026) compilation, version 1.0.0, which assembles candidate-level results by county for every regular House general election from 1990 to 2024 in the 48 contiguous states from state election offices, OpenElections, and the MIT Election Data and Science Lab, with every source and correction logged. We use the summary file of Democratic and Republican votes by county and year. The House is the right office for this question because it is contested in every state every two years, so presidential and midterm years differ in the kind of election and not in the office or the set of states."));
k.push(P("A county enters a target year when its House contest was two-party contested in the target year and in both lag years. We drop county-years flagged as one-party races, and county-years in which part of the county lay in a district whose unopposed winner was not on the ballot. The outcome is the Democratic share of the two-party vote. The national environment in year *t*, written *E*_{t}, is the vote-weighted Democratic two-party share over all contested counties that year. It tracks the national House vote closely: 47.5 percent in the 1994 wave, 54.0 percent in 2006, 47.4 percent in 2010 and 54.0 percent in 2018 (Figure 1)."));
k.push(...figure('fig1_environment.png', 600, 258, "**Figure 1.** National environment, 1990–2024: vote-weighted Democratic two-party House share over contested counties. Circles mark presidential years and squares midterm years. Background shading marks the party of the sitting president (blue, Democratic; tan, Republican)."));
k.push(P("Table 1 lists the 16 target years. Each target is forecast from the two preceding elections, so the first target is 1994 and the panel holds between 1,888 and 2,655 counties per target. The swing column is the change in *E*_{t} from the previous election, and the signed swing multiplies it by +1 when the sitting president is a Democrat and −1 when the president is a Republican, so that a negative signed swing is a loss for the president's party. Six of the eight midterm signed swings are negative, the exceptions being 1998 and 2002. The presidential-year signed swings carry no consistent sign."));
k.push(...table([800, 1400, 1000, 1100, 1300, 1300, 1300, 1160], [["Year", "Class", "President", "Counties", "E (%)", "Swing (pp)", "Signed (pp)", "Certified"], ...T.t1],
  "**Table 1.** Target elections. *E* is the national environment; swing is the change from the previous election; signed swing is positive when the president's party gained. Certified marks targets with at least two prior same-class targets.", null));

// ---------- 4 Methods ----------
k.push(H1("4. Methods"));
k.push(H2("4.1 Real-time design"));
k.push(P("Every forecast for target year *t* uses only targets with years earlier than *t* for training, so the evaluation is real-time in the sense of Tashman (2000). The class of a target is its election type, presidential or midterm. For each target we fit the models below on three training sets: all earlier targets, earlier targets of the same class, and earlier targets of the other class. We evaluate on the 12 targets from 2002 to 2024, the years in which at least two same-class precedents exist (Section 4.4). That gives six midterm and six presidential targets and 221,584 county forecasts per model."));
k.push(H2("4.2 Models"));
k.push(P("**Pooled carry (PC).** The baseline regresses the target share on the two lagged shares with one intercept, *y*_{t} = *a* + *b*_{1}*y*_{t−2} + *b*_{2}*y*_{t−4}, fitted by least squares across the training targets. The national level of the forecast comes entirely from the intercept and the lag coefficients. We fit it on all earlier targets (PC-all), on earlier same-class targets (PC-same), and on earlier other-class targets (PC-other). PC-other applied to a midterm is the case of a model trained on presidential years and run in a midterm."));
k.push(P("**Structure plus environment (ST).** The alternative separates the two jobs. The structure model regresses each county's deviation from its year's environment on its lagged deviations, (*y*_{t} − *E*_{t}) = α + β_{1}(*y*_{t−2} − *E*_{t−2}) + β_{2}(*y*_{t−4} − *E*_{t−4}), fitted on same-class training targets. A forecast adds a predicted environment to the predicted deviation. We compare five environment rules. ST-persist carries the last environment forward, *E*_{t−2}. ST-pooled-swing adds the mean swing of all earlier targets. ST-unsigned adds each earlier same-class swing as a scenario. ST-signed, the model this paper proposes, adds each earlier same-class signed swing, converted back by the sign of the current president, as a scenario. ST-oracle uses the realized *E*_{t} and serves as a ceiling for any environment forecaster, including one built on polls."));
k.push(P("For scenario models, the point forecast is the mean over scenarios, and the probability that a county votes Democratic is the average over scenarios of a normal probability centered on the scenario forecast with the training residual standard deviation. For single-environment models the probability uses the same residual standard deviation around the point forecast. Pooled models use their own training residual standard deviation."));
k.push(H2("4.3 Error decomposition and scoring"));
k.push(P("For each target and model we report county mean absolute error and root mean squared error in percentage points, the mean county error (bias), and the Brier score for the event that the county votes Democratic. The mean squared error of a target splits exactly into the squared mean error and the variance of the error around its mean. We call the first part the common component and report its share of the mean squared error. A model whose error is dominated by the common component has the national level wrong; a model with a small common share has its remaining error in county-specific noise, which no national adjustment can remove. We also report the Spearman correlation between forecast and realized county shares, as a measure of ranking. Because the evaluation holds only six targets per class, we summarize paired model differences by their mean across target years with a year-level bootstrap interval (10,000 draws) and the number of years in which one model beats the other. These intervals describe the variation across the 12 years in the record. They are not a claim about a population of future elections."));
k.push(H2("4.4 Certification rule"));
k.push(P("A forecast for a target class is certified only when the training record holds at least two earlier targets of that class: one to estimate the environment scenarios and a second so that the scenario set is not a single precedent. Targets that fail the rule are refused. In our record the rule refuses 1994, 1996, 1998 and 2000, and certifies every target from 2002 on. We report the refused years separately (Section 5.5), so that the cost of a refusal can be compared with the forecast that would otherwise have been issued."));

// ---------- 5 Results ----------
k.push(H1("5. Results"));
k.push(H2("5.1 The common component is a midterm problem"));
k.push(P("Table 2 reports the main results over the 12 certified targets. In presidential years every model lands within a narrow band: county mean absolute error runs from 5.36 to 5.76 points, the mean absolute bias is 1.29 to 1.67 points, and the common component accounts for 4 to 9 percent of mean squared error. In midterm years the picture changes. The three pooled models and the persistence model put 26 to 29 percent of their mean squared error in the common component, with a mean absolute bias of 4.01 to 4.80 points. The oracle shows what is at stake: with the national level known, midterm county error falls to 5.40 points, essentially the presidential-year value of 5.38, and the common share falls to 5 percent (Figure 2). Midterm county error is not harder to rank. It is harder to level."));
k.push(...table([1700, 900, 900, 900, 900, 1000, 1000, 1180, 1180], [["Model", "MAE M", "MAE P", "|Bias| M", "|Bias| P", "Common M (%)", "Common P (%)", "Brier M", "Brier P"], ...T.t2],
  "**Table 2.** Forecast accuracy over the 12 certified targets, 2002–2024 (six midterm, M; six presidential, P). MAE and |Bias| are means over target years of county mean absolute error and absolute mean county error, in percentage points. Common is the share of county mean squared error in the common component.", "PC: pooled carry. ST: structure plus environment. ST-signed is the proposed model; ST-oracle uses the realized national environment."));
k.push(...figure('fig2_common_share.png', 600, 295, "**Figure 2.** Share of county mean squared error in the common national component, by model and target class, averaged over the six certified targets of each class."));
k.push(P("Ranking does not separate the models. The Spearman correlation between forecast and realized county shares is 0.897 to 0.898 in midterm years and 0.890 to 0.892 in presidential years across all eight models, because every model ranks counties from the same lagged shares. The models differ only in where they put the level and how they scale deviations around it."));
k.push(H2("5.2 Labeling the regime is not enough"));
k.push(P("A natural fix for a pooled intercept that mixes election types is to train only on elections of the same type. Table 2 shows that this does not work. PC-same, trained on earlier midterms only, has the highest midterm county error of the pooled models (6.99 points) and the largest common share (29.0 percent). ST-unsigned, which adds each earlier midterm swing as a scenario, does no better (7.00 points; 29.7 percent). The reason is visible in Table 1. Midterm swings are large, but their direction depends on which party holds the presidency. The 1994 and 2010 midterms swung strongly Republican under Democratic presidents and the 2006 and 2018 midterms swung strongly Democratic under Republican presidents. Averaged without regard to the president's party, these swings cancel, and a same-class model learns an environment near zero in a class whose environments are rarely near zero."));
k.push(H2("5.3 What transfers is the signed swing"));
k.push(P("Signing the swing by the president's party changes the result. ST-signed has the lowest midterm county error of any non-oracle model, 6.05 points, against 6.67 for PC-all and 6.81 for ST-persist. Its mean absolute midterm bias is 2.60 points, against 4.29 for PC-all, and its common share is 15.3 percent, about half the 26 to 30 percent of the alternatives. Relative to PC-all it closes 49 percent of the gap in midterm county error between pooling and the oracle. Its midterm Brier score is 0.0819, against 0.0875 for PC-all and 0.0711 for the oracle."));
k.push(P("Table 3 gives the paired comparisons. In midterm years ST-signed beats every non-oracle alternative in all six target years on county error, with year-bootstrap intervals that exclude zero in every comparison. Against PC-all the mean improvement is 0.63 points [0.45, 0.77]. Against PC-other, the presidential-trained model run in midterm years, it is 0.48 points [0.13, 0.84]. Brier comparisons point the same way. In presidential years the advantage disappears. ST-signed is indistinguishable from PC-all, PC-same, ST-persist and ST-unsigned, and it is also indistinguishable from the oracle, because in presidential years the environment is a small part of the error. The one clear presidential-year result runs the other way round: PC-other, the midterm-trained pooled model run in presidential years, is worse than ST-signed in all six years (0.41 points [0.20, 0.68]). Carrying a level across classes fails in both directions."));
k.push(...table([2700, 1200, 1000, 1000, 1700, 900], [["Comparison", "Class", "Metric", "Mean", "95% year-bootstrap", "Years won"], ...T.t3],
  "**Table 3.** Paired differences over certified target years. Negative values favor the first model. Years won counts target years in which the first model has the lower value.", null));
k.push(P("Figure 3 shows where the improvement comes from. In 2006 all three models understate the Democratic wave, by 6.3 to 7.5 points, and in 2010 all three overstate the Democratic share, ST-signed by the least. The largest single miss for every model is 2010, when the realized swing of −8.03 points was the largest in the record. ST-signed gains most in 2014, 2018 and 2022, when the record already held enough signed midterms to set the direction correctly."));
k.push(...figure('fig3_bias.png', 600, 277, "**Figure 3.** Mean county error by target year for pooled carry (PC-all), persistence (ST-persist) and signed same-class scenarios (ST-signed). Positive values overstate the Democratic share."));
k.push(H2("5.4 Scenario coverage"));
k.push(P("A scenario set drawn from a handful of past elections can fail to bracket what happens. Figure 4 plots each certified target's scenario range against the realized swing. The realized swing falls inside the range in 7 of 12 targets, 4 of 6 midterms and 3 of 6 presidential years. The misses are informative. In 2010 the realized swing of −8.03 points lay below every earlier midterm, and in 2002 the president's party gained, which only one earlier signed midterm (1998) had done. Coverage improves with the record: every target from 2014 on falls inside its range. A scenario set is a statement of the precedents, not a guarantee, and a forecaster who reports one should report how many precedents it holds."));
k.push(...figure('fig4_scenarios.png', 600, 305, "**Figure 4.** Scenario ranges of the signed same-class model (bars) and realized national swings (markers) for the 12 certified targets, with the scenario range for 2026 implied by the eight midterms of 1994–2022 under a Republican president."));
k.push(H2("5.5 What the certification rule refuses"));
k.push(P("Table 4 shows the refused years. In 1996 no same-class precedent existed and only the pooled model can be run; its county error was 11.02 points. In 1998 a single midterm precedent existed, the 1994 wave against a Democratic president. Applied to 1998, again under a Democratic president, it predicted a loss of 5.52 points for the president's party. The realized swing was a gain of 1.04 points, and the single-precedent scenario model produced the worst county error of the four models that year, 9.27 points against 7.85 for persistence. That is exactly the case the rule exists to refuse: a model that has seen one election of a kind and treats it as the pattern. In 2000 the single presidential precedent was also the weakest of the four (7.59 points against 7.05 for pooling)."));
k.push(...table([900, 1500, 1500, 1300, 1300, 1300, 1300], [["Year", "Class", "Precedents", "PC-all", "ST-persist", "ST-signed", "ST-oracle"], ...T.t5],
  "**Table 4.** County mean absolute error (pp) in the refused target years. Precedents counts earlier same-class targets.", "n/a: the model cannot be fitted without a same-class training target."));
k.push(H2("5.6 Robustness"));
k.push(P("Table 5 repeats the main comparison under three changes. Scoring each county by its total vote rather than equally leaves the midterm ordering intact (ST-signed 5.86 points against 6.59 for PC-all). Dropping the first election on new district maps (2002, 2012 and 2022), where redistricting moves counties between districts and candidates, strengthens the midterm result (6.29 against 7.03). A structure model with one lag instead of two gives the same result (6.09 against 6.72). The presidential-year result is the one that moves: under vote-weighted scoring ST-signed is slightly better than PC-all (5.82 against 5.92), and without the redistricting years it is better still (5.12 against 5.40), but no specification gives it a presidential-year advantage comparable to the midterm one."));
k.push(...table([2276, 644, 644, 644, 644, 644, 644, 644, 644, 644, 644, 644], [["Specification", "PC-all M", "ST-persist M", "ST-signed M", "ST-poll-raw M", "ST-poll-cal M", "ST-poll+signed M", "ST-oracle M", "PC-all P", "ST-signed P", "ST-poll-cal P", "ST-poll+signed P"], ...T.t4],
  "**Table 5.** Robustness of county mean absolute error (pp) over certified targets. M, midterm; P, presidential.", "The one-lag model was the first specification fitted; the two-lag model was adopted because, with a single lag, every model ranks counties identically by construction. Both are reported."));

// ---------- 6 Discussion ----------
k.push(H1("6. Discussion"));
k.push(H2("6.1 Implications for county forecasting"));
k.push(P("The results give a simple rule for fundamentals-based county models. Model the national environment as its own layer, learn it only from elections of the same kind, and express it relative to the party of the sitting president. Each part matters. A pooled intercept hides the environment inside the structure, a same-class label without a sign averages opposite waves to zero, and a sign without a class mixes presidential years, which have no consistent direction, with midterms, which do. None of this is new to students of midterm loss (Tufte, 1975; Campbell, 1987; Erikson, 1988). What the results add is a measurement of how much the omission costs a county forecaster, and where. The cost is concentrated in midterm years, where it is roughly a quarter of county mean squared error, and it is close to nothing in presidential years."));
k.push(P("Poll-based forecasters set the environment from the generic ballot (Bafumi, Erikson and Wlezien, 2010), and the oracle row of Table 2 bounds what that can buy at the county level: about 0.65 points of midterm county error beyond the signed scenario model. A forecaster with good polls should use them. A forecaster without them, or one running a county model for a purpose other than election-night prediction, can recover about half of the attainable gain from a cycle table and the identity of the president."));
k.push(H2("6.2 Certification as selective prediction"));
k.push(P("The certification rule is an abstention rule driven by the training record rather than by model confidence. Its virtue is that it can be checked before fitting. In our record it refuses four targets, costs nothing after 2000, and the one refusal that can be scored against an issued forecast, 1998, is the case in which the issued forecast would have been the worst of the set. Two precedents is a minimal requirement, not an optimal one; Figure 4 shows that scenario coverage keeps improving as the record grows, and a forecaster can attach the precedent count to every scenario set so that users see how much history stands behind it."));
k.push(H2("6.3 The 2026 midterm"));
k.push(P("The 2026 midterm is the first midterm under a Republican president since 2018. The eight signed midterm swings of 1994 to 2022, converted by the current president's party, imply a scenario set for 2026 that runs from a Democratic loss of 1.61 points to a gain of 8.03 points, with a mean gain of 3.13 points from the 2024 environment of 49.2 percent. These numbers use no 2026 data and are reported here, after election day, as the implication of the method, not as a forecast of record. Certified county returns for 2026 will allow the first out-of-sample test of the method on a midterm it did not see, and we will report that test when the returns are complete."));
k.push(H2("6.4 Limitations"));
k.push(P("Four limitations bound the results. First, the evaluation rests on six targets per class, and the year-bootstrap intervals describe variation within that record rather than sampling uncertainty about future elections. Second, county House shares carry candidate, incumbency and redistricting effects that a model built on two lags cannot remove; the oracle's midterm county error of 5.40 points is the floor that such effects impose. Third, the oracle is an upper bound on any environment forecaster, not a model of real polling error, so the comparison with poll-based forecasting is a bound and not a test. Fourth, the House is the only office studied. Senate and gubernatorial contests are held in different states each cycle, which confounds the class comparison, and presidential county returns exist only in presidential years. Extending the design to statewide offices, with state-level environments, is the natural next step."));

// ---------- 7 Conclusion ----------
k.push(H1("7. Conclusion"));
k.push(P("County election forecasts that rank well can still miss the level, and in U.S. House elections the miss is a midterm problem. Over 16 cycles, pooled and persistence models put about a quarter of their midterm county error in a single national wave, and training only on midterms does not fix it, because midterm waves point in opposite directions under presidents of opposite parties. Signing the swing by the president's party and expressing it as scenarios from past midterms halves the common error, closes about half of the gap to an oracle and wins in every evaluated midterm. Requiring two same-class precedents before forecasting a regime refuses the one forecast in the record that rested on a single precedent and would have been the worst. The broader lesson is that a forecast should carry its regime with it: what kind of election it is for, how many elections of that kind it has seen, and which way the environment is expected to point."));

// ---------- Declarations ----------
k.push(H1("Data and code availability"));
k.push(PN("The county returns are from Heideman (2026), version 1.0.0, distributed under a CC BY 4.0 license, with the upstream state sources keeping their own terms. The analysis code, the derived panel and environment series, and every table and figure in this paper are available at " + (MODE === 'full' ? "github.com/Nsokol44/regime-certification" : "[repository link removed for anonymized review]") + ". The full analysis reproduces from the public release files with fixed seeds."));
k.push(H1("Funding"));
k.push(PN("This research received no specific grant from any funding agency in the public, commercial, or not-for-profit sectors."));
k.push(H1("Declaration of competing interest"));
k.push(PN("The author declares no competing interests."));

// ---------- References ----------
k.push(H1("References"));
const refs = [
  "Ahmed, R., & Pesaran, M. H. (2022). Regional heterogeneity and U.S. presidential elections: Real-time 2020 forecasts and evaluation. *International Journal of Forecasting*, 38(2), 662–687.",
  "Bafumi, J., Erikson, R. S., & Wlezien, C. (2010). Forecasting House seats from generic congressional polls: The 2010 midterm election. *PS: Political Science & Politics*, 43(4), 633–636.",
  "Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. *Monthly Weather Review*, 78(1), 1–3.",
  "Butler, D., & Stokes, D. (1969). *Political change in Britain: Forces shaping electoral choice*. Macmillan.",
  "Campbell, J. E. (1987). The revised theory of surge and decline. *American Journal of Political Science*, 31(4), 965–979.",
  "Chow, C. K. (1970). On optimum recognition error and reject tradeoff. *IEEE Transactions on Information Theory*, 16(1), 41–46.",
  "Clements, M. P., & Hendry, D. F. (1999). *Forecasting non-stationary economic time series*. MIT Press.",
  "El-Yaniv, R., & Wiener, Y. (2010). On the foundations of noise-free selective classification. *Journal of Machine Learning Research*, 11, 1605–1641.",
  "Erikson, R. S. (1988). The puzzle of midterm loss. *Journal of Politics*, 50(4), 1011–1029.",
  "Geifman, Y., & El-Yaniv, R. (2017). Selective classification for deep neural networks. *Advances in Neural Information Processing Systems*, 30.",
  "Gelman, A., & King, G. (1994). A unified method of evaluating electoral systems and redistricting plans. *American Journal of Political Science*, 38(2), 514–554.",
  "Gneiting, T., & Raftery, A. E. (2007). Strictly proper scoring rules, prediction, and estimation. *Journal of the American Statistical Association*, 102(477), 359–378.",
  "Heideman, P. (2026). *U.S. county-level election results: President, U.S. House and U.S. Senate, 1990–2024* (Version 1.0.0) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.22976553",
  "Heidemanns, M., Gelman, A., & Morris, G. E. (2020). An updated dynamic Bayesian forecasting model for the US presidential election. *Harvard Data Science Review*, 2(4).",
  "Linzer, D. A. (2013). Dynamic Bayesian forecasting of presidential elections in the states. *Journal of the American Statistical Association*, 108(501), 124–134.",
  "Tashman, L. J. (2000). Out-of-sample tests of forecasting accuracy: An analysis and review. *International Journal of Forecasting*, 16(4), 437–450.",
  "Tufte, E. R. (1975). Determinants of the outcomes of midterm congressional elections. *American Political Science Review*, 69(3), 812–826.",
  "Zeng, H., Zhong, W., & Xu, X. (2024). Transfer learning for spatial autoregressive models with application to U.S. presidential election prediction. arXiv:2405.15600.",
];
refs.forEach(r => k.push(new Paragraph({ spacing: { ...DS, after: 0 }, indent: { left: 720, hanging: 720 }, children: parse(r) })));

const doc = new Document({
  creator: MODE === 'full' ? "Nicholas J. Sokol" : "Author",
  title: "Right ranking, wrong world",
  styles: {
    default: { document: { run: { font: F, size: SZ } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: F, size: 24, bold: true }, paragraph: { spacing: { before: 360, after: 120 }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: F, size: 24, bold: true, italics: true }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: F, size: 20 })] })] }) },
    children: k
  }]
});
Packer.toBuffer(doc).then(b => fs.writeFileSync(process.argv[2], b));
