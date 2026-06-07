// Timezone helpers — ported from design_handoff/reference/app.jsx.
// Slots are the BUSINESS's working hours in Manila time (fixed +08:00, no DST).
// We display them converted to whatever timezone the visitor selects.
import { site } from './site';

export const TZ_OPTIONS: { label: string; tz: string }[] = [
  { label: 'Manila', tz: 'Asia/Manila' },
  { label: 'Singapore', tz: 'Asia/Singapore' },
  { label: 'Sydney', tz: 'Australia/Sydney' },
  { label: 'Dubai', tz: 'Asia/Dubai' },
  { label: 'London', tz: 'Europe/London' },
  { label: 'New York', tz: 'America/New_York' },
  { label: 'Los Angeles', tz: 'America/Los_Angeles' },
];

export function detectTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return site.businessTz;
  }
}

/** The absolute instant of a business-local slot on a given date (date as 'YYYY-MM-DD', slot as 'HH:mm'). */
export function slotInstant(dateIso: string, slot: string): Date {
  return new Date(`${dateIso}T${slot}:00${site.businessTzOffset}`);
}

/** Slot time rendered in the given timezone, 24h 'HH:mm'. */
export function fmtSlotInTz(dateIso: string, slot: string, tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(slotInstant(dateIso, slot));
  } catch {
    return slot;
  }
}

/** 'GMT+8'-style offset label for a timezone (at a reference date, for DST correctness). */
export function tzOffsetLabel(tz: string, date?: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(date ?? new Date());
    return parts.find((x) => x.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

export function tzLabel(tz: string): string {
  const found = TZ_OPTIONS.find((o) => o.tz === tz);
  return found ? found.label : (tz.split('/').pop() ?? tz).replace(/_/g, ' ');
}
