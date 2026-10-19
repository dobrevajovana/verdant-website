# VERDANT website

The project website for VERDANT, BioHackathon Europe 2026, Project 11.
A static site: no build step, no server code.

```
site/
├── index.html      page markup: the scene, the leaf card, the explore bar, stories and panels
├── css/style.css   all styles (light + dark theme tokens at the top)
└── js/
    ├── tree.js     the one-screen tree: every glowing part, its message, and what it opens
    ├── panels.js   stories, the beetle's many names, ask the owl, join (Motion for springs)
    └── pollen.js   drifting pollen and fireflies behind the tree (three.js)
```

The whole site is one screen: no scrolling. Hover (or tap) anything that glows to read its message; click to open more.

Libraries load from CDNs, pinned to exact versions: Motion 11.11.13 and three.js r128.
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

- Hover messages for every part of the tree: `ROOT_TIPS`, `KNOTS`, `BR` (branches and their nodes), `WEEK` and the creatures in `js/tree.js`.
- Stories: the `S` object in `js/panels.js`.
- Ask the owl questions and answers: the `QA` object in `js/panels.js`. These are example answers until the real interface exists.
- The species / habitat graph and its triples: the `subjects` and `SRC` objects in `js/panels.js`.
  Identifiers were checked against OLS4, Wikidata and DBpedia in October 2026.
