# Content Brain

This folder is the "content brain" for the portfolio site. It lives at the repo root so Astro never builds it into the site.

## Workflow

```
obsidian-vault/            ← you write and think here
  style-guide.md           ← Claude reads this before drafting anything
  content-ideas.md         ← running list of post ideas + status
  weekly-digest/           ← auto-generated repo activity digests

        ↓  (share idea + relevant digest with Claude)

Claude drafts a post using your voice from style-guide.md

        ↓  (you review & edit the draft)

Claude formats the final version into src/content/post/ with correct frontmatter:
  title, description, publishDate, tags, (ogImage if needed)
```

## Files

| File | Purpose |
|------|---------|
| `style-guide.md` | Your writing voice — Claude consults this before every draft |
| `content-ideas.md` | Idea backlog with status tracking |
| `weekly-digest/` | Weekly summaries of what you built, for turning into posts |

## Tips

- Keep `style-guide.md` honest. The more specific your examples, the more accurately Claude mirrors your voice.
- Add ideas to `content-ideas.md` as they occur to you — status `idea` is fine, no pressure to flesh them out.
- When sharing a digest with Claude, paste the relevant section and say "draft a post from this, follow my style guide." Claude will handle the frontmatter.
