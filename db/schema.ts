import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  pgTable,
  serial,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/** Recurring working hours: which weekday/slot combinations are offerable.
 *  Slot times are business-local (Asia/Manila, fixed +08:00, no DST). */
export const availabilityRules = pgTable(
  'availability_rules',
  {
    id: serial('id').primaryKey(),
    weekday: smallint('weekday').notNull(), // 0 (Sun) – 6 (Sat)
    slotTime: time('slot_time').notNull(),
    active: boolean('active').notNull().default(true),
  },
  (t) => [uniqueIndex('availability_rules_weekday_slot_idx').on(t.weekday, t.slotTime)],
);

/** One-off days the owner marks unavailable. */
export const blockedDates = pgTable('blocked_dates', {
  id: serial('id').primaryKey(),
  date: date('date').notNull().unique(),
  reason: text('reason'),
});

export const bookings = pgTable(
  'bookings',
  {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    slotTime: time('slot_time').notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    company: text('company'),
    notes: text('notes'),
    timezone: text('timezone').notNull(), // visitor's chosen tz, for confirmations/reminders
    status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] })
      .notNull()
      .default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Two people can't grab the same slot (cancelled bookings free it up again).
    uniqueIndex('bookings_date_slot_active_idx')
      .on(t.date, t.slotTime)
      .where(sql`${t.status} <> 'cancelled'`),
  ],
);
