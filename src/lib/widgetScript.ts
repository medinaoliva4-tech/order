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
const L = {
  small: { habits: 1, weeks: 13, cell: 7, gap: 2 },
  medium: { habits: 2, weeks: 36, cell: 6, gap: 2 },
  large: { habits: 4, weeks: 36, cell: 6, gap: 2 },
}[family] || { habits: 2, weeks: 36, cell: 6, gap: 2 };

const pad = (n) => (n < 10 ? "0" : "") + n;
const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const today = new Date();
const todayIso = iso(today);
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
    if (i > 0) w.addSpacer(8);
    const head = w.addStack();
    head.centerAlignContent();
    const name = head.addText(h.emoji + " " + h.name);
    name.font = Font.semiboldSystemFont(12);
    name.textColor = Color.white();
    name.lineLimit = 1;
    head.addSpacer();
    const done = h.days.indexOf(todayIso) >= 0;
    const mark = head.addText(done ? "●" : "○");
    mark.font = Font.systemFont(12);
    mark.textColor = new Color(h.color);
    w.addSpacer(4);
    const g = grid(h.days, h.color);
    const img = w.addImage(g.image);
    img.imageSize = g.size;
  });
  if (family !== "small") {
    w.addSpacer();
    let foot = data.open_tasks + " tareas abiertas";
    if (data.next_plan) foot += " · " + data.next_plan.title + " " + data.next_plan.starts_on.slice(5).split("-").reverse().join("/");
    const f = w.addText(foot);
    f.font = Font.systemFont(10);
    f.textColor = mute;
    f.lineLimit = 1;
  }
}

Script.setWidget(w);
if (config.runsInApp) await w.presentMedium();
Script.complete();
`;
}
