// Seed default availability rules: Mon–Fri, six business-local (Manila) slots.
// Run with: npm run db:seed
import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from './index';
import { availabilityRules } from './schema';

const SLOTS = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30'];
const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon–Fri

async function seed() {
  const rows = WEEKDAYS.flatMap((weekday) =>
    SLOTS.map((slotTime) => ({ weekday, slotTime, active: true })),
  );
  await db.insert(availabilityRules).values(rows).onConflictDoNothing();
  console.log(`Seeded ${rows.length} availability rules (Mon–Fri × ${SLOTS.length} slots).`);
}

seed().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
