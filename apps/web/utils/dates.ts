// // src/utils/dates.ts
// import { addWeeks, startOfWeek, addDays } from 'date-fns';

// /**
//  * Returns a Monday..Friday week range and the weekDays array for given offset.
//  * offset: 0 = current week, 1 = next week, -1 = prev week
//  */
// export function getWeekRange(offset = 0): { weekStart: Date; weekEnd: Date; weekDays: Date[] } {
//   const target = addWeeks(new Date(), offset);
//   const weekStart = startOfWeek(target, { weekStartsOn: 1 }); // Monday
//   const weekEnd = addDays(weekStart, 4); // Friday
//   const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
//   return { weekStart, weekEnd, weekDays };
// }

// /** format date to YYYY-MM-DD (key for grouping) */
// export function formatDateKey(d: Date | string): string {
//   const date = typeof d === 'string' ? new Date(d) : d;
//   return date.toISOString().split('T')[0];
// }
