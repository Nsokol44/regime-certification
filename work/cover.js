const fs=require('fs');const {Document,Packer,Paragraph,TextRun,AlignmentType}=require('docx');
const F="Times New Roman";const r=(t,o={})=>new TextRun({text:t,font:F,size:24,bold:o.b,italics:o.i});
const P=(t,o={})=>new Paragraph({spacing:{after:200,line:276},alignment:o.a,children:Array.isArray(t)?t:[r(t,o)]});
const which=process.argv[2];
let k=[];
if(which==='cover'){k=[
P("Nicholas J. Sokol"),P("Department of Geography and Sustainability, University of Tennessee, Knoxville, TN, USA"),P("nsokol@utk.edu"),
P("To the Editor-in-Chief, International Journal of Forecasting",{i:true}),
P("Dear Editor,"),
P("I submit the manuscript “Right ranking, wrong world: certifying county election forecasts by electoral regime” for consideration as a research article in the International Journal of Forecasting."),
P("The paper addresses a forecasting failure that is easy to miss: a county model that ranks places well can still miss the level of the vote, because the national environment does not carry over from one kind of election to another. Using real-time U.S. House forecasts over 16 cycles, 1994 to 2024, I show that this common error is concentrated in midterm years, where it accounts for 26 to 29 percent of county mean squared error under pooled and persistence models, against 5 to 7 percent in presidential years. Training only on elections of the same kind does not fix it. What transfers is the environment signed by the party of the sitting president, expressed as scenarios from past same-class elections, which wins in every evaluated midterm and closes about half of the gap to an oracle environment. Measured against the real generic ballot, calibrated polls nearly match that oracle, and the signed scenarios add nothing significant beyond them, so the signed model stands as the substitute for settings where polls are absent. The paper also states and tests a simple certification rule, a form of selective prediction driven by the precedent record rather than model confidence."),
P("I believe the paper fits the journal's interest in forecast evaluation under structural change and in election forecasting. All data are public, and the full analysis, including every table and figure, reproduces from the public release files with a fixed seed; the code repository is linked in the non-anonymized title page and available to the editors for reproducibility checks."),
P("The manuscript is original, is not under consideration elsewhere, and has not been published in any form. The author received no specific funding for this work and declares no competing interests. An anonymized manuscript and a separate title page are provided for double-blind review."),
P("Thank you for your consideration."),P("Sincerely,"),P("Nicholas J. Sokol")];}
else {k=[
P([r("Right ranking, wrong world: certifying county election forecasts by electoral regime",{b:true})],{a:AlignmentType.CENTER}),
P("Nicholas J. Sokol",{a:AlignmentType.CENTER}),
P("Department of Geography and Sustainability, University of Tennessee, Knoxville, TN, USA",{a:AlignmentType.CENTER}),
P("Corresponding author: Nicholas J. Sokol, nsokol@utk.edu; ORCID: 0000-0002-4798-0056"),
P([r("Data and code availability. ",{b:true}),r("County returns: Heideman (2026), v1.0.0, CC BY 4.0. Analysis code, derived panel, tables and figures: github.com/Nsokol44/regime-certification.")]),
P([r("Funding. ",{b:true}),r("This research received no specific grant from any funding agency in the public, commercial, or not-for-profit sectors.")]),
P([r("Declaration of competing interest. ",{b:true}),r("The author declares no competing interests.")])];}
const doc=new Document({styles:{default:{document:{run:{font:F,size:24}}}},sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1440,bottom:1440,left:1440,right:1440}}},children:k}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(process.argv[3],b));
