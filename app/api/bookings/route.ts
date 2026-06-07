import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { isSlotBookable } from '@/lib/availability';

const bodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  slot_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'slot_time must be HH:mm'),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  company: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
  timezone: z.string().trim().min(1).max(100),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid booking details.', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { date, slot_time, name, email, company, notes, timezone } = parsed.data;

  try {
    // Re-check the slot is offerable, not blocked/past, and still free.
    if (!(await isSlotBookable(date, slot_time))) {
      return NextResponse.json(
        { error: 'That slot is no longer available.' },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(bookings)
      .values({
        date,
        slotTime: slot_time,
        name,
        email,
        company: company || null,
        notes: notes || null,
        timezone,
        status: 'pending',
      })
      .returning({ id: bookings.id });

    // TODO(email): send a confirmation email to the visitor and a notification to the
    // owner here (e.g. Resend). Skipped for now — the brand inbox is still a placeholder.

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: unknown) {
    // The partial unique index on (date, slot_time) WHERE status <> 'cancelled'
    // is the real double-booking guard — a concurrent insert loses with 23505.
    const code = (e as { code?: string })?.code;
    if (code === '23505') {
      return NextResponse.json(
        { error: 'That slot was just taken.' },
        { status: 409 },
      );
    }
    console.error('booking error', e);
    return NextResponse.json({ error: 'Failed to create booking.' }, { status: 500 });
  }
}
