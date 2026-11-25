// Edge Function "checkout": erstellt die Stripe-Bezahlseite (Checkout) für eine Bestellung und bestätigt die Zahlung.
// Geheimnisse (Supabase > Edge Functions > Secrets): STRIPE_SECRET_KEY. SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY sind automatisch vorhanden.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Content-Type": "application/json" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: cors });
const stripe = async (path: string, body?: URLSearchParams, method = "POST") => {
  const r = await fetch("https://api.stripe.com/v1/" + path, { method, headers: { Authorization: "Bearer " + Deno.env.get("STRIPE_SECRET_KEY"), "Content-Type": "application/x-www-form-urlencoded" }, body: method === "GET" ? undefined : body });
  return await r.json();
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: { user } } = await sb.auth.getUser(token);
    if (!user) return json({ error: "Bitte anmelden" }, 401);
    const { action, order_id, return_url } = await req.json();
    const { data: o, error: oerr } = await sb.from("orders").select("*").eq("id", order_id).eq("user_id", user.id).maybeSingle();
    if (!o) return json({ error: "Bestellung nicht gefunden", dbg: oerr?.message || null, uid: user.id }, 404);
    if (action === "confirm") {
      if (o.paid) return json({ paid: true });
      if (!o.stripe_session) return json({ paid: false });
      const s = await stripe("checkout/sessions/" + o.stripe_session, undefined, "GET");
      if (s.payment_status === "paid") { await sb.from("orders").update({ paid: true, paid_at: new Date().toISOString() }).eq("id", o.id); return json({ paid: true }); }
      return json({ paid: false });
    }
    if (action === "create") {
      if (o.paid) return json({ paid: true });
      const p = new URLSearchParams();
      p.set("mode", "payment"); p.set("locale", "de"); p.set("customer_email", o.email || "");
      p.set("client_reference_id", o.id); p.set("metadata[order_id]", o.id);
      let i = 0;
      for (const it of o.items as { n: string; q: number; pr: number }[]) {
        p.set(`line_items[${i}][price_data][currency]`, "eur"); p.set(`line_items[${i}][price_data][product_data][name]`, String(it.n).slice(0, 120));
        p.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(Number(it.pr) * 100))); p.set(`line_items[${i}][quantity]`, String(it.q)); i++;
      }
      if (Number(o.versand) > 0) { p.set(`line_items[${i}][price_data][currency]`, "eur"); p.set(`line_items[${i}][price_data][product_data][name]`, "Versand"); p.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(Number(o.versand) * 100))); p.set(`line_items[${i}][quantity]`, "1"); }
      if (Number(o.rabatt) > 0) {
        const c = await stripe("coupons", new URLSearchParams({ amount_off: String(Math.round(Number(o.rabatt) * 100)), currency: "eur", duration: "once", name: "Gutschein " + (o.code || "") }));
        if (c.id) p.set("discounts[0][coupon]", c.id);
      }
      const base = String(return_url || "").split("?")[0];
      p.set("success_url", base + "?neu=" + encodeURIComponent(o.id) + "&pay=ok");
      p.set("cancel_url", base + "?neu=" + encodeURIComponent(o.id) + "&pay=cancel");
      const s = await stripe("checkout/sessions", p);
      if (!s.url) return json({ error: s.error?.message || "Stripe-Fehler" }, 400);
      await sb.from("orders").update({ stripe_session: s.id }).eq("id", o.id);
      return json({ url: s.url });
    }
    return json({ error: "unbekannte Aktion" }, 400);
  } catch (e) { return json({ error: String(e) }, 500); }
});
