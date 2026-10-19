# VERDANT website

The project website for VERDANT, BioHackathon Europe 2026, Project 11.
A static site: no build step, no server code.

```
site/
├── index.html      page markup
├── css/style.css   all styles (light + dark theme tokens at the top)
└── js/
    ├── main.js     the tree, the "one beetle" graph, Ask the graph, the rings, the stories (Motion for springs)
    ├── scroll.js   scroll storytelling with GSAP ScrollTrigger (pinned four trees, parallax hills, growth line)
    └── pollen.js   drifting pollen and fireflies behind the tree (three.js)
```

Libraries load from CDNs, pinned to exact versions: Motion 11.11.13, GSAP 3.12.5 + ScrollTrigger, three.js r128.
Everything degrades gracefully: with reduced motion turned on, or if a library fails to load, the page shows its full content without the effects.

## Preview locally

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish on GitHub Pages

1. Put the contents of `site/` in a repository (for example `verdant-website`), at the root or in `/docs`.
2. On GitHub: Settings → Pages → Source: "Deploy from a branch", pick the branch and folder.
3. The site appears at `https://<user-or-org>.github.io/verdant-website/`.

## Editing content

- Stories (the tree's branches and roots): the `S` object near the end of `js/main.js`.
- Ask the graph questions and answers: the `QA` object in `js/main.js`. These are example answers until the real interface exists.
- The species / habitat graph and its triples: the `subjects` and `SRC` objects in `js/main.js`.
  Identifiers were checked against OLS4, Wikidata and DBpedia in October 2026.

## Claude preview

`../build_preview.py` turns `site/index.html` into the preview page (`../index.html`) used for the claude.ai link.
Run it after editing `site/index.html`.
