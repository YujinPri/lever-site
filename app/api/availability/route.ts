import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { computeMonthAvailability } from '@/lib/availability';

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    month: request.nextUrl.searchParams.get('month'),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid month — expected YYYY-MM.' },
      { status: 400 },
    );
  }

  try {
    const days = await computeMonthAvailability(parsed.data.month);
    return NextResponse.json({ month: parsed.data.month, days });
  } catch (e) {
    console.error('availability error', e);
    return NextResponse.json({ error: 'Failed to load availability.' }, { status: 500 });
  }
}
