// KamaAgni partner alerts (v78). Supabase Edge Function, called by a Database Webhook on INSERT into couple_events.
// It sends a phone notification to the OTHER partner's devices. Messages are end-to-end encrypted, so the server
// never sees what was sent: the alert only says what kind of thing arrived ("You have an invitation").
// Setup: SETUP-PUSH.md.   Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, WEBHOOK_SECRET (optional).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:owner@example.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

// Only these kinds alert. Live-game moves, settings sync and housekeeping events stay silent.
const TEXT: Record<string, [string, string, string]> = {
  inv:   ["💌 You have an invitation", "Your partner has something in mind. Tap to answer.", "games/kamaagni-invite.html#inbox"],
  plan:  ["✨ A plan for tonight", "Your partner planned your evening. Tap to see it.", "games/kamaagni-invite.html#inbox"],
  rsvp:  ["💞 Your partner replied", "Tap to see their answer.", "games/kamaagni-invite.html#inbox"],
  veto:  ["↻ One step to swap", "Your partner would rather skip one step of the plan.", "games/kamaagni-tonight.html"],
  wish:  ["🌠 Secret wishes updated", "See if you have a new match.", "games/kamaagni-invite.html#wish"],
  nudge: ["💗 A little nudge", "Your partner is thinking of you.", "games/kamaagni-together.html"],
  ldr:   ["🌍 Thinking of you", "A nudge from far away.", "games/kamaagni-apart.html"],
  msg:   ["💬 New message", "Tap to read it.", "games/kamaagni-together.html"],
  chk:   ["💗 Check-in", "Your partner shared a check-in.", "games/kamaagni-together.html"],
  sig:   ["⏸ Your partner signalled", "Open KamaAgni to see how they are.", "games/kamaagni-together.html"],
};
const recent = new Map<string, number>(); // don't buzz the same person more than once a minute per kind

Deno.serve(async (req) => {
  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (secret && req.headers.get("x-webhook-secret") !== secret) return new Response("unauthorised", { status: 401 });
  const p = await req.json().catch(() => null);
  const r = p?.record;
  if (!r || !TEXT[r.kind]) return new Response("skip");
  const { data: c } = await db.from("couples").select("a,b").eq("id", r.couple_id).maybeSingle();
  const to = c ? (c.a === r.sender ? c.b : c.a) : null;
  if (!to) return new Response("no partner");
  const key = to + ":" + r.kind, now = Date.now();
  if (r.kind !== "sig" && now - (recent.get(key) ?? 0) < 60_000) return new Response("throttled");
  recent.set(key, now);
  const { data: subs } = await db.from("push_subs").select("endpoint,sub").eq("user_id", to);
  const [title, body, url] = TEXT[r.kind];
  const payload = JSON.stringify({ title, body, url, tag: "ka-" + r.kind });
  let sent = 0;
  await Promise.all((subs ?? []).map(async (s) => {
    try { await webpush.sendNotification(s.sub, payload, { TTL: 6 * 3600, urgency: r.kind === "sig" ? "high" : "normal" }); sent++; }
    catch (e) { const code = (e as { statusCode?: number }).statusCode; if (code === 404 || code === 410) await db.from("push_subs").delete().eq("endpoint", s.endpoint); }
  }));
  return new Response("sent " + sent);
});
