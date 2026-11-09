// SynthPage checkout API: a tiny Cloudflare Worker that creates Stripe Embedded Checkout sessions.
// Secrets/vars (set in the Cloudflare dashboard, never in this file):
//   STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY,
//   PRICE_BASIC_SETUP, PRICE_BASIC_MONTHLY, PRICE_IMMERSIVE_SETUP, PRICE_IMMERSIVE_MONTHLY, PRICE_FAMILY_MONTHLY
const STRIPE = "https://api.stripe.com/v1";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

function plans(env) {
  // setup = one-off price charged today; monthly = subscription price; trialDays = delay before first monthly charge
  return {
    basic: { setup: env.PRICE_BASIC_SETUP, monthly: env.PRICE_BASIC_MONTHLY, trialDays: 30 },
    immersive: { setup: env.PRICE_IMMERSIVE_SETUP, monthly: env.PRICE_IMMERSIVE_MONTHLY, trialDays: 30 },
    family: { setup: null, monthly: env.PRICE_FAMILY_MONTHLY, trialDays: 0 },
  };
}

async function stripe(env, path, params, method = "POST") {
  const res = await fetch(STRIPE + path, {
    method,
    headers: {
      Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
      ...(method === "POST" ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" ? params.toString() : undefined,
  });
  return { ok: res.ok, data: await res.json() };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === "/api/checkout-session" && req.method === "POST") {
      let body;
      try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }

      const plan = plans(env)[body.plan];
      if (!plan || !plan.monthly) return json({ error: "Unknown plan" }, 400);

      const p = new URLSearchParams();
      p.set("mode", "subscription");
      p.set("ui_mode", "embedded_page");
      p.set("return_url", url.origin + "/securecheckout/thanks/?session_id={CHECKOUT_SESSION_ID}");
      let i = 0;
      p.set(`line_items[${i}][price]`, plan.monthly); p.set(`line_items[${i}][quantity]`, "1"); i++;
      if (plan.setup) { p.set(`line_items[${i}][price]`, plan.setup); p.set(`line_items[${i}][quantity]`, "1"); i++; }
      if (plan.trialDays) p.set("subscription_data[trial_period_days]", String(plan.trialDays));
      p.set("subscription_data[metadata][plan]", body.plan);

      const email = String(body.email || "").trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200) p.set("customer_email", email);
      const ref = String(body.ref || "").replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
      if (ref) p.set("client_reference_id", ref);
      p.set("metadata[plan]", body.plan);

      const r = await stripe(env, "/checkout/sessions", p);
      if (!r.ok) return json({ error: "Could not start checkout" }, 502);
      return json({ clientSecret: r.data.client_secret, publishableKey: env.STRIPE_PUBLISHABLE_KEY });
    }

    if (url.pathname === "/api/session-status" && req.method === "GET") {
      const id = url.searchParams.get("session_id") || "";
      if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json({ error: "Bad request" }, 400);
      const r = await stripe(env, "/checkout/sessions/" + id, null, "GET");
      if (!r.ok) return json({ error: "Not found" }, 404);
      return json({ status: r.data.status, email: r.data.customer_details && r.data.customer_details.email });
    }

    return new Response("Not found", { status: 404 });
  },
};
