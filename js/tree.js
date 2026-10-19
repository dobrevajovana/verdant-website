/* VERDANT — the one-screen tree: a painted floating island whose canopy is a knowledge graph.
   Every glowing part is a hotspot: hover, focus or tap shows a leaf card; click (or "Open" on a phone)
   opens its story or panel. Stories and panels live in panels.js. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const M = window.Motion;
  const P = window.VERDANT_PANELS || {};
  const NS = "http://www.w3.org/2000/svg";
  // Safari ignores var() inside SVG presentation attributes, so theme colours go through style instead
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) {
      const v = attrs[k];
      if ((k === "fill" || k === "stroke" || k === "stop-color") && /var\(|color-mix\(/.test(v)) n.style.setProperty(k, v);
      else n.setAttribute(k, v);
    }
    const cls = attrs.class || "";
    if (/\bhit\b/.test(cls)) n.setAttribute("fill", "transparent");
    if (/\bglow\b/.test(cls)) { n.setAttribute("fill", "#f0b43c"); n.setAttribute("opacity", "0"); }
    if (parent) parent.appendChild(n);
    return n;
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let seed = 23; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const svg = document.getElementById("scene"), tip = document.getElementById("tip"), explore = document.getElementById("explore");
  const layer = (name, parent = svg) => el("g", { id: name }, parent);

  /* painter's palette: fixed colours, so the illustration looks the same in any browser and theme */
  const C = {
    dark: "#1f5a33", deep: "#2c6e3c", mid: "#3f8a45", light: "#6fb04f", hi: "#a6d468", speck: "#17472a",
    bark: "#6b4630", barkD: "#4a2e1e", barkL: "#94643f",
    g1: "#3d7f33", g2: "#5aa34a", g3: "#7cc05a",
    e1: "#6b4630", e2: "#4e3121", e3: "#8a5d3d",
    petal: "#f2d14b", heart: "#d99a22",
    line: "#fbf6e4", amber: "#f0b43c", glowLeaf: "#d9f28c", autumn1: "#f2c94c", autumn2: "#e08a3a", wikidata: "#5b9be8", dbpedia: "#ef7d5e", ols: "#3fae6a", gbif: "#a77fe0"
  };

  /* ================= the island ================= */
  const defs = el("defs", {}, svg);
  const sh = el("radialGradient", { id: "islandShadow" }, defs);
  el("stop", { offset: 0, "stop-color": "#000", "stop-opacity": .16 }, sh); el("stop", { offset: 1, "stop-color": "#000", "stop-opacity": 0 }, sh);
  const tg = el("linearGradient", { id: "barkG", x1: 0, x2: 1 }, defs);
  el("stop", { offset: 0, "stop-color": C.barkD }, tg); el("stop", { offset: .45, "stop-color": C.bark }, tg); el("stop", { offset: 1, "stop-color": C.barkL }, tg);

  el("ellipse", { cx: 1000, cy: 872, rx: 260, ry: 22, fill: "url(#islandShadow)" }, svg);
  const world = layer("world");                                   // everything that floats
  const rootsL = layer("roots", world), earthL = layer("earth", world), trunkL = layer("trunk", world);
  const canopyL = layer("canopy", world), netL = layer("net", world), islandTop = layer("island-top", world);
  const creatures = layer("creatures", world), tagsL = layer("tags", world), floatL = layer("floating", svg);

  /* ================= hotspots ================= */
  const spots = new Map();          // id -> { spec, g, anchor }
  const hs = (parent, spec, gx, gy, gr, delay) => {
    const g = el("g", { class: "hs", tabindex: 0, role: "button", "data-id": spec.id, "aria-label": `${spec.t}. ${spec.p}${spec.act ? " Press Enter to open." : ""}` }, parent);
    const glow = el("circle", { cx: gx, cy: gy, r: gr, class: "glow", style: `--d:${(delay ?? rnd() * 3).toFixed(2)}s` }, g);
    spots.set(spec.id, { spec, g, anchor: glow });
    return g;
  };

  /* earth chunk with hanging roots */
  el("path", { d: "M766 648 C 790 700, 850 742, 930 772 C 975 792, 1035 794, 1086 768 C 1160 734, 1214 690, 1236 650 Z", fill: C.e1 }, earthL);
  el("path", { d: "M800 690 C 860 742, 940 778, 1000 784 C 1060 782, 1140 744, 1206 690 C 1170 742, 1080 792, 1000 796 C 930 794, 850 750, 800 690 Z", fill: C.e2 }, earthL);
  [[840, 690, 880, 700], [930, 720, 980, 728], [1040, 712, 1100, 700], [1120, 680, 1170, 676], [900, 752, 940, 760]].forEach(([a, b, c, d]) =>
    el("path", { d: `M${a} ${b} Q ${(a + c) / 2} ${b + 8} ${c} ${d}`, stroke: C.e3, "stroke-width": 2.5, fill: "none", "stroke-linecap": "round", opacity: .6 }, earthL));
  const ROOTS = [
    { id: "r-terms", d: "M880 740 C 870 770, 852 790, 846 812", tip: [846, 812], k: "Roots · already working", t: "1,955 names", p: "Every protected habitat, species, region and status from the Habitats and Birds Directives." },
    { id: "r-links", d: "M960 780 C 958 800, 946 820, 950 838", tip: [950, 838], k: "Roots · already working", t: "14,500+ links", p: "To NCBI Taxonomy, ENVO, Wikidata and DBpedia, found by matching names and meaning." },
    { id: "r-regions", d: "M1050 782 C 1060 800, 1074 816, 1070 834", tip: [1070, 834], k: "Roots · already working", t: "9 regions", p: "From Alpine to Steppic: every biogeographical region of the EU." },
    { id: "r-open", d: "M1140 736 C 1160 760, 1178 780, 1178 806", tip: [1178, 806], k: "Roots · already working", t: "Open and running", p: "Free to use under the MIT licence. On Monday, you build on it." }
  ];
  const rootPaths = [];
  ROOTS.forEach(r => {
    rootPaths.push(el("path", { d: r.d, stroke: C.e1, "stroke-width": 9, fill: "none", "stroke-linecap": "round", class: "grow" }, rootsL));
    rootPaths.push(el("path", { d: r.d, stroke: C.e3, "stroke-width": 3, fill: "none", "stroke-linecap": "round", opacity: .55, class: "grow" }, rootsL));
  });
  [["M920 770 C 905 790, 900 806, 890 820", 3], ["M1010 792 C 1016 808, 1006 824, 1012 836", 3], ["M1100 760 C 1112 790, 1108 808, 1120 822", 2.5], ["M846 812 c -6 8 -4 14 -10 20", 2], ["M950 838 c 4 6 0 10 4 14", 2], ["M1178 806 c 6 8 2 14 8 20", 2]].forEach(([d, w]) =>
    rootPaths.push(el("path", { d, stroke: C.e1, "stroke-width": w, fill: "none", "stroke-linecap": "round", class: "grow" }, rootsL)));
  ROOTS.forEach((r, i) => {
    const g = hs(rootsL, { ...r, act: { story: "roots", at: i } }, r.tip[0], r.tip[1], 20);
    el("circle", { cx: r.tip[0], cy: r.tip[1], r: 7, fill: i % 2 ? C.ols : C.amber, stroke: C.line, "stroke-width": 2, class: "node" }, g);
    el("circle", { cx: r.tip[0], cy: r.tip[1], r: 22, class: "hit" }, g);
  });

  /* trunk: a twisting S, with a hollow where the owl lives */
  const trunkA = el("path", { d: "M990 652 C 942 580, 1058 528, 1014 450", stroke: "url(#barkG)", "stroke-width": 54, fill: "none", "stroke-linecap": "round", class: "grow" }, trunkL);
  const trunkB = el("path", { d: "M1014 456 C 986 398, 1016 338, 1002 270", stroke: "url(#barkG)", "stroke-width": 36, fill: "none", "stroke-linecap": "round", class: "grow" }, trunkL);
  const limbs = [
    el("path", { d: "M1004 470 C 940 452, 860 470, 760 432", stroke: C.bark, "stroke-width": 20, fill: "none", "stroke-linecap": "round", class: "grow" }, trunkL),
    el("path", { d: "M1018 424 C 1090 436, 1170 440, 1262 410", stroke: C.bark, "stroke-width": 20, fill: "none", "stroke-linecap": "round", class: "grow" }, trunkL),
    el("path", { d: "M1004 330 C 920 300, 830 300, 760 318", stroke: C.bark, "stroke-width": 14, fill: "none", "stroke-linecap": "round", class: "grow" }, trunkL),
    el("path", { d: "M1004 300 C 1110 280, 1210 210, 1330 168", stroke: C.bark, "stroke-width": 11, fill: "none", "stroke-linecap": "round", class: "grow" }, trunkL)
  ];
  el("path", { d: "M978 640 C 940 585, 1036 530, 1000 462", stroke: C.barkL, "stroke-width": 6, fill: "none", "stroke-linecap": "round", opacity: .5 }, trunkL);
  el("path", { d: "M1004 452 C 984 400, 1006 345, 996 290", stroke: C.barkL, "stroke-width": 4, fill: "none", "stroke-linecap": "round", opacity: .45 }, trunkL);

  /* four knots in the bark: two thousand years of drawing knowledge as a tree */
  const KNOTS = [
    { id: "k-porphyry", f: .3, path: trunkA, yr: "c. 270", k: "In the trunk · c. 270 CE", t: "Porphyry: Divide.", p: "What is a thing? Split being into kinds, two at a time. The first tree of knowledge." },
    { id: "k-linnaeus", f: .62, path: trunkA, yr: "1758", k: "In the trunk · 1758", t: "Linnaeus: Name.", p: "Two words for every living thing. The stag beetle, Lucanus cervus, got its name this year." },
    { id: "k-darwin", f: .8, path: trunkA, yr: "1837", k: "In the trunk · 1837", t: "Darwin: Relate.", p: "“I think.” Every kind shares an ancestor. The tree became a tree of life." },
    { id: "k-verdant", f: .3, path: trunkB, yr: "2026", k: "In the trunk · 2026", t: "VERDANT: Link.", p: "One name, understood by every database at once." }
  ];
  KNOTS.forEach((n, i) => {
    const pt = n.path.getPointAtLength(n.path.getTotalLength() * n.f), x = pt.x - 8, y = pt.y;
    const g = hs(trunkL, { ...n, act: { story: "history", at: i } }, x, y, 16, i * .5);
    el("ellipse", { cx: x, cy: y, rx: 6.5, ry: 4.5, fill: C.barkD, stroke: C.barkL, "stroke-width": 1.6 }, g);
    if (i === 3) el("circle", { cx: x, cy: y, r: 2, fill: C.amber }, g);
    el("line", { x1: x - 10, y1: y, x2: x - 34, y2: y, stroke: "var(--fg-2)", "stroke-width": 1, opacity: .6 }, g);
    const t = el("text", { x: x - 40, y: y + 4, "text-anchor": "end", class: "yrlbl" }, g); t.textContent = n.yr;
    el("rect", { x: x - 90, y: y - 15, width: 106, height: 30, class: "hit" }, g);
  });

  /* ================= the canopy: painted clumps of foliage ================= */
  const clump = (parent, cx, cy, rx, ry, n) => {
    const g = el("g", { class: "clump" }, parent), base = Math.min(rx, ry), cs = [];
    for (let i = 0; i < n; i++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()) * .72; cs.push([cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, base * (.3 + rnd() * .22)]); }
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + rnd() * .2; cs.push([cx + Math.cos(a) * rx * .84, cy + Math.sin(a) * ry * .8, base * (.24 + rnd() * .14)]); }
    cs.sort((a, b) => a[1] - b[1]);
    cs.forEach(([x, y, r]) => el("circle", { cx: x + 6, cy: y + 10, r, fill: C.dark }, g));
    cs.forEach(([x, y, r]) => el("circle", { cx: x, cy: y, r: r * .96, fill: C.mid }, g));
    cs.filter(c => c[1] > cy + ry * .1).forEach(([x, y, r]) => el("circle", { cx: x + 3, cy: y + 6, r: r * .72, fill: C.deep, opacity: .55 }, g));
    cs.filter(c => c[1] < cy + ry * .25).forEach(([x, y, r]) => el("circle", { cx: x - r * .2, cy: y - r * .24, r: r * .62, fill: C.light }, g));
    cs.filter(c => c[1] < cy - ry * .15).forEach(([x, y, r]) => { if (rnd() < .65) el("circle", { cx: x - r * .32, cy: y - r * .38, r: r * .26, fill: C.hi }, g); });
    for (let i = 0; i < n * 1.4; i++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()) * .8; el("circle", { cx: cx + Math.cos(a) * d * rx, cy: cy + Math.sin(a) * d * ry, r: 1.2 + rnd() * 2, fill: rnd() < .5 ? C.speck : C.hi, opacity: .45 }, g); }
    return g;
  };
  /* graph nodes are glowing leaves */
  const leafPath = sz => `M0 ${-sz} C ${sz * .78} ${-sz * .55}, ${sz * .78} ${sz * .55}, 0 ${sz} C ${-sz * .78} ${sz * .55}, ${-sz * .78} ${-sz * .55}, 0 ${-sz} Z`;
  const leafSpots = [];
  const leafNode = (parent, x, y, sz, fill, vein) => {
    const o = el("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${Math.round(rnd() * 90 - 45)})` }, parent);
    const n = el("g", { class: "node leafnode" }, o);
    el("path", { d: leafPath(sz), fill, class: "blade" }, n);
    el("path", { d: `M0 ${sz * .95} L0 ${-sz * .75}`, stroke: vein, "stroke-width": 1.4, "stroke-linecap": "round", opacity: .8 }, n);
    leafSpots.push([x, y]);
    return n;
  };

  const BR = [
    { key: "data", cx: 700, cy: 418, rx: 132, ry: 86, sway: "sway-a",
      tag: { x: 372, y: 476, sub: "BRANCH · DATA", t: "Grow the data" },
      center: { k: "Branch · Data", t: "Grow the data", p: "Every protected species with real sightings, every habitat in EUNIS terms." },
      nodes: [["GBIF sightings", "Link 1,711 protected species to their real occurrence records."], ["Counted by region", "How often each species is seen, region by region."],
        ["Habitats in EUNIS", "Legal habitat codes meet the European habitat classification."], ["Ask in plain words", "A search page that answers questions in seconds. No code."],
        ["Field records", "Real observations, not only names on a list."], ["Your data", "Your own field data could be the next leaf."]] },
    { key: "learn", cx: 990, cy: 214, rx: 300, ry: 138, sway: "sway-b",
      tag: { x: 560, y: 86, sub: "BRANCH · EXPERTS", t: "Teach it to learn" },
      center: { k: "Branch · Experts", t: "Teach it to learn", p: "Your judgement as an ecologist becomes the model's training." },
      nodes: [["Is a raised bog a peatland?", "A computer measures how similar two words are. An ecologist knows."], ["The AI suggests", "It proposes a match between two names."],
        ["You decide", "Yes, no, or fix it. That's all it takes."], ["A lesson learned", "Every answer you give makes the next suggestion better."],
        ["Meaning is distance", "Closer than 0.85 means the same thing. Experts decide where the line really is."], ["An honest assistant", "It answers from the graph and shows where each fact came from."]] },
    { key: "connect", cx: 1296, cy: 404, rx: 140, ry: 90, sway: "sway-c",
      tag: { x: 1300, y: 532, sub: "BRANCH · COMMUNITY", t: "Connect the forest" },
      center: { k: "Branch · Community", t: "Connect the forest", p: "Link conservation to microbiome, plant and marine science." },
      nodes: [["MiCoKnowGraph", "Microbes meet protected habitats: we build together on Thursday."], ["Same forest, two sciences", "A soil sample and a beech forest meet through one shared ENVO class."],
        ["Plant Sciences", "Where protected plants meet ELIXIR's plant data."], ["Marine Metagenomics", "Seas and coasts, from seals to sediments."],
        ["Teach it", "A tutorial so your students can plant the next trees."], ["All welcome", "Botanists, zoologists, microbiologists, curators."]] }
  ];
  const KB = [C.ols, C.wikidata, C.dbpedia, C.gbif];
  const allClumps = [], allNodes = [], allEdges = [];
  // small grafted clump, top right: the partner project
  const partnerG = el("g", { class: "sway-d" }, canopyL);
  allClumps.push(clump(partnerG, 1356, 150, 78, 56, 10));
  BR.forEach(b => {
    const wrap = el("g", { class: b.sway }, canopyL);
    allClumps.push(clump(wrap, b.cx, b.cy, b.rx, b.ry, b.key === "learn" ? 34 : 16));
    // the knowledge graph on this clump
    const net = el("g", { class: b.sway }, netL), act = { story: b.key };
    const cx = b.cx - b.rx * .05, cy = b.cy - b.ry * .05;
    const pts = [];
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 - 1.3 + rnd() * .4; pts.push([cx + Math.cos(a) * b.rx * (.5 + rnd() * .2), cy + Math.sin(a) * b.ry * (.48 + rnd() * .16)]); }
    pts.forEach((p, i) => {
      allEdges.push(el("line", { x1: cx, y1: cy, x2: p[0], y2: p[1], stroke: C.line, "stroke-opacity": .8, "stroke-width": 1.6 }, net));
      const q = pts[(i + 1) % 6];
      if (i % 2 === 0) allEdges.push(el("line", { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: C.line, "stroke-opacity": .45, "stroke-width": 1.1, "stroke-dasharray": "3 4" }, net));
    });
    pts.forEach((p, i) => {
      const [t, text] = b.nodes[i];
      const g = hs(net, { id: `${b.key}-${i}`, k: b.center.k, t, p: text, act }, p[0], p[1], 0);
      allNodes.push(leafNode(g, p[0], p[1], 11, C.glowLeaf, KB[i % 4]));
      el("circle", { cx: p[0], cy: p[1], r: 18, class: "hit" }, g);
    });
    const cg = hs(net, { id: `${b.key}-center`, ...b.center, act }, cx, cy, 0, 0);
    allNodes.push(leafNode(cg, cx, cy, 17, C.amber, "#8a5a12"));
    el("circle", { cx, cy, r: 26, class: "hit" }, cg);
    // label pill
    const w = Math.max(176, b.tag.t.length * 9 + 44);
    const tg2 = hs(tagsL, { id: b.key, ...b.center, act }, b.tag.x + w / 2, b.tag.y, 0, 0);
    const pill = el("g", { class: "tagpill" }, tg2);
    el("rect", { x: b.tag.x, y: b.tag.y - 24, width: w, height: 48, rx: 24, fill: "#f7f9f3", stroke: "#d3ddd2" }, pill);
    el("circle", { cx: b.tag.x + 22, cy: b.tag.y, r: 6, fill: C.amber }, pill);
    const s1 = el("text", { x: b.tag.x + 38, y: b.tag.y - 4, class: "sub" }, pill); s1.textContent = b.tag.sub;
    const s2 = el("text", { x: b.tag.x + 38, y: b.tag.y + 14 }, pill); s2.textContent = b.tag.t;
  });

  /* more green: small tufts on the lower limbs and a little ivy on the trunk */
  [[842, 522, 50, 36], [1176, 508, 48, 34], [868, 318, 54, 34]].forEach(([x, y, rx, ry], i) => {
    const w = el("g", { class: ["sway-a", "sway-c", "sway-b"][i] }, canopyL);
    allClumps.push(clump(w, x, y, rx, ry, 7));
  });
  const ivy = el("g", {}, trunkL);
  [[968, 610, -30], [1030, 578, 25], [992, 500, -15], [1026, 470, 30], [1000, 380, -20], [1014, 330, 20]].forEach(([x, y, r]) => {
    const g = el("g", { transform: `translate(${x} ${y}) rotate(${r})` }, ivy);
    el("path", { d: "M0 0 C -8 -3, -11 -11, -8 -16 C -2 -11, 1 -5, 0 0 Z", fill: C.light }, g);
    el("path", { d: "M1 0 C 9 -2, 14 -8, 12 -14 C 5 -11, 2 -6, 1 0 Z", fill: C.mid }, g);
  });

  /* partner: the grafted clump */
  {
    const g = hs(netL, { id: "partner", k: "A grafted branch · Project 16", t: "MiCoKnowGraph", p: "A microbiome knowledge graph, grafted onto our tree. We share habitats and species, and keep growing together after Barcelona.", act: { story: "connect" } }, 1356, 150, 0, 0);
    const pts = [[1356, 150], [1322, 132], [1392, 136], [1336, 172], [1384, 172]];
    pts.slice(1).forEach(p => allEdges.push(el("line", { x1: 1356, y1: 150, x2: p[0], y2: p[1], stroke: C.line, "stroke-opacity": .8, "stroke-width": 1.4 }, g)));
    pts.forEach((p, i) => allNodes.push(leafNode(g, p[0], p[1], i ? 8 : 12, i ? C.glowLeaf : C.ols, i ? C.ols : "#1d5f37")));
    const pill = el("g", { class: "tagpill side-label" }, g);
    el("rect", { x: 1418, y: 214, width: 172, height: 44, rx: 22, fill: "#f7f9f3", stroke: "#d3ddd2" }, pill);
    const a = el("text", { x: 1438, y: 232, class: "sub" }, pill); a.textContent = "GRAFT · PROJECT 16";
    const b2 = el("text", { x: 1438, y: 249 }, pill); b2.textContent = "MiCoKnowGraph";
    el("ellipse", { cx: 1356, cy: 150, rx: 84, ry: 62, class: "hit" }, g);
  }

  /* island top: grass, flowers (the week) and a little signpost */
  el("path", { d: "M758 650 C 790 612, 1210 612, 1242 650 C 1206 676, 794 676, 758 650 Z", fill: C.g2 }, islandTop);
  el("path", { d: "M770 640 C 820 618, 1180 618, 1230 640 C 1180 626, 820 626, 770 640 Z", fill: C.g3, opacity: .8 }, islandTop);
  const blades = el("g", { "stroke-linecap": "round", fill: "none" }, islandTop);
  for (let i = 0; i < 150; i++) {
    const x = 765 + rnd() * 470, edge = Math.abs(x - 1000) / 235;
    const base = 650 + (rnd() - .3) * 22 * (1 - edge * .5) + (rnd() < .3 ? 14 : 0), h = 10 + rnd() * 22 * (1 - edge * .4);
    const lean = (rnd() - .5) * 12 + (x < 1000 ? -3 : 3);
    el("path", { d: `M${x.toFixed(1)} ${base.toFixed(1)} q ${(lean * .4).toFixed(1)} ${(-h * .6).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)}`, stroke: [C.g1, C.g2, C.g3][Math.floor(rnd() * 3)], "stroke-width": 2 + rnd() * 1.6 }, blades);
  }
  for (let i = 0; i < 20; i++) {   // drooping grass over the edge
    const a = rnd() < .5, x = a ? 762 + rnd() * 40 : 1196 + rnd() * 40, y = 648 + rnd() * 12;
    el("path", { d: `M${x} ${y} q ${a ? -6 : 6} 8 ${a ? -4 : 4} ${14 + rnd() * 10}`, stroke: C.g1, "stroke-width": 2.2 }, blades);
  }
  const flower = (parent, x, y, s) => {
    const f = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
    for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283; el("circle", { cx: Math.cos(a) * 4.2, cy: Math.sin(a) * 4.2, r: 3.4, fill: C.petal }, f); }
    el("circle", { cx: 0, cy: 0, r: 2.6, fill: C.heart }, f);
    return f;
  };
  [[812, 640, .7], [868, 652, .6], [1130, 650, .65], [1208, 642, .55], [1045, 660, .5], [935, 662, .55]].forEach(([x, y, s]) => flower(islandTop, x, y, s));
  /* the week: a little ledge on the left where a plant grows, seed to harvest */
  const ledgeWrap = el("g", {}, svg), ledge = el("g", { class: "bob2" }, ledgeWrap);   // wrap moves it on phones; inner group bobs
  el("path", { d: "M104 744 C 120 772, 200 796, 360 800 C 520 796, 600 772, 616 744 Z", fill: C.e2 }, ledge);
  el("path", { d: "M130 752 C 220 784, 500 786, 590 752", stroke: C.e3, "stroke-width": 2, fill: "none", opacity: .5 }, ledge);
  [[220, 790, 214, 816], [360, 800, 366, 830], [500, 792, 508, 814]].forEach(([a, b, c, d]) => el("path", { d: `M${a} ${b} Q ${a - 4} ${(b + d) / 2} ${c} ${d}`, stroke: C.e1, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, ledge));
  el("path", { d: "M96 744 C 130 724, 590 722, 624 744 C 590 756, 130 758, 96 744 Z", fill: C.g2 }, ledge);
  for (let i = 0; i < 70; i++) {
    const x = 104 + rnd() * 512, base = 742 + rnd() * 8, h = 6 + rnd() * 12;
    el("path", { d: `M${x.toFixed(1)} ${base.toFixed(1)} q ${(rnd() * 4 - 2).toFixed(1)} ${(-h * .6).toFixed(1)} ${(rnd() * 8 - 4).toFixed(1)} ${(-h).toFixed(1)}`, stroke: [C.g1, C.g2, C.g3][Math.floor(rnd() * 3)], "stroke-width": 2, "stroke-linecap": "round", fill: "none" }, ledge);
  }
  const wk = el("text", { x: 110, y: 640, class: "daylbl" }, ledge); wk.textContent = "THE WEEK · 9–13 NOV";
  const WEEK = [
    { id: "w-mon", x: 160, d: "MON 9", t: "Plant", p: "The pitch, an onboarding hour for newcomers, and you pick your branch." },
    { id: "w-tue", x: 260, d: "TUE 10", t: "Grow", p: "Building in branches, with leads pairing up with newcomers." },
    { id: "w-wed", x: 360, d: "WED 11", t: "Prune", p: "Look back together and choose what matters most." },
    { id: "w-thu", x: 460, d: "THU 12", t: "Graft", p: "Join forces with MiCoKnowGraph, the microbiome project." },
    { id: "w-fri", x: 560, d: "FRI 13", t: "Harvest", p: "Release, a citable DOI, and the final show." }
  ];
  WEEK.forEach((w, i) => {
    const gy = 738;
    const g = hs(ledge, { id: w.id, k: `The week · ${w.d.toLowerCase()} Nov`, t: w.t, p: w.p, act: null }, w.x, gy - 26, 30, i * .4);
    el("ellipse", { cx: w.x, cy: gy + 2, rx: 16, ry: 4, fill: C.e1 }, g);
    if (i === 0) el("ellipse", { cx: w.x, cy: gy - 4, rx: 5, ry: 7, fill: C.e3 }, g);
    if (i >= 1) el("path", { d: `M${w.x} ${gy} V${gy - 14 - i * 9}`, stroke: C.g1, "stroke-width": 2.6, "stroke-linecap": "round", fill: "none" }, g);
    if (i >= 1) el("path", { d: `M${w.x} ${gy - 10 - i * 4} c -10 0 -14 -6 -14 -12 10 0 14 6 14 12z M${w.x} ${gy - 14 - i * 6} c 9 0 13 -6 13 -11 -9 0 -13 5 -13 11z`, fill: C.light }, g);
    if (i >= 3) el("path", { d: `M${w.x} ${gy - 22 - i * 5} c -9 -1 -12 -7 -11 -12 9 1 12 6 11 12z`, fill: C.mid }, g);
    if (i === 2) el("path", { d: `M${w.x + 10} ${gy - 34} l 8 -6 m -6 8 l 8 -6`, stroke: "#6b7a6d", "stroke-width": 1.6, fill: "none" }, g);
    if (i === 3) el("rect", { x: w.x - 4, y: gy - 30, width: 8, height: 5, rx: 2, fill: C.amber }, g);
    if (i === 4) { el("circle", { cx: w.x, cy: gy - 58, r: 17, fill: C.mid }, g); el("circle", { cx: w.x - 4, cy: gy - 62, r: 9, fill: C.light }, g); [[-7, -60], [7, -54], [2, -68]].forEach(([dx, dy]) => el("circle", { cx: w.x + dx, cy: gy + dy, r: 3.2, fill: C.dbpedia }, g)); }
    const t = el("text", { x: w.x, y: 834, "text-anchor": "middle", class: "daylbl" }, g); t.textContent = w.d;
    el("rect", { x: w.x - 44, y: gy - 84, width: 88, height: 106, class: "hit" }, g);
  });
  {
    const g = hs(islandTop, { id: "join", k: "Barcelona · 9–13 November 2026", t: "Come name things with us", p: "No ontology or coding experience needed. Your knowledge of living things is the missing piece.", act: { sheet: "join" } }, 1220, 586, 34, 0);
    el("rect", { x: 1216, y: 580, width: 7, height: 64, rx: 2, fill: C.barkD }, g);
    el("path", { d: "M1176 566 H1260 L1274 582 L1260 598 H1176 Z", fill: C.amber }, g);
    const t = el("text", { x: 1220, y: 588, "text-anchor": "middle", "font-family": "Instrument Serif, Georgia, serif", "font-size": 18, fill: "#1a1205" }, g); t.textContent = "Join us";
    el("rect", { x: 1170, y: 560, width: 110, height: 90, class: "hit" }, g);
  }

  /* the owl, peeking out of the hollow */
  {
    const g = hs(creatures, { id: "owl", k: "In the hollow", t: "Ask the owl", p: "Plain questions, answers from every linked database at once. Try one.", act: { sheet: "ask" } }, 1010, 540, 34, 0);
    el("ellipse", { cx: 1010, cy: 542, rx: 17, ry: 25, fill: "#2b1a10" }, g);
    el("ellipse", { cx: 1010, cy: 548, rx: 12, ry: 15, fill: "#8b6d4f" }, g);
    el("path", { d: "M999 536 L1001 526 L1005 534 Z M1021 536 L1019 526 L1015 534 Z", fill: "#8b6d4f" }, g);
    [1005, 1015].forEach(x => { el("circle", { cx: x, cy: 542, r: 4.6, fill: "#f7f1e1" }, g); el("circle", { cx: x, cy: 542, r: 2.4, fill: C.amber }, g); el("circle", { cx: x, cy: 542, r: 1.1, fill: "#1a1205" }, g); });
    el("path", { d: "M1008.5 547 L1011.5 547 L1010 550 Z", fill: C.amber }, g);
    el("circle", { cx: 1010, cy: 540, r: 34, class: "hit" }, g);
  }

  /* the stag beetle, climbing the lower trunk */
  {
    const g = hs(creatures, { id: "beetle", k: "On the trunk", t: "Stag beetle · Lucanus cervus", p: "Lives in old oak and beech woods. Every database knows it by a different name. Click to see them.", act: { sheet: "names" } }, 1104, 418, 28, 0);
    const b = el("g", { transform: "translate(1104 416) rotate(78) scale(1.05)" }, g);
    const legs = el("g", { stroke: "#1f120a", "stroke-width": 1.6, "stroke-linecap": "round", fill: "none" }, b);
    [[-8, -4, -15, -9], [8, -4, 15, -9], [-9, 4, -16, 4], [9, 4, 16, 4], [-8, 12, -14, 19], [8, 12, 14, 19]].forEach(([a, c, d, e]) => el("path", { d: `M${a} ${c} L${d} ${e}` }, legs));
    el("ellipse", { cx: 0, cy: 8, rx: 9, ry: 13, fill: "#3b2416" }, b);
    el("path", { d: "M0 -4 V21", stroke: "#1f120a", "stroke-width": 1 }, b);
    el("ellipse", { cx: -3, cy: 4, rx: 2.5, ry: 6, fill: "#6a4a32", opacity: .6 }, b);
    el("ellipse", { cx: 0, cy: -8, rx: 8, ry: 5.5, fill: "#2b1a10" }, b);
    el("ellipse", { cx: 0, cy: -15, rx: 6.5, ry: 4, fill: "#2b1a10" }, b);
    const man = el("g", { stroke: "#9b4322", "stroke-width": 2.6, "stroke-linecap": "round", fill: "none" }, b);
    el("path", { d: "M-3 -18 C -9 -26, -12 -30, -6 -37 M-9.5 -28 l -4 1" }, man);
    el("path", { d: "M3 -18 C 9 -26, 12 -30, 6 -37 M9.5 -28 l 4 1" }, man);
    el("circle", { cx: 1104, cy: 418, r: 28, class: "hit" }, g);
  }

  /* roots label */
  {
    const g = hs(tagsL, { id: "roots", k: "Roots", t: "What already works", p: "1,955 names and 14,500+ links, running today. Click for the story.", act: { story: "roots" } }, 1310, 820, 0, 0);
    const pill = el("g", { class: "tagpill" }, g);
    el("rect", { x: 1214, y: 796, width: 196, height: 48, rx: 24, fill: "#f7f9f3", stroke: "#d3ddd2" }, pill);
    el("circle", { cx: 1236, cy: 820, r: 6, fill: C.e3 }, pill);
    const a = el("text", { x: 1252, y: 816, class: "sub" }, pill); a.textContent = "ROOTS";
    const b = el("text", { x: 1252, y: 834 }, pill); b.textContent = "What already works";
  }

  /* drifting leaf pairs around the canopy */
  const leafPair = (x, y, s, r) => {
    const g = el("g", { transform: `translate(${x} ${y}) rotate(${r}) scale(${s})`, class: "drift" }, floatL);
    el("path", { d: "M0 0 C -10 -4, -14 -14, -10 -20 C -2 -14, 2 -6, 0 0 Z", fill: C.light }, g);
    el("path", { d: "M2 0 C 12 -2, 18 -10, 16 -18 C 6 -14, 2 -8, 2 0 Z", fill: C.mid }, g);
    return g;
  };
  [[600, 300, 1, -10], [1420, 280, .9, 20], [1250, 110, .7, 0], [660, 140, .8, 30], [1520, 640, .7, -20], [560, 520, .75, 10]].forEach(([x, y, s, r], i) => {
    const g = leafPair(x, y, s, r); g.style.animationDelay = `${-i * 1.7}s`;
  });

  /* ================= the leaf card ================= */
  let current = null, pinned = false, lastTouch = { id: null, t: 0 };
  const coarse = () => matchMedia("(max-width: 699px), (pointer: coarse)").matches;
  const act = (spec, from) => {
    if (!spec.act) return;
    hideTip(true);
    if (spec.act.story && P.openStory) P.openStory(spec.act.story, from, spec.act.at || 0);
    if (spec.act.sheet) openSheet(spec.act.sheet, from);
  };
  const showTip = (id, pin) => {
    const s = spots.get(id); if (!s) return;
    const { spec, g, anchor } = s;
    current = id; pinned = !!pin;
    spots.forEach(o => o.g.classList.toggle("on", o === s));
    tip.innerHTML = `<span class="k">${esc(spec.k)}</span><b>${esc(spec.t)}</b><p>${esc(spec.p)}</p>` +
      (spec.act ? `<span class="go">Click to open →</span><button class="btn btn-primary go-btn" type="button">Open</button>` : "");
    tip.hidden = false;
    const btn = tip.querySelector(".go-btn"); if (btn) btn.onclick = () => act(spec, g);
    tip.classList.remove("left");
    if (!coarse()) {
      const r = (anchor.getBBox().width ? anchor : g).getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
      let x = r.right + 10, left = false;
      if (x + w > innerWidth - 12) { x = r.left - w - 10; left = true; }
      const y = Math.max(70, Math.min(innerHeight - h - 90, r.top + r.height / 2 - 34));
      tip.style.left = Math.max(12, x) + "px"; tip.style.top = y + "px";
      tip.classList.toggle("left", left);
      tip.style.transformOrigin = left ? "100% 30px" : "0 30px";
    } else { tip.style.transformOrigin = "50% 100%"; }
    explore.querySelectorAll("button").forEach(b => b.setAttribute("aria-current", String(b.dataset.id === id)));
    if (M && !reduce) M.animate(tip, { opacity: [0, 1], scale: [.82, 1], rotate: [coarse() ? 0 : -4, 0] }, { type: "spring", stiffness: 320, damping: 24 });
  };
  const hideTip = (force) => {
    if (pinned && !force) return;
    current = null; pinned = false; tip.hidden = true;
    spots.forEach(o => o.g.classList.remove("on"));
    explore.querySelectorAll("button").forEach(b => b.setAttribute("aria-current", "false"));
  };
  spots.forEach(({ spec, g }, id) => {
    g.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") showTip(id); });
    g.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") hideTip(); });
    g.addEventListener("focus", () => showTip(id));
    g.addEventListener("blur", () => setTimeout(() => { if (!tip.contains(document.activeElement)) hideTip(true); }, 0));
    g.addEventListener("pointerup", e => { if (e.pointerType !== "mouse" && current !== id) { lastTouch = { id, t: performance.now() }; showTip(id, true); } });
    g.addEventListener("click", e => {
      if (lastTouch.id === id && performance.now() - lastTouch.t < 600) return;   // first tap only shows the card
      if (coarse() && current !== id) { showTip(id, true); return; }
      act(spec, g);
    });
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); spec.act ? act(spec, g) : showTip(id, true); } if (e.key === "Escape") hideTip(true); });
  });
  svg.addEventListener("click", e => { if (!e.target.closest(".hs")) hideTip(true); });

  /* ================= explore bar ================= */
  const EXPLORE = [["roots", "Roots"], ["k-porphyry", "Four trees"], ["beetle", "Beetle"], ["owl", "Owl"], ["data", "Data"], ["learn", "Experts"], ["connect", "Community"], ["w-mon", "The week"], ["partner", "Partner"], ["join", "Join"]];
  EXPLORE.forEach(([id, label]) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.dataset.id = id; b.setAttribute("aria-current", "false");
    b.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") showTip(id); });
    b.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") hideTip(); });
    b.addEventListener("focus", () => showTip(id));
    b.addEventListener("click", () => { const s = spots.get(id); if (coarse() && current !== id) { showTip(id, true); return; } if (s.spec.act) act(s.spec, b); else showTip(id, true); });
    explore.appendChild(b);
  });

  /* ================= panels (sheets) ================= */
  let sheetOpener = null, openSheetEl = null;
  function openSheet(name, from) {
    const s = document.getElementById("sheet-" + name); if (!s) return;
    if (openSheetEl) closeSheet();
    sheetOpener = from || document.activeElement; openSheetEl = s; s.hidden = false;
    if (name === "names" && P.drawGraph) P.drawGraph();
    if (name === "ask" && P.ask) P.ask("forest");
    if (M && !reduce) M.animate(s.querySelector(".sheet-card"), { opacity: [0, 1], scale: [.94, 1], y: [24, 0] }, { type: "spring", stiffness: 260, damping: 24 });
    s.querySelector("[data-close-sheet]").focus();
  }
  function closeSheet() {
    if (!openSheetEl) return;
    openSheetEl.hidden = true; openSheetEl = null;
    if (sheetOpener && sheetOpener.focus) sheetOpener.focus();
  }
  window.VERDANT_SHEETS = { open: openSheet, close: closeSheet };
  document.querySelectorAll(".sheet").forEach(s => s.addEventListener("click", e => { if (e.target === s || e.target.closest("[data-close-sheet]")) closeSheet(); }));
  document.addEventListener("click", e => { const j = e.target.closest("[data-sheet]"); if (j && !j.closest("#story")) openSheet(j.dataset.sheet, j); });
  document.addEventListener("keydown", e => {
    if (!openSheetEl) { if (e.key === "Escape") hideTip(true); return; }
    if (e.key === "Escape") closeSheet();
    if (e.key === "Tab") {
      const f = [...openSheetEl.querySelectorAll("button, a[href], [tabindex='0']")].filter(x => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });


  /* ================= fit the scene to the screen ================= */
  const fit = () => {
    const a = innerWidth / innerHeight, portrait = a < 0.9;
    // on phones the week's ledge moves under the island and the side labels give way to the explore bar
    svg.setAttribute("viewBox", portrait ? "520 -230 960 1430" : a < 1.35 ? "60 -150 1520 1150" : "0 0 1600 1010");
    svg.classList.toggle("portrait", portrait);
    ledgeWrap.setAttribute("transform", portrait ? "translate(640 330)" : "");
    hideTip(true);
  };
  fit(); addEventListener("resize", fit);

  /* ================= grow on load, then breathe ================= */
  if (!reduce) {
    const drawIn = (paths, base, dur) => paths.forEach((p, i) => {
      const L = p.getTotalLength(); p.style.strokeDasharray = L;   // offset stays 0 at rest: drawn even if the animation never runs
      p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: dur, delay: base + i * 60, easing: "cubic-bezier(.3,.7,.2,1)", fill: "backwards" });
    });
    drawIn([trunkA, trunkB], 200, 900);
    drawIn(limbs, 800, 700);
    drawIn(rootPaths, 300, 900);
    // Web Animations with fill "backwards": things are hidden only while they wait to grow,
    // so if an animation never runs the canopy is simply there, fully green.
    const grow = (els, frames, dur, start, step, easing) => els.forEach((n, i) => {
      try { n.animate(frames, { duration: dur, delay: start + i * step, easing, fill: "backwards" }); } catch (e) { /* stays visible */ }
    });
    const spring = "cubic-bezier(.34,1.56,.64,1)";
    grow(allClumps, [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1)" }], 900, 1100, 120, spring);
    grow(allEdges, [{ opacity: 0 }, { opacity: 1 }], 500, 1900, 12, "ease-out");
    grow(allNodes, [{ transform: "scale(0)" }, { transform: "scale(1)" }], 600, 2000, 20, spring);
    grow([tagsL], [{ opacity: 0 }, { opacity: 1 }], 600, 2600, 0, "ease-out");
    grow([...document.querySelectorAll(".intro > *")], [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], 700, 200, 100, "cubic-bezier(.2,.8,.2,1)");
    // safety net: if the animation clock is throttled (background tab, slow device), finish growing anyway
    setTimeout(() => document.getAnimations().forEach(a => { try { if (a.effect.getTiming().fill === "backwards") a.finish(); } catch (e) { /* ignore */ } }), 4500);
    // autumn: now and then a glowing leaf comes loose, falls and turns yellow, then orange
    const fallL = el("g", { "pointer-events": "none" }, floatL);
    const dropLeaf = () => {
      if (document.hidden || !leafSpots.length) return;
      const [x, y] = leafSpots[Math.floor(Math.random() * leafSpots.length)];
      const leaf = el("path", { d: leafPath(9), fill: C.glowLeaf, class: "falling" }, fallL);
      const dx = (Math.random() - .5) * 160, dy = 260 + Math.random() * 220, r0 = Math.random() * 90, spin = (Math.random() < .5 ? -1 : 1) * (240 + Math.random() * 200);
      const kf = [0, .25, .5, .75, 1].map((k, i) => ({
        transform: `translate(${(x + dx * k + Math.sin(k * 9) * 26).toFixed(1)}px, ${(y + dy * k).toFixed(1)}px) rotate(${(r0 + spin * k).toFixed(0)}deg)`,
        fill: [C.glowLeaf, C.autumn1, C.autumn1, C.autumn2, C.autumn2][i], opacity: [1, 1, 1, .9, 0][i]
      }));
      const a = leaf.animate(kf, { duration: 5200 + Math.random() * 2400, easing: "ease-in" });
      a.onfinish = () => leaf.remove();
    };
    setTimeout(() => { dropLeaf(); setInterval(dropLeaf, 1700); }, 3200);
    // knowledge flowing along the graph: small pulses travel out from each branch's centre
    const flowL = el("g", { "pointer-events": "none" }, netL);
    const edgesOut = allEdges.filter(e => !e.getAttribute("stroke-dasharray"));
    const live = []; let running = true;
    const tick = now => {
      if (!running) return;
      if (live.length < 7 && Math.random() < .05) {
        const e = edgesOut[Math.floor(Math.random() * edgesOut.length)];
        live.push({ c: el("circle", { r: 3.2, fill: C.amber }, flowL), x1: +e.getAttribute("x1"), y1: +e.getAttribute("y1"), x2: +e.getAttribute("x2"), y2: +e.getAttribute("y2"), s: now });
      }
      for (let i = live.length - 1; i >= 0; i--) {
        const q = live[i], k = (now - q.s) / 1500;
        if (k >= 1) { q.c.remove(); live.splice(i, 1); continue; }
        q.c.setAttribute("cx", q.x1 + (q.x2 - q.x1) * k); q.c.setAttribute("cy", q.y1 + (q.y2 - q.y1) * k); q.c.setAttribute("opacity", Math.min(1, (1 - k) * 2));
      }
      requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 2600);
    document.addEventListener("visibilitychange", () => { const was = running; running = !document.hidden; if (running && !was) requestAnimationFrame(tick); });
  }
})();
