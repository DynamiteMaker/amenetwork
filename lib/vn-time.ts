// Scheduling is anchored to Vietnam time (UTC+7, no DST) so a picked wall
// time always means Vietnam time, regardless of the admin device's timezone.
const VN_TZ = "Asia/Ho_Chi_Minh";
const VN_OFFSET = "+07:00";

function partsIn(tz: string, d: Date): Record<string, string> {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
}

/** Vietnam wall-clock datetime (datetime-local value) -> UTC ISO, or null when empty/invalid. */
export function vnLocalToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(`${local}${VN_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** UTC ISO -> value for <input type="datetime-local"> showing Vietnam wall time. */
export function isoToVnInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = partsIn(VN_TZ, d);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** UTC ISO -> "dd/MM/yyyy HH:mm" in Vietnam time. */
export function formatVnDateTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = partsIn(VN_TZ, d);
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}
