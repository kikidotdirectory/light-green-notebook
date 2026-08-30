# CLAUDE.md

## Do not

- do not delete or clean up `dist` (it's gitignored build output, but may be actively served — leave it alone).
- do not stop/kill a live dev server (`deno task serve`) if one is already running.

## Build & tooling

- No package.json/npm — this is a Deno + Lume static site.
- Build: `deno task build`. Dev server: `deno task serve`.
- Formatting uses dprint (`dprint.json`) with tabs, not spaces — match existing files.

## Architecture notes

- TS under `src/js` is auto-bundled by the `esbuild()` Lume plugin (declared in `_config.ts`).
- `src/css/global.css` is built to `/style.css` by Lume's `postcss()` plugin (configured in `_config.ts` with `postcss-import-ext-glob` + `postcss-import` + `autoprefixer`, in that order). Because `postcss-import` resolves partials at process time, Lume's watcher only tracks `global.css` itself — a `beforeUpdate` listener in `_config.ts` marks `global.css` as changed whenever any file under `src/css/` changes, so edits to partials still trigger a rebuild.
- `totalSpreads` and per-spread annotations aren't manually maintained: `src/_data/notebooks.ts` globs `src/assets/spreads/*.png` for the count and merges in `src/_data/_notebooks/lgn.yaml`'s `sections`/`numbered_start`. Adding/removing a spread image just works without updating a count anywhere.

## Conventions

- Spread image filenames (`src/assets/spreads/NNN.png`) and the URL hash (`#NNN`) are both zero-padded to 3 digits. This padding is duplicated in four places — keep them in sync if it ever changes: `src/js/page-navigation.ts` (`fileName`), `src/js/page-store.ts` (`pad`/`hashFor`), `src/index.vto` (hardcoded first-load image src), `src/scroll.vto` (inline `padStart`).
- When bulk-renaming/renumbering the spread assets, use `git mv` per file so git tracks them as renames instead of delete+add.
