# SynthPage

- `site/`: the synthpage.co.uk website (static). In Cloudflare Pages, set the build output directory to `site`.
- `worker/`: the Cloudflare Worker that creates Stripe checkout sessions (route `synthpage.co.uk/api/*`). Setup steps are in `worker/SETUP.md`.

Never commit Stripe keys. They live in the Worker's settings in Cloudflare.
