# Lumo checkout API: setup (5 minutes)

The Worker in `worker.js` creates the Stripe checkout for the three payment pages. It keeps your secret key off the website.

## 1. Create the Worker
Cloudflare dashboard > Workers & Pages > Create > Create Worker > name it `lumo-checkout` > Deploy.
Then click "Edit code", delete everything, paste in `worker.js`, and click Deploy.

## 2. Add the settings (Worker > Settings > Variables and Secrets)
Add these. Use "Secret" for the first one.

| Name | Type | Value (TEST mode right now) |
| --- | --- | --- |
| STRIPE_SECRET_KEY | Secret | your sk_test_... key (Stripe > Developers > API keys) |
| STRIPE_PUBLISHABLE_KEY | Text | your pk_test_... key |
| PRICE_BASIC_SETUP | Text | price_1UZFii3Y0yZc9OEhXzk7HWn2 |
| PRICE_BASIC_MONTHLY | Text | price_1UZFik3Y0yZc9OEhAB19EQW1 |
| PRICE_IMMERSIVE_SETUP | Text | price_1UZFik3Y0yZc9OEh1zT6mCiB |
| PRICE_IMMERSIVE_MONTHLY | Text | price_1UZFil3Y0yZc9OEhCSGfYkw3 |
| PRICE_FAMILY_MONTHLY | Text | price_1UZFjs3Y0yZc9OEhtmHeJRv7 |

## 3. Point lumoweb.uk/api/* at the Worker
Worker > Settings > Domains & Routes > Add > Route: `lumoweb.uk/api/*`, zone `lumoweb.uk`.

## 4. Upload the website again (new securecheckout pages + thanks page)

## 5. In Stripe (Dashboard)
- Settings > Payment methods: turn on cards (Apple Pay and Google Pay come with cards) and PayPal if offered.
- Settings > Payment methods > Payment method domains: add `lumoweb.uk` (needed for Apple Pay).
- Settings > Billing > Customer portal: switch it on so clients can cancel.

## 6. Test, then go live
Test with card 4242 4242 4242 4242, any future date, any CVC. When happy, switch to live: create the same 5 prices in live mode, then replace the two keys and five price IDs in the Worker settings.
