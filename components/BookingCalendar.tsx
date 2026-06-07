"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DayInfo } from "@/lib/availability";
import {
  TZ_OPTIONS,
  detectTz,
  fmtSlotInTz,
  slotInstant,
  tzLabel,
  tzOffsetLabel,
} from "@/lib/timezone";
import { site } from "@/lib/site";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");
const monthKey = (y: number, m: number) => `${y}-${pad(m + 1)}`; // m is 0-based

type MonthData = Record<string, DayInfo>;

export default function BookingCalendar() {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState<string | null>(null); // 'YYYY-MM-DD'
  const [slot, setSlot] = useState<string | null>(null); // business-local 'HH:mm'
  const [tz, setTz] = useState(site.businessTz);
  const [months, setMonths] = useState<Record<string, MonthData>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Booking form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyNotes, setCompanyNotes] = useState({ company: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booked, setBooked] = useState<{ date: string; slot: string } | null>(null);

  // Auto-detect the visitor's timezone (client-only, after hydration).
  useEffect(() => {
    setTz(detectTz());
  }, []);

  const key = monthKey(view.y, view.m);
  const monthData = months[key];

  const fetchMonth = useCallback(async (mKey: string, force = false) => {
    setLoadError(false);
    if (!force) setLoading(true);
    try {
      const res = await fetch(`/api/availability?month=${mKey}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { days: MonthData } = await res.json();
      setMonths((prev) => ({ ...prev, [mKey]: data.days }));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!months[key]) fetchMonth(key);
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fetchMonth]);

  const tzChoices = useMemo(() => {
    const base = [...TZ_OPTIONS];
    if (!base.some((o) => o.tz === tz)) base.unshift({ label: `${tzLabel(tz)} (you)`, tz });
    return base;
  }, [tz]);

  const firstDow = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${view.y}-${pad(view.m + 1)}-${pad(d)}`);

  // No booking in the past: prev disabled at the current month.
  const atCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth();

  const go = (delta: number) => {
    setView((v) => {
      const nm = new Date(v.y, v.m + delta, 1);
      return { y: nm.getFullYear(), m: nm.getMonth() };
    });
  };

  const pickDay = (dateIso: string, status: string) => {
    if (status !== "available") return;
    setSelected(dateIso);
    setSlot(null);
    setSubmitError(null);
  };

  const selectedInfo = selected ? months[selected.slice(0, 7)]?.[selected] : undefined;
  const freeSlots = selectedInfo?.status === "available" ? selectedInfo.freeSlots ?? [] : [];
  const allSlots = useMemo(() => {
    // Show the full slot grid (free + taken) like the prototype: union the day's
    // free slots with the canonical six so taken ones render struck-through.
    const canonical = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];
    return Array.from(new Set([...canonical, ...freeSlots])).sort();
  }, [freeSlots]);

  const fmtLong = (dateIso: string) => {
    const d = new Date(`${dateIso}T00:00:00Z`);
    return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}`;
  };

  const refDate = selected ? slotInstant(selected, slot ?? "09:00") : new Date();
  const canSubmit = Boolean(selected && slot && name.trim() && /\S+@\S+\.\S+/.test(email));

  const submit = async () => {
    if (!selected || !slot || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selected,
          slot_time: slot,
          name: name.trim(),
          email: email.trim(),
          company: companyNotes.company.trim() || undefined,
          notes: companyNotes.notes.trim() || undefined,
          timezone: tz,
        }),
      });
      if (res.status === 201) {
        setBooked({ date: selected, slot });
        // Refresh so the day flips to booked/its slot disappears for others.
        fetchMonth(selected.slice(0, 7), true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setSubmitError(`${data.error ?? "That slot was just taken."} Pick another time.`);
        setSlot(null);
        fetchMonth(selected.slice(0, 7), true);
      } else {
        setSubmitError(data.error ?? "Something went wrong — please try again.");
      }
    } catch {
      setSubmitError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cal-layout">
      {/* Calendar */}
      <div className="cal-card">
        <div className="cal-head">
          <div className="cal-month">
            {MONTHS[view.m]} <span>{view.y}</span>
          </div>
          <div className="cal-nav">
            <button onClick={() => go(-1)} disabled={atCurrentMonth} aria-label="Previous month">
              ‹
            </button>
            <button onClick={() => go(1)} aria-label="Next month">
              ›
            </button>
          </div>
        </div>
        <div className="cal-weekdays">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className={`cal-grid ${loading ? "loading" : ""}`} aria-busy={loading}>
          {cells.map((dateIso, i) => {
            if (!dateIso) return <div key={`e${i}`} className="cal-day empty"></div>;
            const status = monthData?.[dateIso]?.status ?? "off";
            const isSel = dateIso === selected;
            const clickable = status === "available";
            return (
              <button
                key={dateIso}
                className={`cal-day ${isSel ? "selected" : status}`}
                onClick={() => pickDay(dateIso, status)}
                disabled={!clickable}
                aria-pressed={isSel}
                title={
                  status === "booked"
                    ? "Fully booked"
                    : status === "off"
                      ? "Unavailable"
                      : status === "available"
                        ? "Available"
                        : ""
                }
              >
                {Number(dateIso.slice(8))}
                {(status === "available" || status === "booked" || isSel) && (
                  <span className="dot"></span>
                )}
              </button>
            );
          })}
        </div>
        {loadError && (
          <div className="book-error" style={{ marginTop: 16 }}>
            Couldn&apos;t load availability.{" "}
            <button onClick={() => fetchMonth(key)} style={{ textDecoration: "underline" }}>
              Retry
            </button>
          </div>
        )}
        <div className="cal-legend">
          <div>
            <span
              className="swatch"
              style={{
                background: "color-mix(in srgb, var(--accent) 22%, transparent)",
                border: "1px solid var(--accent)",
              }}
            ></span>{" "}
            Available
          </div>
          <div>
            <span
              className="swatch"
              style={{
                background:
                  "repeating-linear-gradient(135deg, transparent, transparent 3px, color-mix(in srgb, var(--fg) 14%, transparent) 3px, color-mix(in srgb, var(--fg) 14%, transparent) 4px)",
                border: "1px solid var(--line)",
              }}
            ></span>{" "}
            Booked
          </div>
          <div>
            <span
              className="swatch"
              style={{ background: "transparent", border: "1px solid var(--line)" }}
            ></span>{" "}
            Off / weekend
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="cal-card cal-side">
        {booked ? (
          <div className="book-success">
            <div className="gmark">✓</div>
            <h3>You&apos;re booked.</h3>
            <p>
              <b style={{ color: "var(--fg)" }}>{fmtLong(booked.date)}</b> at{" "}
              <b style={{ color: "var(--fg)" }}>{fmtSlotInTz(booked.date, booked.slot, tz)}</b>{" "}
              ({tzLabel(tz)}) — 30 min, free audit. Check your email for confirmation.
            </p>
            <button
              className="btn-ghost"
              style={{ width: "auto", gap: 8 }}
              onClick={() => {
                setBooked(null);
                setSelected(null);
                setSlot(null);
              }}
            >
              <span>Book another time</span>
              <span>→</span>
            </button>
          </div>
        ) : !selected ? (
          <div className="cal-side-empty">
            <div className="big">←</div>
            <p>
              Pick an available day to see open time slots. Times are shown in your
              timezone — change it anytime.
            </p>
          </div>
        ) : (
          <>
            <div>
              <div className="cal-side-date mono">Selected</div>
              <div className="cal-side-day">{fmtLong(selected)}</div>
              <div className="tz-row">
                <span className="slot-label" style={{ marginBottom: 0 }}>
                  Open slots
                </span>
                <label className="tz-select">
                  <select
                    value={tz}
                    onChange={(e) => setTz(e.target.value)}
                    aria-label="Your timezone"
                  >
                    {tzChoices.map((o) => (
                      <option key={o.tz} value={o.tz}>
                        {o.label} · {tzOffsetLabel(o.tz, refDate)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="slots">
                {allSlots.map((s) => {
                  const isFree = freeSlots.includes(s);
                  const isPicked = slot === s;
                  return (
                    <button
                      key={s}
                      className={`slot ${isPicked ? "picked" : isFree ? "free" : "taken"}`}
                      onClick={() => isFree && setSlot(s)}
                      disabled={!isFree}
                      aria-pressed={isPicked}
                    >
                      {fmtSlotInTz(selected, s, tz)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="cal-confirm">
              <div className="cal-confirm-summary">
                {slot ? (
                  <>
                    Booking <b>{fmtLong(selected)}</b> at{" "}
                    <b>{fmtSlotInTz(selected, slot, tz)}</b>{" "}
                    <span style={{ color: "var(--dim)" }}>({tzLabel(tz)})</span> — 30 min,
                    free audit.
                  </>
                ) : (
                  "Choose a time to continue."
                )}
              </div>
              {slot && (
                <div className="book-form">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Your name"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Company (optional)"
                    value={companyNotes.company}
                    onChange={(e) =>
                      setCompanyNotes((v) => ({ ...v, company: e.target.value }))
                    }
                    aria-label="Company (optional)"
                  />
                  <textarea
                    placeholder="What would you like to automate? (optional)"
                    value={companyNotes.notes}
                    onChange={(e) =>
                      setCompanyNotes((v) => ({ ...v, notes: e.target.value }))
                    }
                    aria-label="Notes (optional)"
                    rows={2}
                  />
                </div>
              )}
              {submitError && <div className="book-error">{submitError}</div>}
              <button
                className={`btn-primary ${canSubmit && !submitting ? "" : "disabled"}`}
                onClick={submit}
                disabled={!canSubmit || submitting}
              >
                {submitting ? "Requesting…" : "Request this slot"}{" "}
                <span className="arrow">→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
