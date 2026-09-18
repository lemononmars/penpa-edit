import fs from 'fs';

const bookPath = 'C:/Users/sakul_bp6myy0/OneDrive/Downloads/Puzzles/CB Puzzle Contest/2026/pb/book.tex';
let content = fs.readFileSync(bookPath, 'utf8');

// 1. Add Solution Cover before \include{sol_en}
const backmatterTarget = `\\backmatter
\\pagestyle{fancy}

\\include{sol_en}`;

const solutionCover = `\\backmatter

% Solution Cover Page
\\newpage
\\thispagestyle{empty}
\\begin{tikzpicture}[remember picture, overlay]
  % Full bleed background with subtle print noise
  \\fill[cbteal] (current page.south west) rectangle (current page.north east);
  \\node[anchor=center, inner sep=0pt] at (current page.center) {
    \\includegraphics[width=\\paperwidth, height=\\paperheight]{bg_noise.jpg}
  };
  
  % Frame borders
  \\draw[line width=1.2pt, cbsage!60!white] 
    ([shift={(10mm,-10mm)}]current page.north west) 
    rectangle 
    ([shift={(-10mm,10mm)}]current page.south east);
  \\draw[line width=0.5pt, cbmint!40!white] 
    ([shift={(11.8mm,-11.8mm)}]current page.north west) 
    rectangle 
    ([shift={(-11.8mm,11.8mm)}]current page.south east);

  % Central Logo
  \\node[anchor=center] at ([yshift=-40mm]current page.north) {
    \\cblogo{1.5}{cblight}
  };

  % Title & Subtitle
  \\node[anchor=center] at ([yshift=-68mm]current page.north) {
    {\\fontsize{26}{32}\\selectfont \\textbf{\\color{cblight}OFFICIAL SOLUTIONS}}
  };
  \\node[anchor=center] at ([yshift=-78mm]current page.north) {
    {\\large \\textit{\\color{cbmint}Complete Logical Answer Keys \\& Verified Solutions}}
  };
  \\draw[line width=1.2pt, cbsage] ([shift={(-60mm,-86mm)}]current page.north) -- ([shift={(60mm,-86mm)}]current page.north);

  % Section Overview Cards
  \\node[
    anchor=north,
    draw=cbsage!60!white, 
    line width=0.8pt, 
    fill=cbdarkteal, 
    rounded corners=2.5mm, 
    inner sep=3.5mm, 
    text width=155mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-100mm]current page.north) {
    \\textbf{\\color{cbmint}\\large Competition Rounds 1--4} \\hfill {\\color{cbsage}\\footnotesize \\textbf{46 TOURNAMENT GRIDS}} \\\\[1.5mm]
    {\\color{cblight}\\footnotesize Official competition answer keys for Popular Picks, Shading Showcase, Penta Party (Metapuzzle), and Warped Words.}
  };

  \\node[
    anchor=north,
    draw=cbsage!60!white, 
    line width=0.8pt, 
    fill=cbdarkteal, 
    rounded corners=2.5mm, 
    inner sep=3.5mm, 
    text width=155mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-138mm]current page.north) {
    \\textbf{\\color{cbmint}\\large Special Section: Choco Banana City Bus} \\hfill {\\color{cbsage}\\footnotesize \\textbf{25 OMNIBUS GRIDS}} \\\\[1.5mm]
    {\\color{cblight}\\footnotesize Comprehensive solutions across the entire graded bus line from $7\\times 7$ starters to the $5\\times 35$ expressway.}
  };

  \\node[
    anchor=north,
    draw=cbsage!60!white, 
    line width=0.8pt, 
    fill=cbdarkteal, 
    rounded corners=2.5mm, 
    inner sep=3.5mm, 
    text width=155mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-176mm]current page.north) {
    \\textbf{\\color{cbmint}\\large Special Section: Logic Showcase} \\hfill {\\color{cbsage}\\footnotesize \\textbf{47 HYBRID GRIDS}} \\\\[1.5mm]
    {\\color{cblight}\\footnotesize Full visual deduction keys for the avant-garde Logic Showcase series (LS 49--LS 75), including the 50-Story Tower.}
  };

  % Bottom note
  \\node[anchor=center] at ([yshift=-232mm]current page.north) {
    {\\small \\color{cbsage}All solutions mathematically checked and independently verified $\\bullet$ Zero guessing required}
  };
\\end{tikzpicture}
\\null

\\pagestyle{fancy}

\\include{sol_en}`;

if (!content.includes(backmatterTarget)) {
  console.error('Could not find backmatter target in book.tex');
  process.exit(1);
}
content = content.replace(backmatterTarget, solutionCover);

// 2. Replace Advertisement + Score Record with Simple Page
const adStartMarker = '% =========================================================================\n% ADVERTISEMENT: CODE BREAKER PUZZLE UNIVERSE';
const backCoverMarker = '% =========================================================================\n% OUTSIDE BACK COVER (PAGE 48)';

const pAd = content.indexOf(adStartMarker);
const pBack = content.indexOf(backCoverMarker);

if (pAd === -1 || pBack === -1) {
  console.error('Could not find ad/back cover markers');
  process.exit(1);
}

const interiorDiscoverPage = `% =========================================================================
% DISCOVER MORE FROM CODE BREAKER (INTERIOR CONTENT PAGE)
% =========================================================================
\\newpage
\\thispagestyle{fancy}
\\fancyhf{}
\\fancyhead[LE,RO]{\\footnotesize Discover More from Code Breaker}
\\fancyhead[RE,LO]{\\footnotesize Code Breaker II}
\\fancyfoot[LE,RO]{\\footnotesize Page \\thepage}
\\fancyfoot[CE,CO]{\\footnotesize Code Breaker Logic Puzzle Contest II}
\\fancyfoot[RE,LO]{\\footnotesize Official Competition Book}

\\begin{center}
  \\cblogo{0.9}{cbdarkteal} \\\\[2mm]
  {\\LARGE \\textbf{\\color{cbdarkteal}Discover More from Code Breaker}} \\\\[1mm]
  {\\color{cbocean}\\normalsize Thailand's Premier Logic Puzzle Publication Series}
\\end{center}

\\vspace{1.5mm}

\\noindent
\\begin{tcolorbox}[
  colback=cblight!40!white,
  colframe=cbdarkteal,
  boxrule=0.8pt,
  arc=2mm,
  left=3.5mm, right=3.5mm, top=2.5mm, bottom=2.5mm
]
  \\textbf{\\color{cbdarkteal}\\large Code Breaker Logic Puzzle Contest I} \\hfill \\textbf{\\color{cbocean}\\footnotesize COMPENDIUM I} \\\\[1.5mm]
  {\\small The legendary first edition booklet featuring 40 handcrafted Nikoli-style logic puzzles, championship speed tests, and detailed walkthroughs by Thailand's national puzzle champions.}
\\end{tcolorbox}

\\vspace{1.5mm}

\\noindent
\\begin{tcolorbox}[
  colback=cblight!40!white,
  colframe=cbdarkteal,
  boxrule=0.8pt,
  arc=2mm,
  left=3.5mm, right=3.5mm, top=2.5mm, bottom=2.5mm
]
  \\textbf{\\color{cbdarkteal}\\large Mastering Grid Logic: Yajilin, Slitherlink \\& Nurikabe} \\hfill \\textbf{\\color{cbocean}\\footnotesize GUIDEBOOK} \\\\[1.5mm]
  {\\small From foundational loop logic to advanced World Puzzle Championship (WPC) techniques. Contains over 150 graded practice grids with full step-by-step logic chains.}
\\end{tcolorbox}

\\vspace{1.5mm}

\\noindent
\\begin{tcolorbox}[
  colback=cblight!40!white,
  colframe=cbdarkteal,
  boxrule=0.8pt,
  arc=2mm,
  left=3.5mm, right=3.5mm, top=2.5mm, bottom=2.5mm
]
  \\textbf{\\color{cbdarkteal}\\large Polyomino Metapuzzles: Pentomino Odyssey} \\hfill \\textbf{\\color{cbocean}\\footnotesize METAPUZZLE} \\\\[1.5mm]
  {\\small Explore the ultimate fusion of spatial tiling and classic Japanese grid genres. Features 12 interconnected puzzle suites, multi-grid interactions, and 3D folding challenges.}
\\end{tcolorbox}

\\vspace{1.5mm}

\\noindent
\\begin{tcolorbox}[
  colback=cblight!40!white,
  colframe=cbdarkteal,
  boxrule=0.8pt,
  arc=2mm,
  left=3.5mm, right=3.5mm, top=2.5mm, bottom=2.5mm
]
  \\textbf{\\color{cbdarkteal}\\large Official Acrylic Pentomino Set \\& Solver Tools} \\hfill \\textbf{\\color{cbocean}\\footnotesize EQUIPMENT} \\\\[1.5mm]
  {\\small Precision laser-cut 12-piece acrylic pentomino sets, competition grid rulers, and transparent overlay solver sheets designed specifically for tabletop puzzle contests.}
\\end{tcolorbox}

\\vspace{2.5mm}

\\noindent
\\begin{tcolorbox}[
  colback=cbdarkteal!10!white,
  colframe=cbdarkteal,
  boxrule=0.8pt,
  arc=2mm,
  left=4mm, right=4mm, top=3mm, bottom=3mm
]
  \\begin{minipage}[t]{0.48\\linewidth}
    \\textbf{\\color{cbdarkteal}\\normalsize Follow the Community} \\\\[1.5mm]
    {\\small\\texttt{facebook.com/CodeBreakerPuzzles}} \\\\[1mm]
    {\\footnotesize NK Board Game Seacon Bangkae}
  \\end{minipage}%
  \\hfill
  \\begin{minipage}[t]{0.48\\linewidth}
    \\textbf{\\color{cbdarkteal}\\normalsize Orders \\& Submissions} \\\\[1.5mm]
    {\\small\\texttt{contact@codebreakerpuzzle.com}} \\\\[1mm]
    {\\footnotesize Official Penpa+ Puzzle Partner}
  \\end{minipage}
\\end{tcolorbox}

`;

// 3. Updated Back Cover
const updatedBackCover = `% =========================================================================
% OUTSIDE BACK COVER
% =========================================================================
\\newpage
\\thispagestyle{empty}
\\begin{tikzpicture}[remember picture, overlay]
  % Full bleed background with subtle print noise
  \\fill[cbteal] (current page.south west) rectangle (current page.north east);
  \\node[anchor=center, inner sep=0pt] at (current page.center) {
    \\includegraphics[width=\\paperwidth, height=\\paperheight]{bg_noise.jpg}
  };
  
  % Frame borders
  \\draw[line width=1.2pt, cbsage!60!white] 
    ([shift={(10mm,-10mm)}]current page.north west) 
    rectangle 
    ([shift={(-10mm,10mm)}]current page.south east);
  \\draw[line width=0.5pt, cbmint!40!white] 
    ([shift={(11.8mm,-11.8mm)}]current page.north west) 
    rectangle 
    ([shift={(-11.8mm,11.8mm)}]current page.south east);

  % Code Breaker Logo at Top
  \\node[anchor=center] at ([yshift=-23mm]current page.north) {
    \\includegraphics[height=1.4cm, keepaspectratio]{cb_logo_white.png}
  };
  \\node[anchor=center] at ([yshift=-32.5mm]current page.north) {
    {\\color{cbmint}\\fontsize{9}{11.5}\\selectfont \\textbf{T\\,H\\,E \\quad O\\,F\\,F\\,I\\,C\\,I\\,A\\,L \\quad C\\,O\\,M\\,P\\,E\\,N\\,D\\,I\\,U\\,M}}
  };
  \\node[anchor=center] at ([yshift=-40mm]current page.north) {
    {\\color{cblight}\\fontsize{14.5}{17.5}\\selectfont \\textbf{CRACK THE CODE $\\bullet$ MASTER THE GRID}}
  };

  % Persuasive Hook Blurb Box
  \\node[
    anchor=north,
    draw=cbsage!60!white, 
    line width=0.8pt, 
    fill=cbdarkteal, 
    rounded corners=3mm, 
    inner sep=3.2mm, 
    text width=165mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-46.5mm]current page.north) {
    {\\color{cblight}\\small \\textbf{Whether you are training for world-level competition or simply love the pure thrill of deduction}, the \\textbf{Code Breaker Logic Puzzle Contest II} compendium delivers over \\textbf{110 handcrafted Nikoli-style puzzles}. Every single grid has been authored by Thailand's national puzzle champions and mathematically verified for a 100\\% unique, step-by-step logical solving path---with zero guessing required.}
  };

  % Feature Highlights Pills Bar with ICONS
  \\node[anchor=north] at ([yshift=-70mm]current page.north) {
    \\begin{tikzpicture}
      \\node[fill=cbocean, rounded corners=3pt, inner xsep=7pt, inner ysep=3.2pt] at (-5.85,0) {
        \\iconbook{0.85}{cbmint}\\hspace{1.5mm}\\textbf{\\fontsize{8}{10}\\selectfont\\color{white}6 COMPENDIUM SECTIONS}
      };
      \\node[fill=cbocean, rounded corners=3pt, inner xsep=7pt, inner ysep=3.2pt] at (-1.95,0) {
        \\icongrid{0.85}{cbmint}\\hspace{1.5mm}\\textbf{\\fontsize{8}{10}\\selectfont\\color{white}110+ ORIGINAL GRIDS}
      };
      \\node[fill=cbocean, rounded corners=3pt, inner xsep=7pt, inner ysep=3.2pt] at (1.95,0) {
        \\iconbars{0.85}{cbmint}\\hspace{1.5mm}\\textbf{\\fontsize{8}{10}\\selectfont\\color{white}GRADED DIFFICULTY}
      };
      \\node[fill=cbocean, rounded corners=3pt, inner xsep=7pt, inner ysep=3.2pt] at (5.85,0) {
        \\iconcheck{0.85}{cbmint}\\hspace{1.5mm}\\textbf{\\fontsize{8}{10}\\selectfont\\color{white}FULL SOLUTIONS}
      };
    \\end{tikzpicture}
  };

  % =========================================================================
  % 6 SEPARATE STYLIZED SECTION BOXES
  % =========================================================================

  % Round 1 Box
  \\node[
    anchor=north,
    draw=cbsage!70!white, 
    line width=0.7pt, 
    fill=cbdarkteal, 
    rounded corners=2.2mm, 
    inner sep=2.5mm, 
    text width=165mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-82mm]current page.north) {
    {\\color{cbmint}\\textbf{\\fontsize{9.5}{11.5}\\selectfont \\bulletloop{0.8}\\hspace{2mm}ROUND 1: POPULAR PICKS}} \\hfill {\\color{cbsage}\\fontsize{8}{10}\\selectfont \\textbf{NIKOLI CLASSICS}} \\\\[1mm]
    {\\color{cblight}\\footnotesize World-renowned pencil logic genres: Sudoku, Akari (Light Up), Yajilin, Slitherlink, and Skyscrapers.}
  };

  % Round 2 Box
  \\node[
    anchor=north,
    draw=cbsage!70!white, 
    line width=0.7pt, 
    fill=cbdarkteal, 
    rounded corners=2.2mm, 
    inner sep=2.5mm, 
    text width=165mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-101mm]current page.north) {
    {\\color{cbmint}\\textbf{\\fontsize{9.5}{11.5}\\selectfont \\bulletshade{0.8}\\hspace{2mm}ROUND 2: SHADING SHOWCASE}} \\hfill {\\color{cbsage}\\fontsize{8}{10}\\selectfont \\textbf{CELL SHADING}} \\\\[1mm]
    {\\color{cblight}\\footnotesize Masterful shading and loop deduction: Nurikabe, Kurotto, Heyawake, Tapa, and Cave.}
  };

  % Round 3 Box
  \\node[
    anchor=north,
    draw=cbsage!70!white, 
    line width=0.7pt, 
    fill=cbdarkteal, 
    rounded corners=2.2mm, 
    inner sep=2.5mm, 
    text width=165mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-120mm]current page.north) {
    {\\color{cbmint}\\textbf{\\fontsize{9.5}{11.5}\\selectfont \\bulletpento{0.8}\\hspace{2mm}ROUND 3: PENTA PARTY}} \\hfill {\\color{cbsage}\\fontsize{8}{10}\\selectfont \\textbf{POLYOMINO TILING}} \\\\[1mm]
    {\\color{cblight}\\footnotesize Geometric spatial deduction: Pentominous, Pipelink, and hybrid pentomino challenges.}
  };

  % Round 4 Box
  \\node[
    anchor=north,
    draw=cbsage!70!white, 
    line width=0.7pt, 
    fill=cbdarkteal, 
    rounded corners=2.2mm, 
    inner sep=2.5mm, 
    text width=165mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-139mm]current page.north) {
    {\\color{cbmint}\\textbf{\\fontsize{9.5}{11.5}\\selectfont \\bulletword{0.8}\\hspace{2mm}ROUND 4: WARPED WORDS}} \\hfill {\\color{cbsage}\\fontsize{8}{10}\\selectfont \\textbf{LEXICAL LOGIC}} \\\\[1mm]
    {\\color{cblight}\\footnotesize Clever language and grid deduction: Japanese Fill-in, Crosswords, Word Search, and Cryptic grids.}
  };

  % Chapter 5 Box (Changed from ROUND 5 to Chapter Name)
  \\node[
    anchor=north,
    draw=cbsage!70!white, 
    line width=0.7pt, 
    fill=cbdarkteal, 
    rounded corners=2.2mm, 
    inner sep=2.5mm, 
    text width=165mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-158mm]current page.north) {
    {\\color{cbmint}\\textbf{\\fontsize{9.5}{11.5}\\selectfont \\bulletbanana{0.8}\\hspace{2mm}SPECIAL SECTION: CHOCO BANANA}} \\hfill {\\color{cbsage}\\fontsize{8}{10}\\selectfont \\textbf{CITY BUS TOUR}} \\\\[1mm]
    {\\color{cblight}\\footnotesize Complete 25-puzzle omnibus tour, graded progressively from $7\\times 7$ up to a mammoth $5\\times 35$ expressway.}
  };

  % Chapter 6 Box (Logic Showcase)
  \\node[
    anchor=north,
    draw=cbsage!70!white, 
    line width=0.7pt, 
    fill=cbdarkteal, 
    rounded corners=2.2mm, 
    inner sep=2.5mm, 
    text width=165mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-177mm]current page.north) {
    {\\color{cbmint}\\textbf{\\fontsize{9.5}{11.5}\\selectfont \\bulletloop{0.8}\\hspace{2mm}SECTION 6: LOGIC SHOWCASE}} \\hfill {\\color{cbsage}\\fontsize{8}{10}\\selectfont \\textbf{EXPERIMENTAL HYBRIDS}} \\\\[1mm]
    {\\color{cblight}\\footnotesize Curated exhibition of 47 avant-garde hybrid grids (LS 49--LS 75): dual topologies, inverted sightlines, and 50-story tower.}
  };

  % Bottom Section: Event, Venue & Partner
  \\node[
    anchor=north, 
    draw=cbocean, 
    line width=0.8pt, 
    fill=cbdarkteal!85!black, 
    rounded corners=2.8mm, 
    inner sep=3mm, 
    text width=165mm, 
    drop shadow={opacity=0.25, shadow xshift=1pt, shadow yshift=-1.5pt}
  ] at ([yshift=-203mm]current page.north) {
    \\begin{minipage}[c]{0.18\\linewidth} 
      \\centering 
      \\includegraphics[height=1.15cm, keepaspectratio]{sponsor_logo2.png} 
    \\end{minipage}%
    \\hfill
    \\begin{minipage}[c]{0.64\\linewidth} 
      \\centering 
      {\\color{cbmint}\\textbf{\\large Code Breaker Logic Puzzle Contest II}} \\\\[1.5mm] 
      {\\color{cblight}\\small \\iconpin{0.85}{cbmint}\\hspace{1.5mm}NK Board Game, Seacon Bangkae, Bangkok, Thailand} 
    \\end{minipage}%
    \\hfill
    \\begin{minipage}[c]{0.14\\linewidth} 
      \\centering 
      \\includegraphics[height=1.15cm, keepaspectratio]{cb_logo_white.png} 
    \\end{minipage}
  };

  % Authors
  \\node[anchor=north] at ([yshift=-235mm]current page.north) {
    {\\color{cblight}\\normalsize \\iconpen{0.85}{cbmint}\\hspace{2mm}\\textbf{Puzzle Author:} Sakulbuth Ekvittayaniphon \\quad $\\bullet$ \\quad \\textbf{Guest Author:} Sinchai Jaturangkhajit}
  };
  \\node[anchor=north] at ([yshift=-244mm]current page.north) {
    {\\color{cbsage}\\footnotesize Code Breaker Logic Puzzle Contest II \\quad $\\bullet$ \\quad Official Competition Compendium \\quad $\\bullet$ \\quad Printed in Bangkok}
  };
\\end{tikzpicture}
\\null

\\end{document}
`;

content = content.slice(0, pAd) + interiorDiscoverPage + updatedBackCover;

fs.writeFileSync(bookPath, content, 'utf8');
console.log('Successfully updated book.tex with solution cover, interior discover page, and updated back cover!');
