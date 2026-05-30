# Portfolio Site Setup Guide

This is a personal portfolio + blog built with [Astro](https://astro.build/) using the Cactus theme, with [microCMS](https://microcms.io/) as the headless CMS for blog posts.

---

## Architecture

```
Content source: microCMS (cloud headless CMS)
        ↓
  src/data/microcms.ts  ← fetches posts via microCMS REST API
        ↓
  src/pages/posts/      ← static pages generated at build time
  src/pages/index.astro ← homepage showing latest 3 posts
```

**Key files:**
| File | Purpose |
|---|---|
| `src/data/microcms.ts` | microCMS API client — fetches post list, single post, total count |
| `src/pages/posts/[...slug].astro` | Individual post page |
| `src/pages/posts/[...page].astro` | Paginated post list |
| `src/pages/index.astro` | Homepage |
| `src/components/blog/PostPreview.astro` | Post preview card used on list pages |
| `src/site.config.ts` | Site title, description, nav links, base URL |
| `astro.config.ts` | Astro config — includes `base: '/fluffy-octo-chainsaw/'` for GitHub Pages |

---

## 1. microCMS Setup

The site reads all blog posts from microCMS. You need an account and an API endpoint called `blog`.

### Required environment variables

Create a `.env` file (copy `.env.example`):

```env
MICROCMS_SERVICE_DOMAIN=your-service-id   # e.g. o5q4jwgvjf (from your microCMS dashboard URL)
MICROCMS_API_KEY=your-api-key             # found in microCMS → API settings → API key
```

`MICROCMS_SERVICE_DOMAIN` is the subdomain part of `https://<domain>.microcms.io`.

### Expected microCMS API schema (endpoint: `blog`)

Your `blog` API should have these fields:

| Field name | Type | Required |
|---|---|---|
| `title` | Text | ✓ |
| `description` | Text | |
| `contents` | Rich editor or Repeater | |
| `publishedAt` | Date/time | |
| `updatedAt` | Date/time (auto) | |
| `draft` | Boolean | |
| `ogImage` | Media | |

microCMS auto-generates `id`, `createdAt`, `updatedAt`, `publishedAt`, `revisedAt` for every item.

---

## 2. Local Development

```bash
npm install       # or pnpm install
npm run dev       # starts at http://localhost:4321/fluffy-octo-chainsaw/
```

The site will call microCMS at build/dev time. Make sure `.env` has valid credentials or the dev server will throw `Missing env: MICROCMS_API_KEY`.

---

## 3. Deployment (GitHub Pages)

The site is deployed to `https://guru-ng.github.io/fluffy-octo-chainsaw/`.

The base path is set in `astro.config.ts`:
```ts
base: '/fluffy-octo-chainsaw/',
```

All internal links use `import.meta.env.BASE_URL` as a prefix so they work correctly under the subpath. If you ever deploy to a root domain (e.g. Netlify/Vercel), remove the `base` option.

**To deploy:**
1. Push to `main` — GitHub Actions (`.github/workflows/`) handles the build & deploy.
2. Make sure `MICROCMS_SERVICE_DOMAIN` and `MICROCMS_API_KEY` are set as **repository secrets** in GitHub → Settings → Secrets → Actions.

---

## 4. Known Issues / TODO

- **Post content rendering**: `[...slug].astro` currently dumps raw JSON/text for the post body. microCMS rich editor returns an array of block objects — you need to render each block type (paragraph, heading, image, etc.).
- **Tags/search**: The tag and search pages (`/tags/`, `/posts/` search) still reference the old local Astro content collection (`src/data/post.ts`). These need to be wired to microCMS data.
- **OG image**: `src/pages/og-image/[...slug].png.ts` still uses the local content collection — needs updating for microCMS post IDs.
- **RSS feed**: `src/pages/rss.xml.ts` needs to pull from microCMS instead of the local collection.

---

## 5. Files Cleaned Up

The following were removed as they were unrelated to the portfolio site:
- `get-shit-done/` — a separate Claude Code workflow tool (had its own `.git`)
- `astro-theme-cactus/` — empty nested folder
- `allfiles.txt` — empty scratch file
- `.example.env` — duplicate of `.env.example`
