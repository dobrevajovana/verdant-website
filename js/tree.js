/* VERDANT — the one-screen tree. Every glowing part is a hotspot: hover, focus or tap shows a leaf card;
   click (or "Open" on a phone) opens its story or panel. Stories and panels live in panels.js. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const M = window.Motion;
  const P = window.VERDANT_PANELS || {};
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const svg = document.getElementById("scene"), tip = document.getElementById("tip"), explore = document.getElementById("explore");
  const layer = name => el("g", { id: name }, svg);

  /* ================= the landscape ================= */
  const defs = el("defs", {}, svg);
  const tg = el("linearGradient", { id: "trunkG", x1: 0, x2: 1 }, defs);
  el("stop", { offset: 0, "stop-color": "var(--bark)" }, tg); el("stop", { offset: 1, "stop-color": "var(--root)" }, tg);

  const hills = layer("hills");
  el("path", { d: "M-600 650 C 200 560, 500 640, 900 612 S 1500 562, 2200 640 V1500 H-600Z", fill: "var(--hill-3)" }, hills);
  el("path", { d: "M-600 702 C 300 652, 700 702, 1000 692 S 1600 662, 2200 702 V1500 H-600Z", fill: "var(--hill-2)" }, hills);
  const partnerL = layer("partner");
  el("path", { d: "M-600 742 C 300 716, 700 736, 1000 733 S 1600 720, 2200 742 V1500 H-600Z", fill: "var(--hill-1)" }, hills);
  const grass = layer("grass");
  for (let i = 0; i < 120; i++) {
    const x = -200 + rnd() * 2000, base = 742 + rnd() * 120, h = 7 + rnd() * 11;
    el("path", { d: `M${x.toFixed(1)} ${base.toFixed(1)} q ${(rnd() * 4 - 2).toFixed(1)} ${(-h).toFixed(1)} ${(rnd() * 6 - 3).toFixed(1)} ${(-h * 1.3).toFixed(1)}`, stroke: "var(--leaf-2)", "stroke-width": 1.7, fill: "none", opacity: .65, "stroke-linecap": "round" }, grass);
  }
  const roots = layer("roots"), weekL = layer("week"), signL = layer("sign"), trunkL = layer("trunk"), branchL = layer("branches");
  const crownL = layer("crowns"), creatures = layer("creatures"), tagsL = layer("tags"), pulseL = layer("pulses");

  /* ================= hotspots ================= */
  const spots = new Map();          // id -> { spec, g, anchor }
  const hs = (parent, spec, gx, gy, gr, delay) => {
    const g = el("g", { class: "hs", tabindex: 0, role: "button", "data-id": spec.id, "aria-label": `${spec.t}. ${spec.p}${spec.act ? " Press Enter to open." : ""}` }, parent);
    const glow = el("circle", { cx: gx, cy: gy, r: gr, class: "glow", style: `--d:${(delay ?? rnd() * 3).toFixed(2)}s` }, g);
    spots.set(spec.id, { spec, g, anchor: glow });
    return g;
  };

  /* roots: what already works */
  const ROOT_TIPS = [
    { id: "r-terms", x: 860, y: 824, k: "Roots · already working", t: "1,955 names", p: "Every protected habitat, species, region and status from the Habitats and Birds Directives." },
    { id: "r-links", x: 1104, y: 830, k: "Roots · already working", t: "14,500+ links", p: "To NCBI Taxonomy, ENVO, Wikidata and DBpedia, found by matching names and meaning." },
    { id: "r-regions", x: 978, y: 868, k: "Roots · already working", t: "9 regions", p: "From Alpine to Steppic: every biogeographical region of the EU." },
    { id: "r-open", x: 908, y: 786, k: "Roots · already working", t: "Open and running", p: "Free to use under the MIT licence. On Monday, you build on it." }
  ];
  const rootLines = el("g", { fill: "none", stroke: "var(--root)", "stroke-width": 3.2, "stroke-linecap": "round" }, roots);
  ROOT_TIPS.forEach(r => {
    const mx = (980 + r.x) / 2, my = 752 + (r.y - 744) * .3;
    el("path", { class: "grow", d: `M980 744 C ${mx} ${my}, ${r.x + (980 - r.x) * .2} ${r.y - 10}, ${r.x} ${r.y}` }, rootLines);
  });
  [[1010, 760, 1040, 778], [950, 756, 930, 772]].forEach(([a, b, c, d]) => el("path", { class: "grow", d: `M980 748 Q ${a} ${b} ${c} ${d}`, "stroke-width": 2 }, rootLines));
  ROOT_TIPS.forEach((r, i) => {
    const g = hs(roots, { ...r, act: { story: "roots", at: i } }, r.x, r.y, 22);
    el("circle", { cx: r.x, cy: r.y, r: 7, fill: i % 2 ? "var(--ols)" : "var(--amber)", class: "leaf node" }, g);
    el("circle", { cx: r.x, cy: r.y, r: 24, class: "hit" }, g);
  });

  /* trunk with four knots: two thousand years of drawing knowledge as a tree */
  el("path", { class: "grow", id: "trunk-path", d: "M980 746 C 974 650, 988 560, 980 470", fill: "none", stroke: "url(#trunkG)", "stroke-width": 36, "stroke-linecap": "round" }, trunkL);
  const KNOTS = [
    { id: "k-porphyry", y: 706, yr: "c. 270", k: "In the trunk · c. 270 CE", t: "Porphyry: Divide.", p: "What is a thing? Split being into kinds, two at a time. The first tree of knowledge." },
    { id: "k-linnaeus", y: 648, yr: "1758", k: "In the trunk · 1758", t: "Linnaeus: Name.", p: "Two words for every living thing. The stag beetle, Lucanus cervus, got its name this year." },
    { id: "k-darwin", y: 590, yr: "1837", k: "In the trunk · 1837", t: "Darwin: Relate.", p: "“I think.” Every kind shares an ancestor. The tree became a tree of life." },
    { id: "k-verdant", y: 532, yr: "2026", k: "In the trunk · 2026", t: "VERDANT: Link.", p: "One name, understood by every database at once." }
  ];
  KNOTS.forEach((n, i) => {
    const g = hs(trunkL, { ...n, act: { story: "history", at: i } }, 972, n.y, 18, i * .5);
    el("ellipse", { cx: 972, cy: n.y, rx: 7, ry: 5, fill: "none", stroke: "color-mix(in srgb, var(--bg) 50%, var(--bark))", "stroke-width": 2.4, class: "ring-focus" }, g);
    el("circle", { cx: 972, cy: n.y, r: 2.4, fill: i === 3 ? "var(--amber)" : "var(--fg-2)" }, g);
    const t = el("text", { x: 948, y: n.y + 4, "text-anchor": "end", "font-size": 13, "font-family": "IBM Plex Mono, monospace", fill: "var(--fg-2)" }, g); t.textContent = n.yr;
    el("rect", { x: 900, y: n.y - 16, width: 86, height: 32, class: "hit" }, g);
  });

  /* three branches and their canopies */
  const BR = [
    { key: "data", d: "M978 584 C 920 540, 840 480, 760 400", cx: 730, cy: 330, r: 150, sway: "sway-a",
      tag: { x: 576, y: 506, sub: "BRANCH · DATA", t: "Grow the data" },
      center: { k: "Branch · Data", t: "Grow the data", p: "Every protected species with real sightings, every habitat in EUNIS terms." },
      nodes: [["GBIF sightings", "Link 1,711 protected species to their real occurrence records."], ["Counted by region", "How often each species is seen, region by region."],
        ["Habitats in EUNIS", "Legal habitat codes meet the European habitat classification."], ["Ask in plain words", "A search page that answers questions in seconds. No code."],
        ["Field records", "Real observations, not only names on a list."], ["Your data", "Your own field data could be the next leaf."]] },
    { key: "learn", d: "M980 482 C 984 400, 976 320, 980 236", cx: 980, cy: 200, r: 165, sway: "sway-b",
      tag: { x: 1160, y: 70, sub: "BRANCH · EXPERTS", t: "Teach it to learn" },
      center: { k: "Branch · Experts", t: "Teach it to learn", p: "Your judgement as an ecologist becomes the model's training." },
      nodes: [["Is a raised bog a peatland?", "A computer measures how similar two words are. An ecologist knows."], ["The AI suggests", "It proposes a match between two names."],
        ["You decide", "Yes, no, or fix it. That's all it takes."], ["A lesson learned", "Every answer you give makes the next suggestion better."],
        ["Meaning is distance", "Closer than 0.85 means the same thing. Experts decide where the line really is."], ["An honest assistant", "It answers from the graph and shows where each fact came from."]] },
    { key: "connect", d: "M982 600 C 1050 556, 1130 490, 1200 400", cx: 1230, cy: 330, r: 150, sway: "sway-c",
      tag: { x: 1170, y: 524, sub: "BRANCH · COMMUNITY", t: "Connect the forest" },
      center: { k: "Branch · Community", t: "Connect the forest", p: "Link conservation to microbiome, plant and marine science." },
      nodes: [["MiCoKnowGraph", "Microbes meet protected habitats: we build together on Thursday."], ["Same forest, two sciences", "A soil sample and a beech forest meet through one shared ENVO class."],
        ["Plant Sciences", "Where protected plants meet ELIXIR's plant data."], ["Marine Metagenomics", "Seas and coasts, from seals to sediments."],
        ["Teach it", "A tutorial so your students can plant the next trees."], ["All welcome", "Botanists, zoologists, microbiologists, curators."]] }
  ];
  const leafFills = ["var(--leaf-1)", "var(--leaf-2)", "var(--leaf-3)", "var(--leaf-4)"];
  const kb = ["var(--ols)", "var(--wikidata)", "var(--dbpedia)", "var(--gbif)"];
  const allLeaves = [], allNodes = [], allEdges = [];
  BR.forEach(b => {
    el("path", { class: "grow", d: b.d, fill: "none", stroke: "var(--bark)", "stroke-width": b.key === "learn" ? 17 : 14, "stroke-linecap": "round" }, branchL);
    const crown = el("g", { class: `crown ${b.sway}` }, crownL);
    [[0, 18, 1], [-.42, 34, .78], [.42, 34, .78], [0, -30, .82]].forEach(([dx, dy, s]) =>
      el("ellipse", { cx: b.cx + dx * b.r, cy: b.cy + dy, rx: b.r * .78 * s, ry: b.r * .62 * s, fill: "var(--leaf-4)", opacity: .55 }, crown));
    for (let i = 0; i < 58; i++) {
      const a = rnd() * 6.283, d = Math.sqrt(rnd());
      const x = b.cx + Math.cos(a) * d * b.r * 1.05, y = b.cy + Math.sin(a) * d * b.r * .78 + 10;
      const lf = el("g", { class: "leaf" }, crown);
      el("ellipse", { cx: x, cy: y, rx: 13 + rnd() * 12, ry: 6 + rnd() * 5, fill: leafFills[Math.floor(rnd() * 4)], opacity: .92, transform: `rotate(${Math.round(rnd() * 180)} ${x.toFixed(1)} ${y.toFixed(1)})` }, lf);
      allLeaves.push(lf);
    }
    const pts = [[b.cx, b.cy + 4]];
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 - 1.2 + rnd() * .5; const d = b.r * (.5 + rnd() * .28); pts.push([b.cx + Math.cos(a) * d, b.cy + Math.sin(a) * d * .72 + 6]); }
    const net = el("g", {}, crown);
    pts.slice(1).forEach((p, i) => {
      allEdges.push(el("line", { x1: pts[0][0], y1: pts[0][1], x2: p[0], y2: p[1], stroke: "var(--fg)", "stroke-opacity": .55, "stroke-width": 1.5 }, net));
      const q = pts[1 + ((i + 1) % 6)];
      if (i % 2 === 0) allEdges.push(el("line", { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: "var(--fg)", "stroke-opacity": .28, "stroke-width": 1 }, net));
    });
    const act = { story: b.key };
    pts.slice(1).forEach((p, i) => {
      const [t, text] = b.nodes[i];
      const g = hs(net, { id: `${b.key}-${i}`, k: b.center.k, t, p: text, act }, p[0], p[1], 16);
      const dot = el("circle", { cx: p[0], cy: p[1], r: 6, fill: kb[i % 4], stroke: "var(--bg)", "stroke-width": 2, class: "leaf node" }, g);
      allNodes.push(dot);
      el("circle", { cx: p[0], cy: p[1], r: 18, class: "hit" }, g);
    });
    const cg = hs(net, { id: `${b.key}-center`, ...b.center, act }, pts[0][0], pts[0][1], 26, 0);
    allNodes.push(el("circle", { cx: pts[0][0], cy: pts[0][1], r: 11, fill: "var(--amber)", stroke: "var(--bg)", "stroke-width": 2.5, class: "leaf node" }, cg));
    el("circle", { cx: pts[0][0], cy: pts[0][1], r: 26, class: "hit" }, cg);
    // label pill for the branch
    const w = Math.max(170, b.tag.t.length * 9 + 40);
    const tg2 = hs(tagsL, { id: b.key, ...b.center, act }, b.tag.x + w / 2, b.tag.y, 0, 0);
    const pill = el("g", { class: "tagpill" }, tg2);
    el("rect", { x: b.tag.x, y: b.tag.y - 24, width: w, height: 48, rx: 24 }, pill);
    const s1 = el("text", { x: b.tag.x + 20, y: b.tag.y - 4, class: "sub" }, pill); s1.textContent = b.tag.sub;
    const s2 = el("text", { x: b.tag.x + 20, y: b.tag.y + 14 }, pill); s2.textContent = b.tag.t;
    b.crown = crown;
  });

  /* roots label */
  {
    const g = hs(tagsL, { id: "roots", k: "Roots", t: "What already works", p: "1,955 names and 14,500+ links, running today. Click for the story.", act: { story: "roots" } }, 1205, 840, 0, 0);
    const pill = el("g", { class: "tagpill" }, g);
    el("rect", { x: 1120, y: 816, width: 190, height: 48, rx: 24 }, pill);
    const a = el("text", { x: 1140, y: 836, class: "sub" }, pill); a.textContent = "ROOTS";
    const b = el("text", { x: 1140, y: 854 }, pill); b.textContent = "What already works";
  }

  /* the stag beetle, climbing the trunk */
  {
    const g = hs(creatures, { id: "beetle", k: "On the trunk", t: "Stag beetle · Lucanus cervus", p: "Lives in old oak and beech woods. Every database knows it by a different name. Click to see them.", act: { sheet: "names" } }, 1004, 628, 30, 0);
    const b = el("g", { transform: "translate(1004 632) rotate(-8) scale(1.15)" }, g);
    const legs = el("g", { stroke: "#2b1a10", "stroke-width": 1.6, "stroke-linecap": "round", fill: "none" }, b);
    [[-8, -4, -15, -9], [8, -4, 15, -9], [-9, 4, -16, 4], [9, 4, 16, 4], [-8, 12, -14, 19], [8, 12, 14, 19]].forEach(([a, c, d, e]) => el("path", { d: `M${a} ${c} L${d} ${e}` }, legs));
    el("ellipse", { cx: 0, cy: 8, rx: 9, ry: 13, fill: "#3b2416" }, b);
    el("path", { d: "M0 -4 V21", stroke: "#1f120a", "stroke-width": 1 }, b);
    el("ellipse", { cx: 0, cy: -8, rx: 8, ry: 5.5, fill: "#2b1a10" }, b);
    el("ellipse", { cx: 0, cy: -15, rx: 6.5, ry: 4, fill: "#2b1a10" }, b);
    const man = el("g", { stroke: "#8b3a1e", "stroke-width": 2.6, "stroke-linecap": "round", fill: "none" }, b);
    el("path", { d: "M-3 -18 C -9 -26, -12 -30, -6 -37 M-9.5 -28 l -4 1" }, man);
    el("path", { d: "M3 -18 C 9 -26, 12 -30, 6 -37 M9.5 -28 l 4 1" }, man);
    el("circle", { cx: 1004, cy: 628, r: 30, class: "hit" }, g);
  }

  /* the owl on the left branch: ask it anything */
  {
    const g = hs(creatures, { id: "owl", k: "In the branches", t: "Ask the owl", p: "Plain questions, answers from every linked database at once. Try one.", act: { sheet: "ask" } }, 866, 462, 34, 0);
    const o = el("g", { transform: "translate(866 466)" }, g);
    el("ellipse", { cx: 0, cy: 0, rx: 17, ry: 22, fill: "var(--root)" }, o);
    el("ellipse", { cx: 0, cy: 6, rx: 11, ry: 14, fill: "color-mix(in srgb, var(--root) 55%, #f3e6cc)" }, o);
    el("path", { d: "M-15 -14 L-12 -26 L-6 -18 Z M15 -14 L12 -26 L6 -18 Z", fill: "var(--root)" }, o);
    el("circle", { cx: -6.5, cy: -9, r: 6, fill: "#f7f1e1" }, o); el("circle", { cx: 6.5, cy: -9, r: 6, fill: "#f7f1e1" }, o);
    el("circle", { cx: -6.5, cy: -9, r: 3, fill: "var(--amber)" }, o); el("circle", { cx: 6.5, cy: -9, r: 3, fill: "var(--amber)" }, o);
    el("circle", { cx: -6.5, cy: -9, r: 1.4, fill: "#1a1205" }, o); el("circle", { cx: 6.5, cy: -9, r: 1.4, fill: "#1a1205" }, o);
    el("path", { d: "M-2 -4 L2 -4 L0 0 Z", fill: "var(--amber)" }, o);
    el("path", { d: "M-6 21 l-3 4 M-3 21 l0 5 M3 21 l0 5 M6 21 l3 4", stroke: "var(--amber)", "stroke-width": 1.6, "stroke-linecap": "round" }, o);
    el("circle", { cx: 866, cy: 462, r: 34, class: "hit" }, g);
  }

  /* the week: five seedlings on the hill, from seed to harvest */
  const WEEK = [
    { id: "w-mon", x: 160, d: "MON 9", t: "Plant", p: "The pitch, an onboarding hour for newcomers, and you pick your branch." },
    { id: "w-tue", x: 265, d: "TUE 10", t: "Grow", p: "Building in branches, with leads pairing up with newcomers." },
    { id: "w-wed", x: 370, d: "WED 11", t: "Prune", p: "Look back together and choose what matters most." },
    { id: "w-thu", x: 475, d: "THU 12", t: "Graft", p: "Join forces with MiCoKnowGraph, the microbiome project." },
    { id: "w-fri", x: 580, d: "FRI 13", t: "Harvest", p: "Release, a citable DOI, and the final show." }
  ];
  WEEK.forEach((w, i) => {
    const gy = 738 - (w.x > 400 ? 3 : 0);
    const g = hs(weekL, { id: w.id, k: `The week · ${w.d.toLowerCase()} Nov`, t: w.t, p: w.p, act: null }, w.x, gy - 22, 30, i * .4);
    const s = el("g", { stroke: "var(--leaf-3)", "stroke-width": 2.4, "stroke-linecap": "round", fill: "none" }, g);
    el("ellipse", { cx: w.x, cy: gy + 2, rx: 16, ry: 4, fill: "color-mix(in srgb, var(--root) 60%, transparent)", stroke: "none" }, g);
    if (i === 0) el("ellipse", { cx: w.x, cy: gy - 4, rx: 5, ry: 7, fill: "var(--root)", stroke: "none" }, g);
    if (i >= 1) el("path", { d: `M${w.x} ${gy} V${gy - 14 - i * 9}` }, s);
    if (i >= 1) el("path", { d: `M${w.x} ${gy - 10 - i * 4} c -10 0 -14 -6 -14 -12 10 0 14 6 14 12z M${w.x} ${gy - 14 - i * 6} c 9 0 13 -6 13 -11 -9 0 -13 5 -13 11z`, fill: "var(--leaf-3)", stroke: "none" }, g);
    if (i === 2) el("path", { d: `M${w.x + 10} ${gy - 34} l 8 -6 m -6 8 l 8 -6`, stroke: "var(--fg-2)", "stroke-width": 1.6 }, g);
    if (i === 3) el("rect", { x: w.x - 4, y: gy - 30, width: 8, height: 5, rx: 2, fill: "var(--amber)" }, g);
    if (i === 4) { el("circle", { cx: w.x, cy: gy - 58, r: 16, fill: "var(--leaf-2)" }, g); [[-6, -60], [6, -54], [2, -66]].forEach(([dx, dy]) => el("circle", { cx: w.x + dx, cy: gy + dy, r: 3, fill: "var(--dbpedia)" }, g)); }
    const t = el("text", { x: w.x, y: gy + 24, "text-anchor": "middle", class: "daylbl" }, g); t.textContent = w.d;
    el("rect", { x: w.x - 40, y: gy - 80, width: 80, height: 112, class: "hit" }, g);
  });

  /* partner tree on the far hill; its roots reach ours */
  {
    const g = hs(partnerL, { id: "partner", k: "The neighbouring tree · Project 16", t: "MiCoKnowGraph", p: "A microbiome knowledge graph. Our roots meet in shared habitats and species, and we keep growing together after Barcelona.", act: { story: "connect" } }, 1460, 560, 70, 0);
    el("path", { d: "M1460 676 C 1458 640, 1462 610, 1460 586", stroke: "var(--bark)", "stroke-width": 12, "stroke-linecap": "round", fill: "none" }, g);
    const c = el("g", { class: "crown sway-d" }, g);
    [[0, 0, 62], [-34, 14, 42], [34, 14, 42]].forEach(([dx, dy, r]) => el("circle", { cx: 1460 + dx, cy: 556 + dy, r, fill: "color-mix(in srgb, var(--ols) 55%, var(--leaf-4))", opacity: .9 }, c));
    const pts = [[1460, 556], [1428, 534], [1494, 538], [1440, 584], [1488, 584]];
    pts.slice(1).forEach(p => el("line", { x1: 1460, y1: 556, x2: p[0], y2: p[1], stroke: "var(--fg)", "stroke-opacity": .5, "stroke-width": 1.3 }, c));
    pts.forEach((p, i) => el("circle", { cx: p[0], cy: p[1], r: i ? 4 : 7, fill: i ? "var(--fg)" : "var(--ols)" }, c));
    const pill = el("g", { class: "tagpill" }, g);
    el("rect", { x: 1390, y: 456, width: 150, height: 40, rx: 20 }, pill);
    const a = el("text", { x: 1406, y: 472, class: "sub" }, pill); a.textContent = "PARTNER · NO. 16";
    const b2 = el("text", { x: 1406, y: 488, "font-size": 13 }, pill); b2.textContent = "MiCoKnowGraph";
    el("circle", { cx: 1460, cy: 560, r: 80, class: "hit" }, g);
  }
  // roots that meet underground: dashed, slowly flowing
  const meet = el("path", { d: "M1460 690 C 1400 760, 1250 820, 1104 830", fill: "none", stroke: "var(--ols)", "stroke-width": 2, "stroke-dasharray": "5 7", opacity: .7 }, roots);
  if (!reduce) meet.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -120 }], { duration: 6000, iterations: Infinity });

  /* signpost */
  {
    const g = hs(signL, { id: "join", k: "Barcelona · 9–13 November 2026", t: "Come name things with us", p: "No ontology or coding experience needed. Your knowledge of living things is the missing piece.", act: { sheet: "join" } }, 1305, 690, 46, 0);
    el("rect", { x: 1299, y: 676, width: 10, height: 66, rx: 2, fill: "var(--bark)" }, g);
    el("path", { d: "M1240 650 H1360 L1378 670 L1360 690 H1240 Z", fill: "var(--amber)" }, g);
    const t = el("text", { x: 1300, y: 676, "text-anchor": "middle", "font-family": "Instrument Serif, Georgia, serif", "font-size": 22, fill: "var(--on-amber)" }, g); t.textContent = "Join us";
    el("rect", { x: 1236, y: 646, width: 146, height: 98, class: "hit" }, g);
  }

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
    const a = innerWidth / innerHeight;
    svg.setAttribute("viewBox", a < 0.9 ? "560 -300 840 1220" : a < 1.35 ? "260 -140 1360 1080" : "0 0 1600 900");
    hideTip(true);
  };
  fit(); addEventListener("resize", fit);

  /* ================= grow on load, then breathe ================= */
  if (!reduce) {
    const drawIn = (paths, base, dur) => paths.forEach((p, i) => {
      const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: dur, delay: base + i * 110, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" });
    });
    drawIn([...rootLines.querySelectorAll(".grow")], 0, 800);
    drawIn([document.getElementById("trunk-path")], 250, 900);
    drawIn([...branchL.querySelectorAll(".grow")], 900, 800);
    if (M) {
      allLeaves.forEach(l => l.style.opacity = 0); allNodes.forEach(n => n.style.transform = "scale(0)");
      allEdges.forEach(e => e.style.opacity = 0); tagsL.style.opacity = 0;
      M.animate(allLeaves, { scale: [0, 1], opacity: [0, 1] }, { delay: M.stagger(0.008, { startDelay: 1.3 }), type: "spring", stiffness: 260, damping: 16 });
      M.animate(allNodes, { scale: [0, 1] }, { delay: M.stagger(0.025, { startDelay: 1.9 }), type: "spring", stiffness: 300, damping: 14 });
      M.animate(allEdges, { opacity: [0, 1] }, { delay: M.stagger(0.015, { startDelay: 2.0 }), duration: .5 });
      M.animate(tagsL, { opacity: [0, 1] }, { delay: 2.4, duration: .6 });
      M.animate(".intro > *", { opacity: [0, 1], y: [16, 0] }, { delay: M.stagger(0.1, { startDelay: .2 }), type: "spring", stiffness: 140, damping: 20 });
    }
    // sap: little amber pulses rising from the roots into each canopy
    const routes = BR.map(b => { const p = el("path", { d: `M980 744 C 976 650, 986 ${b.cy + 200}, 980 ${Math.max(b.cy + 140, 480)} L ${b.cx} ${b.cy}`, fill: "none", stroke: "none" }, pulseL); return { p, L: p.getTotalLength() }; });
    const live = []; let running = true;
    const tick = now => {
      if (!running) return;
      if (live.length < 6 && Math.random() < .035) live.push({ c: el("circle", { r: 4, fill: "var(--amber)" }, pulseL), r: routes[Math.floor(Math.random() * 3)], s: now });
      for (let i = live.length - 1; i >= 0; i--) {
        const q = live[i], k = (now - q.s) / 2800;
        if (k >= 1) { q.c.remove(); live.splice(i, 1); continue; }
        const pt = q.r.p.getPointAtLength(q.r.L * k);
        q.c.setAttribute("cx", pt.x); q.c.setAttribute("cy", pt.y); q.c.setAttribute("opacity", Math.min(1, (1 - k) * 2));
      }
      requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 2600);
    document.addEventListener("visibilitychange", () => { const was = running; running = !document.hidden; if (running && !was) requestAnimationFrame(tick); });
  }
})();
