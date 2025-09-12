# SiteSmith UX/UI Refresh

This update focuses on a tasteful, compatible UI refresh while keeping the existing logic and AI pipeline intact.

## Highlights
- **AppShell layout with sidebar** (`components/shell/app-shell.tsx`), used in `app/layout.tsx`.
- **Glassmorphism & gradients** and **refined scrollbars** via `app/globals.css` additions.
- **Sticky composer** in chat with **quick action chips**, upgraded input and primary button styles.
- **Branding touch**: header now shows **"SiteSmith — Builder"**.
- **No env changes required**. The app still reads provider credentials from Vercel env vars.
- **Model**: default is **OpenAI GPT‑5** and the model selector still works.

## Deploying to Vercel
1. Push this project to GitHub.
2. Import into Vercel as a Next.js app.
3. Ensure your environment variables are set in Vercel (same names as before). Nothing new is required.
4. Build & deploy. The refresh uses Tailwind classes already present in the project.

## Rollback
If you ever want to undo the visual refresh:
- Revert `app/layout.tsx`, `app/globals.css`, `app/header.tsx`, and `app/chat.tsx` to the prior versions.
- Remove `components/shell/app-shell.tsx`.
