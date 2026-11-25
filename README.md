# snjv.club

Personal portfolio and blog of **Sanjeev Gurung**, a frontend developer based in Osaka, Japan.
Live at [snjv.club](https://snjv.club).

## Stack

- [Astro](https://astro.build) 5 (static output) and TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4, with design tokens in `src/styles/global.css`
- [microCMS](https://microcms.io) as the headless CMS for blog posts
- [Pagefind](https://pagefind.app) for site search (built after `astro build`)
- [Formspree](https://formspree.io) for the contact form
- Fonts: Inter Tight and Instrument Serif (Google Fonts)

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home: animated hero, a pinned Works section where vertical scroll moves the project cards sideways, about, capabilities, values, latest posts |
| `/about/` | Background, skills and experience |
| `/projects/` | All projects, each with a link target for `/projects/#<id>` |
| `/posts/` | Paginated blog list, posts come from microCMS |
| `/posts/<id>/` | A single post |
| `/contact/` | Contact form |

## Getting started

You need Node 20 or newer and [pnpm](https://pnpm.io).

```bash
pnpm install
cp .env.example .env   # then fill in the two microCMS values
pnpm dev               # http://localhost:4321
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `MICROCMS_SERVICE_DOMAIN` | Your service ID, the `xxxx` in `https://xxxx.microcms.io` (the full domain also works) |
| `MICROCMS_API_KEY` | API key from microCMS, under API settings |

Without these the site still builds. The home page and `/posts/` simply show no posts.

### Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server (search is only available in production builds) |
| `pnpm build` | Build to `dist/`, then build the Pagefind search index |
| `pnpm preview` | Serve the built site locally |
| `pnpm check` | Type-check Astro and TypeScript files |
| `pnpm lint` | Run Biome |
| `pnpm format` | Format with Biome and Prettier |

## Content

### Blog posts (microCMS)

Posts are fetched at build time by `src/data/microcms.ts` from an API endpoint named `blog`.

| Field | Type | Required |
| --- | --- | --- |
| `title` | Text | yes |
| `description` | Text | |
| `contents` | Rich editor or repeater | |
| `publishedAt` | Date and time | |
| `draft` | Boolean | |
| `ogImage` | Media | |

microCMS adds `id`, `createdAt`, `updatedAt` and `publishedAt` automatically.
Posts with `draft` set show a "(Draft)" label, but are still published. Unpublish them in microCMS to hide them.

### Projects

Edit `src/data/projects.ts`. That one list feeds both the home page Works section and the `/projects/` page.

```ts
{
  id: "my-project",          // used for /projects/#my-project
  title: "My Project",
  short: "My Project",       // label on the home-page card
  summary: "One line for the card.",
  description: "Longer text for the projects page.",
  tags: [{ label: "Astro", color: "c3" }],   // color: acc | c2 | c3 | c4 | c5
  github: "https://github.com/...",
  demo: "https://...",
}
```

### Other pages

- About: `src/pages/about.astro`
- Site title, description, author and menu links: `src/site.config.ts`
- Contact form: set your Formspree form ID in `src/pages/contact.astro`

## Design

- **Themes:** light and dark, following the system setting and saved when you use the toggle. Tokens live in `src/styles/global.css`.
- **Accessibility:** all text colors are at least 4.5:1 against their backgrounds (the lowest is 5.7:1), and button and form-field borders are at least 3:1. There is a skip link, visible focus rings and 44px tap targets.
- **Motion:** parallax, the progress bar and the sideways Works scroll are switched off when the visitor prefers reduced motion. Works then becomes a normal swipeable row.
- **Layout:** the home page is full width, every other page sits in a 48rem reading column.

## Project layout

```
src/
  components/      Header, footer, search, theme toggle and blog components
  data/            microcms.ts (CMS client), projects.ts (project list)
  layouts/         Base.astro (site shell), BlogPost.astro
  pages/           Routes listed above
  styles/          global.css (tokens, shared classes) and search styles
  site.config.ts   Site-wide settings and menu links
public/            Static files (profile photo, icon, social card)
```

## Deployment

The site builds to static files in `dist/`.

- `.github/workflows/deploy.yml` builds on every push to `main` and publishes to GitHub Pages. Add `MICROCMS_SERVICE_DOMAIN` and `MICROCMS_API_KEY` as repository secrets under Settings, Secrets and variables, Actions.
- `wrangler.jsonc` serves `dist/` as static assets on Cloudflare.
- `.github/workflows/ci.yml` runs `astro check` and a build on pushes and pull requests to `main`.

## Credits and license

Started from the [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus) theme and since redesigned.
Released under the MIT License, see `LICENSE`.
