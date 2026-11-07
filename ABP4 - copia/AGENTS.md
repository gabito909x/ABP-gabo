# AGENTS.md

Static multi-page site (no build, tests, package manager, or CI).

## Structure
- `index.html` pairs with `estilos.css`, `textos.js`, `script.js`.
- `carrera.html`, `por-que.html` pair with `style.css` and `main.js`.
- `tipografias.html` is standalone (inline CSS, no JS).
- Shared asset: `foto-mama.png`.
- Do not mix asset pairs between page families.

## Content flow (index only)
- `textos.js` defines `window.PROYECTO_TEXTOS`; `script.js` is deferred and must load after it. It overwrites fallback HTML via `data-text` and indexed selectors.
- Only these are wired: `quienSoy.introduccion/historia/intereses/cualidades/unico`; `carrera.tarjetas`; `porQue[].respuesta`; `camino.corto/mediano/largo[0]`; `realidad.tarjetas`; `futuro.sueños`; `salarios`. Other fields (e.g. `sitio`, `carrera.titulo`, `quienSoy.nombre`) are unused by JS.
- Keep array lengths and DOM order aligned: `carrera.tarjetas` ↔ first 5 `.carrera-card p` (Mi carrera carousel; the other `.carrera-card` blocks are static); `porQue` ↔ `.flip-cara.respuesta` (6); `camino.corto` ↔ `.meta-uno ... li` (5); `camino.mediano` ↔ `.meta-dos ... li` (4); `realidad.tarjetas` ↔ `.realidad-grid article p` (5); `futuro.sueños` ↔ `.sueño p` (3); `camino.largo[0]` → single `.meta-tres ... p`.
- `carrera.html`/`por-que.html` keep their own static copy (not driven by textos.js).

## Conventions
- Interaction class names differ by family: index uses `.volteada`/`.abierto`/`.menu-movil`; carrera/por-que use `.is-flipped`/`.is-open`/`.mobile-toggle`+`.nav-links`.

## Verification
- Serve locally: `python -m http.server 8000` from repo root, open each page, check browser console.
- No automated tests/lint/typecheck exist.
