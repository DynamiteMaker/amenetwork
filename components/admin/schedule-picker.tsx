"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { formatVnDateTime, isoToVnInput, vnLocalToIso } from "@/lib/vn-time";

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** "in 1d 3h 5m"-style relative duration for the resolved hint. */
function relativeIn(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h}h ${min % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

/** datetime-local value (Vietnam wall time) n whole hours from now, rounded up. */
function inHoursVn(nowMs: number, n: number) {
  return isoToVnInput(new Date(Math.ceil((nowMs + 60_000) / HOUR_MS) * HOUR_MS + (n - 1) * HOUR_MS).toISOString());
}

/** datetime-local value for the Vietnam-calendar date `offsetMs` days from now, at HH:mm. */
function vnDateAt(nowMs: number, offsetDays: number, time: string) {
  return `${isoToVnInput(new Date(nowMs + offsetDays * DAY_MS).toISOString()).slice(0, 10)}T${time}`;
}

/** datetime-local value for next Monday 09:00 VN (measured from tomorrow, so "today is Monday" still gives the next one). */
function nextMondayVn(nowMs: number) {
  const [y, m, d] = vnDateAt(nowMs, 1, "00:00").split(/[-T]/).map(Number);
  const daysToMonday = ((1 - new Date(Date.UTC(y, m - 1, d)).getUTCDay()) + 7) % 7;
  return `${isoToVnInput(new Date(Date.UTC(y, m - 1, d + daysToMonday)).toISOString()).slice(0, 10)}T09:00`;
}

/** First half-hour slot at least one minute away, as HH:mm Vietnam wall time. */
function nextHalfHourVn(nowMs: number) {
  return isoToVnInput(new Date(Math.ceil((nowMs + 60_000) / 1_800_000) * 1_800_000).toISOString()).slice(11, 16);
}

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);

export function SchedulePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const iso = vnLocalToIso(value);
  const vnToday = isoToVnInput(new Date(nowMs).toISOString()).slice(0, 10);
  const selectedDate = value.slice(0, 10);
  const selectedTime = value.slice(11, 16);

  // Displayed month follows the selection unless the user navigated manually.
  const [viewOverride, setViewOverride] = useState<{ y: number; m: number } | null>(null);
  const selectionBase = selectedDate || vnToday;
  const view = useMemo(
    () => ({
      y: Number(selectionBase.slice(0, 4)),
      m: Number(selectionBase.slice(5, 7)) - 1,
    }),
    [selectionBase],
  );
  const shown = viewOverride ?? view;

  // Monday-first grid of ISO date strings, padded with nulls.
  const cells = useMemo(() => {
    const lead = (new Date(Date.UTC(shown.y, shown.m, 1)).getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(shown.y, shown.m + 1, 0)).getUTCDate();
    const list: (string | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= days; d++) {
      list.push(`${shown.y}-${String(shown.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [shown]);

  const monthLabel = `${new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(shown.y, shown.m, 1)))} ${shown.y}`;
  const isCurrentMonth = `${shown.y}-${String(shown.m + 1).padStart(2, "0")}` === vnToday.slice(0, 7);

  const presets = [
    { label: "In 1 hour", value: inHoursVn(nowMs, 1) },
    { label: "In 3 hours", value: inHoursVn(nowMs, 3) },
    { label: "Tomorrow 09:00", value: vnDateAt(nowMs, 1, "09:00") },
    { label: "Tomorrow 14:00", value: vnDateAt(nowMs, 1, "14:00") },
    { label: "Next Monday 09:00", value: nextMondayVn(nowMs) },
  ];

  const hint = (() => {
    if (!value) return "";
    if (!iso) return "Invalid date and time";
    const diffMs = new Date(iso).getTime() - nowMs;
    const rel = diffMs > 0 ? `in ${relativeIn(diffMs)}` : "already passed — pick a later time";
    return `${formatVnDateTime(iso)} Vietnam time (GMT+7) · ${rel}`;
  })();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Choose publish time"
        className={`admin-input w-auto py-2 text-xs flex items-center gap-2 text-left ${
          open ? "border-brand text-brand" : ""
        }`}
      >
        <Clock size={14} className="shrink-0" />
        {iso ? `${formatVnDateTime(iso)} (GMT+7)` : "Schedule for…"}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-80 rounded-xl border border-line bg-surface shadow-lg p-4 space-y-3 max-h-[min(80vh,640px)] overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              Publish at — Vietnam (GMT+7)
            </span>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-[11px] text-ink-3 hover:text-destructive"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  onChange(p.value);
                  setViewOverride(null);
                  setOpen(false);
                }}
                className={`px-2 py-1.5 rounded text-[11px] font-medium border border-line ${
                  value === p.value
                    ? "bg-brand-soft text-brand border-brand"
                    : "bg-bg-2 text-ink hover:bg-brand-soft hover:text-brand"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              disabled={isCurrentMonth}
              onClick={() =>
                setViewOverride((v) => {
                  const base = v ?? shown;
                  return base.m === 0 ? { y: base.y - 1, m: 11 } : { ...base, m: base.m - 1 };
                })
              }
              className="px-2 py-1 rounded text-xs text-ink-2 hover:bg-bg-2 disabled:opacity-30"
            >
              ‹
            </button>
            <span className="text-xs font-semibold text-ink">{monthLabel}</span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setViewOverride((v) => {
                  const base = v ?? shown;
                  return base.m === 11 ? { y: base.y + 1, m: 0 } : { ...base, m: base.m + 1 };
                })
              }
              className="px-2 py-1 rounded text-xs text-ink-2 hover:bg-bg-2"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[10px] font-semibold text-ink-3 py-1">
                {w}
              </span>
            ))}
            {cells.map((date, i) =>
              date === null ? (
                <span key={`e${i}`} />
              ) : (
                <button
                  key={date}
                  type="button"
                  aria-label={date.split("-").reverse().join("/")}
                  disabled={date < vnToday}
                  onClick={() =>
                    onChange(`${date}T${selectedTime || (date > vnToday ? "09:00" : nextHalfHourVn(nowMs))}`)
                  }
                  className={`h-8 rounded-full text-xs font-medium ${
                    selectedDate === date
                      ? "bg-brand text-white"
                      : date === vnToday
                        ? "text-brand border border-brand"
                        : "text-ink hover:bg-brand-soft hover:text-brand"
                  } disabled:text-ink-3 disabled:opacity-40 disabled:hover:bg-transparent`}
                >
                  {Number(date.slice(8, 10))}
                </button>
              ),
            )}
          </div>

          <div className="grid grid-cols-4 gap-1 max-h-44 overflow-y-auto">
            {TIME_SLOTS.map((t) => {
              const disabled = !!selectedDate && selectedDate <= vnToday && vnLocalToIso(`${selectedDate}T${t}`)! <= new Date(nowMs + 60_000).toISOString();
              return (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(`${selectedDate || vnToday}T${t}`);
                    setOpen(false);
                  }}
                  className={`py-1.5 rounded text-[11px] font-medium border border-line ${
                    selectedTime === t
                      ? "bg-brand text-white border-brand"
                      : "bg-bg-2 text-ink hover:bg-brand-soft hover:text-brand"
                  } disabled:opacity-30 disabled:hover:bg-bg-2`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {hint && (
            <span className={`text-[11px] ${/passed|Invalid/.test(hint) ? "text-destructive" : "text-ink-3"}`}>
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
