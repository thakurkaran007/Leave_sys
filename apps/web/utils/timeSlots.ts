// src/utils/timeSlots.ts

/**
 * Simple time slot generator for fixed hour rows.
 * Produces rows from startHour (inclusive) to endHour (exclusive).
 * Default: 9..15 => hours 9,10,11,12,13,14 (each row is 1 hour)
 */
export type HourSlot = {
  hour: number;        // 0-23
  label: string;       // human label like "09:00 - 10:00"
};

export function getDefaultTimeSlots(startHour = 9, endHour = 15): HourSlot[] {
  const slots: HourSlot[] = [];
  for (let h = startHour; h < endHour; h++) {
    const start = `${h.toString().padStart(2, '0')}:00`;
    const end = `${(h + 1).toString().padStart(2, '0')}:00`;
    slots.push({ hour: h, label: `${start} - ${end}` });
  }
  return slots;
}
