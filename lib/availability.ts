// Server-side availability computation, shared by the availability and bookings routes.
import { and, eq, gte, lte, ne } from 'drizzle-orm';
import { db } from '@/db';
import { availabilityRules, blockedDates, bookings } from '@/db/schema';
import { site } from './site';
import { slotInstant } from './timezone';

export type DayStatus = 'available' | 'booked' | 'off' | 'past';

export type DayInfo = {
  status: DayStatus;
  /** Business-local 'HH:mm' slots still open — only present for available days. */
  freeSlots?: string[];
};

/** Today's date as 'YYYY-MM-DD' in the business timezone (Asia/Manila). */
export function businessToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: site.businessTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Normalize a Postgres `time` value ('09:00:00') to 'HH:mm'. */
const toHHmm = (t: string) => t.slice(0, 5);

/** Compute per-date status + free slots for a month ('YYYY-MM'). */
export async function computeMonthAvailability(
  month: string,
): Promise<Record<string, DayInfo>> {
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const mon = Number(monthStr); // 1–12
  const daysInMonth = new Date(year, mon, 0).getDate();
  const first = `${yearStr}-${monthStr}-01`;
  const last = `${yearStr}-${monthStr}-${pad(daysInMonth)}`;

  const [rules, blocked, monthBookings] = await Promise.all([
    db.select().from(availabilityRules).where(eq(availabilityRules.active, true)),
    db
      .select()
      .from(blockedDates)
      .where(and(gte(blockedDates.date, first), lte(blockedDates.date, last))),
    db
      .select({ date: bookings.date, slotTime: bookings.slotTime })
      .from(bookings)
      .where(
        and(
          gte(bookings.date, first),
          lte(bookings.date, last),
          ne(bookings.status, 'cancelled'),
        ),
      ),
  ]);

  const slotsByWeekday = new Map<number, string[]>();
  for (const r of rules) {
    const list = slotsByWeekday.get(r.weekday) ?? [];
    list.push(toHHmm(r.slotTime));
    slotsByWeekday.set(r.weekday, list);
  }
  for (const list of slotsByWeekday.values()) list.sort();

  const blockedSet = new Set(blocked.map((b) => b.date));
  const takenByDate = new Map<string, Set<string>>();
  for (const b of monthBookings) {
    const set = takenByDate.get(b.date) ?? new Set<string>();
    set.add(toHHmm(b.slotTime));
    takenByDate.set(b.date, set);
  }

  const today = businessToday();
  const now = new Date();
  const result: Record<string, DayInfo> = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const dateIso = `${yearStr}-${monthStr}-${pad(d)}`;
    // Weekday computed in UTC from the ISO date — calendar-date weekday is tz-independent.
    const weekday = new Date(`${dateIso}T00:00:00Z`).getUTCDay();

    if (dateIso < today) {
      result[dateIso] = { status: 'past' };
      continue;
    }
    const offerable = slotsByWeekday.get(weekday);
    if (!offerable?.length || blockedSet.has(dateIso)) {
      result[dateIso] = { status: 'off' };
      continue;
    }
    const taken = takenByDate.get(dateIso);
    let freeSlots = offerable.filter((s) => !taken?.has(s));
    // For today, slots whose business-local instant already passed are gone.
    if (dateIso === today) {
      freeSlots = freeSlots.filter((s) => slotInstant(dateIso, s) > now);
    }
    result[dateIso] = freeSlots.length
      ? { status: 'available', freeSlots }
      : { status: 'booked' };
  }

  return result;
}

/** Is this exact date+slot currently free and offerable? Used to validate bookings. */
export async function isSlotBookable(dateIso: string, slot: string): Promise<boolean> {
  const month = dateIso.slice(0, 7);
  const day = (await computeMonthAvailability(month))[dateIso];
  return day?.status === 'available' && (day.freeSlots ?? []).includes(slot);
}
