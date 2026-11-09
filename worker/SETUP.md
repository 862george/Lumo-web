# SynthPage: Worker setup

**Current setup:** the repo deploys as ONE Worker called `synthpage` (see `wrangler.jsonc` in the repo root). It serves the website and the checkout API together, so no separate route is needed. Add the settings in step 2 to the `synthpage` Worker, then add `synthpage.co.uk` as a Custom Domain on it. Steps 1 and 3 below are only for the older, separate checkout Worker.

(Older instructions follow.)

The Worker in `worker.js` creates the Stripe checkout for the three payment pages. It keeps your secret key off the website.

## 1. Create the Worker
Cloudflare dashboard > Workers & Pages > Create > Create Worker > name it `synthpage-checkout` > Deploy.
Then click "Edit code", delete everything, paste in `worker.js`, and click Deploy.

## 2. Add the settings (Worker > Settings > Variables and Secrets)
Add these. Use "Secret" for the first one.

| Name | Type | Value (TEST mode right now) |
| --- | --- | --- |
| STRIPE_SECRET_KEY | Secret | your sk_test_... key (Stripe > Developers > API keys) |
| STRIPE_PUBLISHABLE_KEY | Text | your pk_test_... key |
| PRICE_BASIC_SETUP | Text | price_1UZqY23Y0yZc9OEheB76MCLO (the new £150 price) |
| PRICE_BASIC_MONTHLY | Text | price_1UZFik3Y0yZc9OEhAB19EQW1 |
| PRICE_IMMERSIVE_SETUP | Text | price_1UZFik3Y0yZc9OEh1zT6mCiB |
| PRICE_IMMERSIVE_MONTHLY | Text | price_1UZFil3Y0yZc9OEhCSGfYkw3 |
| PRICE_FAMILY_MONTHLY | Text | price_1UZFjs3Y0yZc9OEhtmHeJRv7 |

Note: the Advanced plan (formerly called Immersive) still uses the `PRICE_IMMERSIVE_*` variable names and the plan key `immersive` inside the Worker, so you don't need to rename anything. Customers only see the product names set in Stripe, which are now "SynthPage Basic website", "SynthPage Advanced website" and "SynthPage Family plan".

## 3. Point synthpage.co.uk/api/* at the Worker
Worker > Settings > Domains & Routes > Add > Route: `synthpage.co.uk/api/*`, zone `synthpage.co.uk`.

## 4. Upload the new SynthPage website
Upload the contents of the `site` folder (or connect the repo to a Pages project with output directory `site`). The `synthpage.co.uk` domain must be added to the Pages project, and the Worker route in step 3 must be on the `synthpage.co.uk` zone.

## 5. In Stripe (Dashboard)
- Settings > Payment methods: turn on cards (Apple Pay and Google Pay come with cards) and PayPal if offered.
- Settings > Branding: set the accent colour to lime `#B6F500` and upload the SynthPage logo so the payment form matches.
- Settings > Payment methods > Payment method domains: add `synthpage.co.uk` (needed for Apple Pay).
- Settings > Billing > Customer portal: switch it on so clients can cancel.

## 6. Test, then go live
Test with card 4242 4242 4242 4242, any future date, any CVC. When happy, switch to live: create the same 5 prices in live mode, then replace the two keys and five price IDs in the Worker settings.
