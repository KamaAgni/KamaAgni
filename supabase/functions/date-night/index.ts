// KamaAgni weekly date-night reminder (v79). Supabase Edge Function, run every hour by pg_cron (see SETUP-PUSH.md).
// For every phone that turned on a weekly date night, it sends one reminder at 9 am local time on that weekday:
// "🌹 Date night tonight at 19:30". Only the weekday, time and time zone are stored; nothing else.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:owner@example.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);
const REMIND_HOUR = 9;

function localParts(tz: string) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz || "UTC", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23", weekday: "short" });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { date: `${p.year}-${p.month}-${p.day}`, hour: +p.hour, dow };
}

Deno.serve(async (req) => {
  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (secret && req.headers.get("x-webhook-secret") !== secret) return new Response("unauthorised", { status: 401 });
  const { data: subs } = await db.from("push_subs").select("endpoint,sub,dn_dow,dn_time,tz,dn_sent").not("dn_dow", "is", null);
  let sent = 0;
  for (const s of subs ?? []) {
    let L; try { L = localParts(s.tz); } catch { L = localParts("UTC"); }
    if (L.dow !== s.dn_dow || L.hour !== REMIND_HOUR || s.dn_sent === L.date) continue;
    const payload = JSON.stringify({ title: "🌹 Date night tonight" + (s.dn_time ? " at " + s.dn_time : ""), body: "Plan it now so you’re both looking forward to it.", url: "games/kamaagni-tonight.html", tag: "ka-datenight" });
    try { await webpush.sendNotification(s.sub, payload, { TTL: 8 * 3600 }); sent++; await db.from("push_subs").update({ dn_sent: L.date }).eq("endpoint", s.endpoint); }
    catch (e) { const code = (e as { statusCode?: number }).statusCode; if (code === 404 || code === 410) await db.from("push_subs").delete().eq("endpoint", s.endpoint); }
  }
  return new Response("sent " + sent);
});
