/* VERDANT panels — stories, the beetle's names, ask the owl, join. Motion (motion.dev) for springs. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const M = window.Motion;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  /* drawings of the four trees (trunk story) */
  const TREE_SVG = ["<svg viewBox=\"0 0 220 170\" role=\"img\" aria-label=\"Porphyry's tree: substance, body, living, animal, human, each split in two\"><g stroke=\"var(--fg-2)\" stroke-width=\"1.4\" fill=\"none\"><path d=\"M110 14 V156\"/><path d=\"M110 36 H62 M110 36 H158 M110 70 H62 M110 70 H158 M110 104 H62 M110 104 H158 M110 138 H62 M110 138 H158\" stroke-dasharray=\"3 3\"/></g><g font-size=\"10\" fill=\"var(--fg)\" text-anchor=\"middle\"><rect x=\"74\" y=\"26\" width=\"72\" height=\"20\" rx=\"10\" fill=\"var(--bg)\" stroke=\"var(--fg-2)\"/><text x=\"110\" y=\"40\">Substance</text><rect x=\"74\" y=\"60\" width=\"72\" height=\"20\" rx=\"10\" fill=\"var(--bg)\" stroke=\"var(--fg-2)\"/><text x=\"110\" y=\"74\">Body</text><rect x=\"74\" y=\"94\" width=\"72\" height=\"20\" rx=\"10\" fill=\"var(--bg)\" stroke=\"var(--fg-2)\"/><text x=\"110\" y=\"108\">Animal</text><rect x=\"74\" y=\"128\" width=\"72\" height=\"20\" rx=\"10\" fill=\"var(--bg)\" stroke=\"var(--amber)\"/><text x=\"110\" y=\"142\" fill=\"var(--amber)\">Human</text><text x=\"36\" y=\"40\" fill=\"var(--fg-2)\">corporeal</text><text x=\"186\" y=\"40\" fill=\"var(--fg-2)\">incorporeal</text><text x=\"36\" y=\"74\" fill=\"var(--fg-2)\">animate</text><text x=\"186\" y=\"74\" fill=\"var(--fg-2)\">inanimate</text><text x=\"36\" y=\"108\" fill=\"var(--fg-2)\">sensitive</text><text x=\"186\" y=\"108\" fill=\"var(--fg-2)\">insensitive</text><text x=\"36\" y=\"142\" fill=\"var(--fg-2)\">rational</text><text x=\"186\" y=\"142\" fill=\"var(--fg-2)\">irrational</text></g></svg>", "<svg viewBox=\"0 0 220 170\" role=\"img\" aria-label=\"Linnaeus: the two-part name Lucanus cervus, genus and species\"><text x=\"110\" y=\"92\" text-anchor=\"middle\" font-family=\"Instrument Serif, Georgia, serif\" font-style=\"italic\" font-size=\"32\" fill=\"var(--fg)\">Lucanus cervus</text><g stroke=\"var(--fg-2)\" stroke-width=\"1.2\" fill=\"none\"><path d=\"M14 104 v8 h96 v-8\"/><path d=\"M120 104 v8 h86 v-8\"/></g><g font-size=\"11\" fill=\"var(--fg-2)\" text-anchor=\"middle\"><text x=\"62\" y=\"130\">genus</text><text x=\"163\" y=\"130\">species</text></g><text x=\"110\" y=\"40\" text-anchor=\"middle\" font-size=\"11\" fill=\"var(--amber)\" letter-spacing=\"1.5\">L. 1758</text></svg>", "<svg viewBox=\"0 0 220 170\" role=\"img\" aria-label=\"Darwin's 1837 'I think' sketch: one ancestor branching into species A, B, C and D\"><text x=\"22\" y=\"30\" font-family=\"Instrument Serif, Georgia, serif\" font-style=\"italic\" font-size=\"24\" fill=\"var(--fg)\">I think</text><g stroke=\"var(--fg)\" stroke-width=\"1.4\" fill=\"none\" stroke-linecap=\"round\"><path class=\"draw\" d=\"M70 150 C 74 130, 66 118, 80 104 C 96 90, 104 80, 110 64\"/><path class=\"draw\" d=\"M80 104 C 70 92, 58 84, 50 70\"/><path class=\"draw\" d=\"M110 64 C 118 56, 134 50, 150 46\"/><path class=\"draw\" d=\"M110 64 C 112 52, 108 44, 116 34\"/><path class=\"draw\" d=\"M96 90 C 120 92, 150 86, 176 78\"/><path class=\"draw\" d=\"M150 46 C 162 50, 176 42, 190 44\"/></g><circle cx=\"70\" cy=\"152\" r=\"6\" fill=\"none\" stroke=\"var(--fg)\"/><text x=\"66\" y=\"156\" font-size=\"9\" fill=\"var(--fg)\">1</text><g font-family=\"Instrument Serif, Georgia, serif\" font-size=\"15\" fill=\"var(--amber)\"><text x=\"40\" y=\"66\">A</text><text x=\"114\" y=\"30\">B</text><text x=\"180\" y=\"76\">C</text><text x=\"194\" y=\"44\">D</text></g></svg>", "<svg viewBox=\"0 0 220 170\" role=\"img\" aria-label=\"VERDANT: one name linked to many databases\"><g stroke=\"var(--fg-2)\" stroke-width=\"1.2\"><line x1=\"110\" y1=\"86\" x2=\"40\" y2=\"40\"/><line x1=\"110\" y1=\"86\" x2=\"182\" y2=\"38\"/><line x1=\"110\" y1=\"86\" x2=\"196\" y2=\"112\"/><line x1=\"110\" y1=\"86\" x2=\"30\" y2=\"128\"/><line x1=\"110\" y1=\"86\" x2=\"110\" y2=\"154\"/></g><circle cx=\"40\" cy=\"40\" r=\"9\" fill=\"var(--ols)\"/><circle cx=\"182\" cy=\"38\" r=\"9\" fill=\"var(--wikidata)\"/><circle cx=\"196\" cy=\"112\" r=\"9\" fill=\"var(--dbpedia)\"/><circle cx=\"30\" cy=\"128\" r=\"9\" fill=\"var(--gbif)\"/><circle cx=\"110\" cy=\"154\" r=\"9\" fill=\"var(--ols)\"/><circle cx=\"110\" cy=\"86\" r=\"16\" fill=\"var(--amber)\"/><text x=\"110\" y=\"90\" text-anchor=\"middle\" font-size=\"10\" font-weight=\"600\" fill=\"var(--on-amber)\">beech</text></svg>"];
  /* ================= ONE BEETLE, MANY NAMES ================= */
  // Each neighbour = one triple. VERDANT URIs follow the pipeline (n2k:species_…, n2k:habitat_…).
  // Public identifiers checked against OLS4, Wikidata and DBpedia (Oct 2026):
  // NCBITaxon 41109 Lucanus cervus (genus 41108, family 41105); Wikidata Q190491 (P685 = 41109);
  // ENVO:01000202 temperate broadleaf forest biome; ENVO:01000430 broadleaf forest; dbr:Lucanus_cervus; dbr:Fagus_sylvatica.
  const subjects = {
    beetle: { label: "Stag beetle", sci: "Lucanus cervus", curie: "n2k:species_lucanus_cervus", nodes: [
      { key: "ncbi", x: 130, y: 110, label: "Lucanus cervus", curie: "NCBITaxon:41109", src: "ncbi", p: "skos:exactMatch", o: "obo:NCBITaxon_41109", plain: "Our stag beetle is exactly NCBI's taxon 41109." },
      { key: "wd", x: 590, y: 110, label: "Lucanus cervus", curie: "wd:Q190491", src: "wikidata", p: "skos:exactMatch", o: "wd:Q190491", plain: "Our stag beetle is exactly Wikidata's item Q190491." },
      { key: "dbp", x: 610, y: 330, label: "Lucanus cervus", curie: "dbr:Lucanus_cervus", src: "dbpedia", p: "skos:closeMatch", o: "dbr:Lucanus_cervus", plain: "Our stag beetle is close to Wikipedia's article on it." },
      { key: "cls", x: 120, y: 340, label: "Invertebrate species", curie: "n2k:InvertebrateSpecies", src: "n2k", p: "rdf:type", o: "n2k:InvertebrateSpecies", plain: "The stag beetle is an invertebrate species." },
      { key: "law", x: 360, y: 420, label: "Habitats Directive", curie: "n2k:HabitatsDirective", src: "law", p: "n2k:protectedBy", o: "n2k:HabitatsDirective", plain: "The stag beetle is protected by the Habitats Directive." },
      { key: "gbif", x: 360, y: 46, label: "GBIF sightings", curie: "added this week", src: "gbif", planned: true, p: "n2k:gbifTaxon", o: "gbif:…", plain: "This week: link the stag beetle to its GBIF sightings." }
    ]},
    beech: { label: "Beech forest", sci: "Annex I · 9130", curie: "n2k:habitat_9130_asperulo_fagetum_beech_forests", nodes: [
      { key: "envo", x: 130, y: 110, label: "temperate broadleaf forest biome", curie: "ENVO:01000202", src: "envo", p: "skos:closeMatch", o: "obo:ENVO_01000202", plain: "Beech forest 9130 is close to ENVO's temperate broadleaf forest biome." },
      { key: "envo2", x: 590, y: 110, label: "broadleaf forest", curie: "ENVO:01000430", src: "envo", p: "skos:relatedMatch", o: "obo:ENVO_01000430", plain: "Beech forest 9130 is related to ENVO's broadleaf forest." },
      { key: "dbp", x: 610, y: 330, label: "European beech", curie: "dbr:Fagus_sylvatica", src: "dbpedia", p: "skos:relatedMatch", o: "dbr:Fagus_sylvatica", plain: "Beech forest 9130 is related to Wikipedia's European beech." },
      { key: "cls", x: 120, y: 340, label: "Forest habitat", curie: "n2k:ForestHabitat", src: "n2k", p: "rdf:type", o: "n2k:ForestHabitat", plain: "Beech forests are a forest habitat (codes 9xxx)." },
      { key: "law", x: 360, y: 420, label: "Habitats Directive", curie: "n2k:HabitatsDirective", src: "law", p: "n2k:protectedBy", o: "n2k:HabitatsDirective", plain: "Beech forests are protected by the Habitats Directive." },
      { key: "eunis", x: 360, y: 46, label: "EUNIS habitat", curie: "added this week", src: "gbif", planned: true, p: "skos:closeMatch", o: "eunis:…", plain: "This week: map Annex I habitats to the EUNIS classification." }
    ]}
  };
  const SRC = {
    ncbi: { color: "var(--ols)", name: "NCBI Taxonomy", kind: "A family tree of life",
      text: "Every organism in the NCBI databases, placed in its lineage. Genetic data hangs on these numbers.",
      draw: `<svg viewBox="0 0 320 200" role="img" aria-label="NCBI Taxonomy lineage: Lucanidae 41105, Lucanus 41108, Lucanus cervus 41109"><g stroke="var(--fg-2)" stroke-width="1.4" fill="none"><path d="M40 40 V160 M40 100 H110 M110 100 V160 M110 130 H170"/></g><g font-size="12" fill="var(--fg)"><circle cx="40" cy="40" r="7" fill="var(--ols)"/><text x="54" y="44">Lucanidae · 41105</text><circle cx="110" cy="100" r="7" fill="var(--ols)"/><text x="124" y="96">Lucanus · 41108</text><circle cx="170" cy="130" r="9" fill="var(--amber)"/><text x="184" y="126" font-weight="600">Lucanus cervus</text><text x="184" y="142" font-weight="600">41109</text><circle cx="40" cy="160" r="5" fill="var(--fg-2)"/><circle cx="110" cy="160" r="5" fill="var(--fg-2)"/><text x="52" y="164" fill="var(--fg-2)" font-size="11">other genera</text></g></svg>` },
    wikidata: { color: "var(--wikidata)", name: "Wikidata", kind: "A shared notebook of facts",
      text: "Anyone can add a fact as item · property · value. The stag beetle's item also stores its NCBI number, so the two link up.",
      draw: `<svg viewBox="0 0 320 200" role="img" aria-label="Wikidata statements: Q190491 has taxon name Lucanus cervus and NCBI taxonomy ID 41109"><rect x="20" y="70" width="90" height="60" rx="12" fill="none" stroke="var(--wikidata)" stroke-width="2"/><text x="65" y="98" text-anchor="middle" font-size="13" font-weight="600" fill="var(--fg)">Q190491</text><text x="65" y="116" text-anchor="middle" font-size="11" fill="var(--fg-2)">stag beetle</text><g stroke="var(--fg-2)" stroke-width="1.4" fill="none"><path d="M110 90 C 150 90, 160 56, 196 56"/><path d="M110 112 C 150 112, 160 146, 196 146"/></g><g font-size="11" fill="var(--fg-2)" font-family="IBM Plex Mono, monospace"><text x="132" y="62">P225</text><text x="132" y="152">P685</text></g><g font-size="13" fill="var(--fg)"><text x="202" y="52" font-style="italic">"Lucanus cervus"</text><text x="202" y="70" font-size="11" fill="var(--fg-2)">taxon name</text><text x="202" y="142">"41109"</text><text x="202" y="160" font-size="11" fill="var(--fg-2)">NCBI taxonomy ID</text></g></svg>` },
    dbpedia: { color: "var(--dbpedia)", name: "DBpedia", kind: "Wikipedia, read by machines",
      text: "Each Wikipedia article becomes a node, so everything written about the stag beetle becomes searchable.",
      draw: `<svg viewBox="0 0 320 200" role="img" aria-label="A Wikipedia page turned into a node with linked facts"><rect x="30" y="30" width="96" height="130" rx="8" fill="none" stroke="var(--fg-2)" stroke-width="1.6"/><g stroke="var(--fg-2)" stroke-width="2" stroke-linecap="round"><path d="M44 52h50M44 66h68M44 80h60M44 94h68M44 108h40M44 122h62M44 136h48"/></g><path d="M134 95 h40" stroke="var(--dbpedia)" stroke-width="2" marker-end="url(#ar)"/><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--dbpedia)"/></marker></defs><circle cx="230" cy="95" r="18" fill="var(--dbpedia)"/><g stroke="var(--fg-2)" stroke-width="1.2"><line x1="230" y1="95" x2="290" y2="50"/><line x1="230" y1="95" x2="296" y2="110"/><line x1="230" y1="95" x2="260" y2="160"/></g><g fill="var(--fg-2)"><circle cx="290" cy="50" r="6"/><circle cx="296" cy="110" r="6"/><circle cx="260" cy="160" r="6"/></g></svg>` },
    envo: { color: "var(--ols)", name: "ENVO", kind: "Where life happens",
      text: "The Environment Ontology names where life happens. A temperate broadleaf forest biome is both a temperate biome and a broadleaf forest biome: it sits where the two meet.",
      draw: `<svg viewBox="0 0 320 200" role="img" aria-label="ENVO: temperate broadleaf forest biome sits where temperate biome and broadleaf forest biome overlap"><g stroke-width="2"><circle cx="112" cy="104" r="80" fill="color-mix(in srgb, var(--ols) 10%, transparent)" stroke="var(--ols)"/><circle cx="208" cy="104" r="80" fill="color-mix(in srgb, var(--wikidata) 10%, transparent)" stroke="var(--wikidata)"/></g><g text-anchor="middle" fill="var(--fg)"><text x="74" y="70" font-size="12" font-weight="600">temperate</text><text x="74" y="85" font-size="12" font-weight="600">biome</text><text x="246" y="70" font-size="12" font-weight="600">broadleaf</text><text x="246" y="85" font-size="12" font-weight="600">forest biome</text><circle cx="160" cy="118" r="8" fill="var(--amber)"/><text x="160" y="146" font-size="10" fill="var(--fg)">temperate</text><text x="160" y="158" font-size="10" fill="var(--fg)">broadleaf forest</text><text x="160" y="174" font-size="9" fill="var(--fg-2)">ENVO:01000202</text></g></svg>` },
    n2k: { color: "var(--amber)", name: "VERDANT ontology", kind: "The law, made formal",
      text: "Annex lists turned into classes: a stag beetle is an invertebrate species, a beech forest a forest habitat. Habitat codes start with their family.",
      draw: `<svg viewBox="0 0 320 200" role="img" aria-label="Class tree: Natura 2000 term splits into Species and Habitat; Species into Invertebrate species; Habitat into Forest habitat"><g stroke="var(--fg-2)" stroke-width="1.4" fill="none"><path d="M160 36 V60 M90 60 H230 M90 60 V84 M230 60 V84 M90 106 V134 M230 106 V134"/></g><g font-size="12" text-anchor="middle" fill="var(--fg)"><rect x="100" y="16" width="120" height="24" rx="12" fill="var(--bg)" stroke="var(--amber)"/><text x="160" y="32">Natura 2000 term</text><rect x="50" y="84" width="80" height="24" rx="12" fill="var(--bg)" stroke="var(--fg-2)"/><text x="90" y="100">Species</text><rect x="190" y="84" width="80" height="24" rx="12" fill="var(--bg)" stroke="var(--fg-2)"/><text x="230" y="100">Habitat</text><rect x="30" y="134" width="120" height="24" rx="12" fill="var(--bg)" stroke="var(--amber)"/><text x="90" y="150">Invertebrate sp.</text><rect x="170" y="134" width="120" height="24" rx="12" fill="var(--bg)" stroke="var(--amber)"/><text x="230" y="150">Forest habitat 9xxx</text></g></svg>` },
    law: { color: "var(--fg-2)", name: "EU law", kind: "Why it matters",
      text: "The Habitats Directive (1992) and Birds Directive (2009) define what Europe must protect. VERDANT keeps that link in every record.",
      draw: `<svg viewBox="0 0 320 200" role="img" aria-label="A legal document with annex lists"><path d="M100 24 h100 l20 20 v132 h-120z" fill="none" stroke="var(--fg-2)" stroke-width="1.8"/><path d="M200 24 v20 h20" fill="none" stroke="var(--fg-2)" stroke-width="1.8"/><text x="160" y="66" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-size="18" fill="var(--fg)">Annex II · IV</text><g stroke="var(--fg-2)" stroke-width="2" stroke-linecap="round"><path d="M118 88h84M118 102h70M118 116h80M118 130h60M118 144h76"/></g><circle cx="230" cy="150" r="20" fill="none" stroke="var(--amber)" stroke-width="2"/><text x="230" y="155" text-anchor="middle" font-size="12" fill="var(--amber)">EU</text></svg>` },
    gbif: { color: "var(--gbif)", name: "Coming this week", kind: "A branch to grow",
      text: "Not linked yet. This is exactly what the Data branch adds in Barcelona.",
      draw: `<svg viewBox="0 0 320 200" role="img" aria-label="A dashed link waiting to be drawn"><circle cx="80" cy="100" r="24" fill="var(--amber)"/><path d="M110 100 H210" stroke="var(--gbif)" stroke-width="2.4" stroke-dasharray="6 6"/><circle cx="240" cy="100" r="24" fill="none" stroke="var(--gbif)" stroke-width="2.4" stroke-dasharray="5 5"/><text x="240" y="105" text-anchor="middle" font-size="18" fill="var(--gbif)">?</text></svg>` }
  };
  const SRCCOL = { ncbi: "var(--ols)", envo: "var(--ols)", wikidata: "var(--wikidata)", dbpedia: "var(--dbpedia)", n2k: "var(--amber)", law: "var(--fg-2)", gbif: "var(--gbif)" };
  const wsvg = document.getElementById("wolf"), nature = document.getElementById("nature");
  let subjKey = "beetle";
  const setNature = (n) => {
    const s = SRC[n.src];
    nature.innerHTML = `<span class="kind" style="color:${s.color}">${esc(s.kind)}</span><h3>${esc(s.name)}</h3>${s.draw}<p>${esc(s.text)}</p>`;
    if (M && !reduce) M.animate(nature.children, { opacity: [0, 1], y: [12, 0] }, { delay: M.stagger(0.05), type: "spring", stiffness: 220, damping: 22 });
  };
  const setTriple = (subj, n) => {
    document.getElementById("t-s").textContent = subj.curie;
    document.getElementById("t-p").textContent = n.p;
    const o = document.getElementById("t-o"); o.textContent = n.o; o.style.color = SRCCOL[n.src];
    document.getElementById("t-plain").textContent = `“${n.plain}”`;
  };
  const select = (key) => {
    const subj = subjects[subjKey], n = subj.nodes.find(x => x.key === key);
    wsvg.querySelectorAll(".nb").forEach(g => g.classList.toggle("on", g.dataset.key === key));
    wsvg.querySelectorAll(".edge").forEach(e => e.classList.toggle("on", e.dataset.key === key));
    setTriple(subj, n); setNature(n);
  };
  const drawGraph = () => {
    const subj = subjects[subjKey];
    wsvg.innerHTML = "";
    const C = { x: 360, y: 240 };
    const edges = el("g", {}, wsvg), preds = el("g", {}, wsvg), nodes = el("g", {}, wsvg);
    subj.nodes.forEach(n => {
      const col = SRCCOL[n.src];
      const path = el("path", { d: `M${C.x} ${C.y} L${n.x} ${n.y}`, class: "edge", stroke: col, "stroke-opacity": n.planned ? .7 : .85, "stroke-dasharray": n.planned ? "6 6" : "none", "data-key": n.key }, edges);
      const mx = (C.x + n.x) / 2, my = (C.y + n.y) / 2;
      const t = el("text", { x: mx, y: my - 8, "text-anchor": "middle", class: "pred" }, preds); t.textContent = n.p;
      const g = el("g", { class: "nb", tabindex: 0, role: "button", "data-key": n.key, "aria-label": `${n.label}, ${n.curie}. Show the sentence.` }, nodes);
      el("circle", { cx: n.x, cy: n.y, r: 30, class: "halo", fill: "none", stroke: col, "stroke-width": 2, "stroke-opacity": .5 }, g);
      el("circle", { cx: n.x, cy: n.y, r: 18, class: "dot", fill: n.planned ? "var(--bg)" : col, stroke: col, "stroke-width": 2, "stroke-dasharray": n.planned ? "4 4" : "none" }, g);
      const below = n.y > C.y || n.y < 80;
      const ly = n.y < 80 ? n.y - 30 : below ? n.y + 40 : n.y - 34;
      const l1 = el("text", { x: n.x, y: ly, "text-anchor": "middle", class: "lbl" }, g); l1.textContent = n.label;
      const l2 = el("text", { x: n.x, y: ly + 16, "text-anchor": "middle", class: "cur" }, g); l2.textContent = n.curie;
      el("circle", { cx: n.x, cy: n.y, r: 34, fill: "transparent" }, g);
      g.addEventListener("click", () => select(n.key));
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.key); } });
      if (!reduce) { const L = path.getTotalLength(); if (!n.planned) { path.style.strokeDasharray = L; path.style.strokeDashoffset = L; path.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 700, delay: 80 * subj.nodes.indexOf(n), easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" }); } }
    });
    const cg = el("g", {}, nodes);
    el("circle", { cx: C.x, cy: C.y, r: 46, fill: "var(--amber)" }, cg);
    const a = el("text", { x: C.x, y: C.y - 2, "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: "var(--on-amber)" }, cg); a.textContent = subj.label;
    const b = el("text", { x: C.x, y: C.y + 15, "text-anchor": "middle", "font-size": 11, "font-style": "italic", fill: "var(--on-amber)" }, cg); b.textContent = subj.sci;
    if (M && !reduce) M.animate(nodes.querySelectorAll(".nb"), { opacity: [0, 1] }, { delay: M.stagger(0.07, { startDelay: .2 }), duration: .4 });
    select(subj.nodes[0].key);
  };
  document.querySelectorAll("[data-subject]").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("[data-subject]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    subjKey = b.dataset.subject; drawGraph();
  }));

  /* ================= ASK THE GRAPH ================= */
  // Illustrative answers for the interface sketch. Species codes are Natura 2000 species codes.
  const animal = (c) => `<svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="color-mix(in srgb, ${c} 18%, transparent)"/><path d="M14 32c6-10 22-12 30-4-4 2-6 6-6 8-8 2-18 2-24-4z" fill="${c}"/><circle cx="38" cy="28" r="1.6" fill="var(--bg)"/></svg>`;
  const place = (c) => `<svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="color-mix(in srgb, ${c} 18%, transparent)"/><path d="M10 38l12-14 8 8 6-6 10 12z" fill="${c}"/></svg>`;
  const words = (c) => `<svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="color-mix(in srgb, ${c} 18%, transparent)"/><circle cx="20" cy="28" r="6" fill="${c}"/><circle cx="38" cy="22" r="4" fill="${c}"/><circle cx="38" cy="36" r="4" fill="${c}"/><path d="M20 28 38 22M20 28 38 36" stroke="${c}" stroke-width="2"/></svg>`;
  const S2 = (arr) => arr.map(([n, c]) => `<span style="--c:${c}">${n}</span>`).join("");
  const QA = {
    estuary: { q: "Which protected species live in estuaries?", items: [
      { icon: animal("var(--wikidata)"), b: "Sea lamprey", i: "Petromyzon marinus", src: S2([["Annex II · 1095", "var(--amber)"], ["NCBI", "var(--ols)"], ["GBIF", "var(--gbif)"]]) },
      { icon: animal("var(--wikidata)"), b: "Allis shad", i: "Alosa alosa", src: S2([["Annex II · 1102", "var(--amber)"], ["NCBI", "var(--ols)"], ["Wikidata", "var(--wikidata)"]]) },
      { icon: animal("var(--wikidata)"), b: "Atlantic salmon", i: "Salmo salar", src: S2([["Annex II · 1106", "var(--amber)"], ["NCBI", "var(--ols)"], ["GBIF", "var(--gbif)"]]) },
      { icon: animal("var(--dbpedia)"), b: "Harbour seal", i: "Phoca vitulina", src: S2([["Annex II · 1365", "var(--amber)"], ["Wikidata", "var(--wikidata)"], ["DBpedia", "var(--dbpedia)"]]) }
    ]},
    forest: { q: "What lives in an old beech forest?", items: [
      { icon: animal("var(--leaf-3)"), b: "Stag beetle", i: "Lucanus cervus", src: S2([["Annex II · 1083", "var(--amber)"], ["NCBI 41109", "var(--ols)"], ["Wikidata", "var(--wikidata)"]]) },
      { icon: animal("var(--wikidata)"), b: "Rosalia longicorn", i: "Rosalia alpina", src: S2([["Annex II · 1087*", "var(--amber)"], ["NCBI", "var(--ols)"], ["GBIF", "var(--gbif)"]]) },
      { icon: animal("var(--leaf-3)"), b: "Hermit beetle", i: "Osmoderma eremita", src: S2([["Annex II · 1084*", "var(--amber)"], ["NCBI", "var(--ols)"], ["DBpedia", "var(--dbpedia)"]]) },
      { icon: animal("var(--dbpedia)"), b: "Bechstein's bat", i: "Myotis bechsteinii", src: S2([["Annex II · 1323", "var(--amber)"], ["Wikidata", "var(--wikidata)"], ["GBIF", "var(--gbif)"]]) }
    ]},
    bog: { q: "What do other databases call a raised bog?", items: [
      { icon: words("var(--amber)"), b: "Active raised bogs", i: "Natura 2000 · 7110*", src: S2([["the legal name", "var(--amber)"]]) },
      { icon: words("var(--ols)"), b: "bog", i: "ENVO", src: S2([["close match", "var(--ols)"]]) },
      { icon: words("var(--wikidata)"), b: "raised bog", i: "Wikidata", src: S2([["exact match", "var(--wikidata)"]]) },
      { icon: words("var(--dbpedia)"), b: "Bog", i: "DBpedia", src: S2([["related", "var(--dbpedia)"]]) }
    ]}
  };
  const qEl = document.getElementById("ask-q"), timeEl = document.getElementById("ask-time"), resEl = document.getElementById("results");
  let typing = 0;
  const ask = (key) => {
    const qa = QA[key];
    clearInterval(typing);
    resEl.innerHTML = ""; timeEl.textContent = "searching…";
    const show = () => {
      timeEl.textContent = `${qa.items.length} results · 0.${2 + qa.items.length % 3} s`;
      resEl.innerHTML = qa.items.map(r => `<div class="res">${r.icon}<div><b>${esc(r.b)}</b><i>${esc(r.i)}</i><div class="src">${r.src}</div></div></div>`).join("");
      if (M && !reduce) M.animate(resEl.children, { opacity: [0, 1], y: [16, 0], scale: [.97, 1] }, { delay: M.stagger(0.08), type: "spring", stiffness: 240, damping: 20 });
    };
    if (reduce) { qEl.textContent = qa.q; show(); return; }
    let i = 0; qEl.textContent = "";
    typing = setInterval(() => { i++; qEl.textContent = qa.q.slice(0, i); if (i >= qa.q.length) { clearInterval(typing); setTimeout(show, 280); } }, 28);
  };
  document.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("[data-q]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    ask(b.dataset.q);
  }));
  qEl.textContent = QA.forest.q;
  resEl.innerHTML = QA.forest.items.map(r => `<div class="res">${r.icon}<div><b>${esc(r.b)}</b><i>${esc(r.i)}</i><div class="src">${r.src}</div></div></div>`).join("");
  /* ================= STORIES ================= */
  const S = {
    history: { title: "Four trees", sub: "Why a tree", slides: [
      { k: "c. 270 CE · Porphyry", h: "Divide.", draw: 0, p: "What is a thing? Split being into kinds, two at a time. Ontology, from the Greek: the study of what is." },
      { k: "1758 · Linnaeus", h: "Name.", draw: 1, p: "Two words for every living thing. The stag beetle got its name this year." },
      { k: "1837 · Darwin", h: "Relate.", draw: 2, p: "“I think.” Every kind shares an ancestor. The tree became a tree of life." },
      { k: "2026 · VERDANT", h: "Link.", draw: 3, p: "One name, understood by every database at once. What we cannot name, we cannot protect.", cta: true }
    ]},
    roots: { title: "Roots", sub: "What already works", slides: [
      { k: "The roots", h: "Already in the ground.", big: "1,955", p: "Every protected habitat, species, region and status from the Habitats and Birds Directives, described in one structured vocabulary." },
      { k: "Linked", h: "Over 14,500 introductions.", chips: ["NCBI Taxonomy", "ENVO", "Wikidata", "DBpedia"], p: "Each term is connected to how the world's biological databases already name it." },
      { k: "A sentence", h: "Every link is a sentence.", triple: ["n2k:species_lucanus_cervus", "skos:exactMatch", "obo:NCBITaxon_41109"], p: "Subject, verb, object: “our stag beetle is exactly NCBI's taxon 41109.”" },
      { k: "Ready", h: "On Monday, you build.", p: "It runs today. You don't start from zero: you start from 14,500 links.", cta: true }
    ]},
    data: { title: "Grow the data", sub: "Branch · Data", slides: [
      { k: "The goal", h: "Every protected species, with real sightings.", big: "1,711", p: "Annex species linked to GBIF occurrence records, counted by biogeographical region." },
      { k: "Habitats", h: "Habitats in EUNIS terms.", chips: ["Annex I · 9130 Beech forests", "↔", "EUNIS"], p: "A crosswalk so the legal habitat codes meet the European habitat classification." },
      { k: "Ask it", h: "A search page that answers in seconds.", chips: ["What lives in an old beech forest?", "Which species live in estuaries?"], p: "Plain-language questions, answers from every linked database at once. No code." },
      { k: "Is this you?", h: "You'd love this branch if…", chips: ["you know GBIF", "field data", "habitat mapping", "spreadsheets"], take: "The first map of protected species and their real sightings.", cta: true }
    ]},
    learn: { title: "Teach it to learn", sub: "Branch · Experts", slides: [
      { k: "The question", h: "Is a raised bog a peatland?", p: "A computer measures how similar two words are. It can't know what an ecologist knows." },
      { k: "The loop", h: "You judge. It learns.", loop: [["The AI suggests a match", "AI"], ["You say yes, no or fix", "you"], ["Your answer becomes a lesson", "data"], ["Next suggestions get better", "AI"]] },
      { k: "Ask the tree", h: "An assistant that knows the law.", p: "Ask about a protected species in plain words. It answers from the graph, and shows where each fact came from." },
      { k: "Is this you?", h: "You'd love this branch if…", chips: ["you know your species", "habitat expertise", "curious about AI", "UI design"], take: "The first expert-checked set of Natura 2000 links.", cta: true }
    ]},
    connect: { title: "Connect the forest", sub: "Branch · Community", slides: [
      { k: "Partner", h: "Where conservation meets the microbiome.", p: "MiCoKnowGraph (Project 16) builds a microbiome graph. We share habitats and species, and build together on Thursday." },
      { k: "A shared word", h: "Same forest, two sciences.", triple: ["n2k:habitat_9130_asperulo_fagetum_beech_forests", "skos:closeMatch", "obo:ENVO_01000202"], p: "When both graphs use the same ENVO forest, a soil microbiome sample and a protected beech forest can finally meet." },
      { k: "Further", h: "Plants and oceans next.", chips: ["ELIXIR Plant Sciences", "Marine Metagenomics", "TeSS training"], p: "Find where protected species overlap with other communities' data." },
      { k: "Is this you?", h: "You'd love this branch if…", chips: ["microbiology", "botany", "marine biology", "teaching"], take: "Your field's data joins the forest, and a tutorial helps your students plant the next trees.", cta: true }
    ]}
  };
  const story = document.getElementById("story"), card = document.getElementById("story-card"), body = document.getElementById("story-body"), bars = document.getElementById("bars");
  const pauseBtn = document.getElementById("story-pause");
  let cur = null, idx = 0, t = 0, last = 0, paused = reduce, opener = null, raf = 0;
  const DUR = 8000;
  const render = () => {
    const s = S[cur].slides[idx];
    let h = `<span class="k">${esc(s.k)}</span><h3>${esc(s.h)}</h3>`;
    if (s.big) h += `<div class="big">${esc(s.big)}</div>`;
    if (s.draw != null) h += `<div class="draw-box">${TREE_SVG[s.draw]}</div>`;
    if (s.triple) h += `<div class="triple"><span><b>${esc(s.triple[0])}</b></span><span>${esc(s.triple[1])}</span><span style="color:var(--ols)">${esc(s.triple[2])} .</span></div>`;
    if (s.p) h += `<p>${esc(s.p)}</p>`;
    if (s.chips) h += `<div class="chips">${s.chips.map(c => `<span>${esc(c)}</span>`).join("")}</div>`;
    if (s.loop) h += `<div class="loop">${s.loop.map(([a, b]) => `<span>${esc(a)}<em>${esc(b)}</em></span>`).join("")}</div>`;
    if (s.take) h += `<div class="take-home"><b>You take home:</b> ${esc(s.take)}</div>`;
    if (s.cta) h += `<button class="btn btn-primary" type="button" data-sheet="join">Join this branch →</button>`;
    body.innerHTML = h; body.scrollTop = 0;
    document.getElementById("story-count").textContent = `${idx + 1} / ${S[cur].slides.length}`;
    document.getElementById("story-prev").disabled = idx === 0;
    document.getElementById("story-next").textContent = idx === S[cur].slides.length - 1 ? "Done" : "Next";
    [...bars.children].forEach((b, i) => b.firstChild.style.width = i < idx ? "100%" : "0%");
    if (M && !reduce) M.animate(body.children, { opacity: [0, 1], y: [18, 0] }, { delay: M.stagger(0.05), type: "spring", stiffness: 220, damping: 22 });
    t = 0;
  };
  const go = d => { const n = idx + d; if (n < 0) return; if (n >= S[cur].slides.length) { close(); return; } idx = n; render(); };
  const loop = now => {
    if (story.hidden) return;
    if (!paused) { t += now - last; bars.children[idx].firstChild.style.width = Math.min(100, t / DUR * 100) + "%"; if (t >= DUR) go(1); }
    last = now; raf = requestAnimationFrame(loop);
  };
  const setPaused = v => {
    paused = v;
    pauseBtn.setAttribute("aria-label", v ? "Play" : "Pause auto-play");
    pauseBtn.innerHTML = v ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5v14l12-7z"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  };
  const open = (key, from, at) => {
    cur = key; idx = Math.min(at || 0, S[key].slides.length - 1); opener = from || document.activeElement;
    document.getElementById("story-title").textContent = S[key].title;
    document.getElementById("story-sub").textContent = S[key].sub;
    bars.innerHTML = S[key].slides.map(() => "<span><i></i></span>").join("");
    story.hidden = false;
    setPaused(reduce); render();
    if (M && !reduce) M.animate(card, { opacity: [0, 1], scale: [.92, 1], y: [24, 0] }, { type: "spring", stiffness: 260, damping: 24 });
    document.getElementById("story-close").focus();
    last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  };
  const close = () => { if (story.hidden) return; story.hidden = true; cancelAnimationFrame(raf); if (opener && opener.focus) opener.focus(); };
  document.getElementById("story-close").addEventListener("click", close);
  document.getElementById("story-prev").addEventListener("click", () => go(-1));
  document.getElementById("story-next").addEventListener("click", () => go(1));
  document.querySelector(".tapzone.prev").addEventListener("click", () => go(-1));
  document.querySelector(".tapzone.next").addEventListener("click", () => go(1));
  pauseBtn.addEventListener("click", () => setPaused(!paused));
  story.addEventListener("click", e => { if (e.target === story) close(); const j = e.target.closest("[data-sheet]"); if (j) { close(); window.VERDANT_SHEETS && window.VERDANT_SHEETS.open(j.dataset.sheet); } });
  document.addEventListener("keydown", e => {
    if (story.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "Tab") {
      const f = [...card.querySelectorAll("button:not([tabindex='-1']):not([disabled]), a[href]")];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });
  setPaused(reduce);

  window.VERDANT_PANELS = { openStory: open, closeStory: close, ask, drawGraph };
})();
