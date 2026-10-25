# fakespace.net

Hobby hub for Zaid and friends. Static HTML, CSS, and a little JavaScript. No build step and no tracking.

GitHub Pages and Vercel can both serve this repo from the root. Links are relative, so the site works at a domain root or a project subpath. The top-level `api/` directory is reserved for future Python endpoints. This version does not add a backend.

## Pages

- `index.html` — home
- `dnd/index.html` — D&D campaign dashboard

## Editing the campaign

All dashboard copy lives in [`data/campaign.json`](data/campaign.json). Bracketed strings are placeholders. Set `"placeholder"` to `false` when the real notes are in.

`links[].url` may be an `http(s)` URL, a `mailto:` address, a relative path, or `""`. Keys that start with `_` are notes for editors. `schemaVersion` is `1`.

The page reads that file in the browser and only inserts text (never HTML). A later Python app can serve the same JSON without reshaping it.

## Local preview

Fetching the JSON needs HTTP, not a `file://` URL.

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/` and `http://localhost:8080/dnd/index.html`.
