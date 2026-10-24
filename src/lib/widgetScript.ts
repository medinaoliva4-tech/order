// Scriptable (iOS) widget source, filled with the user's Supabase URL, anon key and widget token.
export function widgetScript(supabaseUrl: string, anonKey: string, token: string, appUrl: string) {
  return `// Order — widget para Scriptable
const SUPABASE = "${supabaseUrl}";
const KEY = "${anonKey}";
const TOKEN = "${token}";
const APP = "${appUrl}";

const req = new Request(SUPABASE + "/rest/v1/rpc/widget_data");
req.method = "POST";
req.headers = { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" };
req.body = JSON.stringify({ p_token: TOKEN });
let data = null;
try { data = await req.loadJSON(); } catch (e) {}

const family = config.widgetFamily || "medium";
// Sized so the habits fill each widget without clipping (content area: small ~127pt, medium ~301x127, large ~301x317)
const L = {
  small: { habits: 1, weeks: 9, cell: 10, gap: 3 },
  medium: { habits: 2, weeks: 52, cell: 4, gap: 1 },
  large: { habits: 3, weeks: 30, cell: 8, gap: 2 },
}[family] || { habits: 2, weeks: 52, cell: 4, gap: 1 };

const pad = (n) => (n < 10 ? "0" : "") + n;
const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const today = new Date();
const todayIso = iso(today);

function streak(days) {
  const set = new Set(days);
  const d = new Date(today);
  if (!set.has(iso(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const mute = new Color("#8b8b92");

const w = new ListWidget();
w.backgroundColor = new Color("#0a0a0c");
w.url = APP;
w.setPadding(14, 14, 14, 14);

function grid(days, color) {
  const set = new Set(days);
  const step = L.cell + L.gap;
  const ctx = new DrawContext();
  ctx.size = new Size(L.weeks * step, 7 * step);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  const start = new Date(today);
  start.setDate(today.getDate() - (L.weeks - 1) * 7 - ((today.getDay() + 6) % 7));
  for (let c = 0; c < L.weeks; c++) {
    for (let r = 0; r < 7; r++) {
      const d = new Date(start);
      d.setDate(start.getDate() + c * 7 + r);
      if (d > today) continue;
      ctx.setFillColor(set.has(iso(d)) ? new Color(color) : new Color("#ffffff", 0.08));
      ctx.fillEllipse(new Rect(c * step, r * step, L.cell, L.cell));
    }
  }
  return { image: ctx.getImage(), size: ctx.size };
}

if (!data) {
  const t = w.addText("Order: token no válido o sin conexión");
  t.textColor = mute;
  t.font = Font.systemFont(12);
} else {
  const habits = data.habits.slice(0, L.habits);
  if (habits.length === 0) {
    const t = w.addText("Crea un hábito en Order");
    t.textColor = mute;
    t.font = Font.systemFont(12);
  }
  habits.forEach((h, i) => {
    if (i > 0) w.addSpacer(family === "large" ? 12 : 8);
    const head = w.addStack();
    head.centerAlignContent();
    const name = head.addText(h.emoji + " " + h.name);
    name.font = Font.semiboldSystemFont(12);
    name.textColor = Color.white();
    name.lineLimit = 1;
    head.addSpacer();
    const st = head.addText("🔥" + streak(h.days) + " ");
    st.font = Font.systemFont(11);
    st.textColor = mute;
    const done = h.days.indexOf(todayIso) >= 0;
    const mark = head.addText(done ? "●" : "○");
    mark.font = Font.systemFont(12);
    mark.textColor = new Color(h.color);
    w.addSpacer(4);
    const g = grid(h.days, h.color);
    const img = w.addImage(g.image);
    img.imageSize = g.size;
  });
  w.addSpacer();
}

Script.setWidget(w);
if (config.runsInApp) await w.presentMedium();
Script.complete();
`;
}
