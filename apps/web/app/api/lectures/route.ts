// app/api/lectures/route.ts
import { NextResponse } from 'next/server';
// import { getWeekRange } from '@/utils/dates';
import { db } from '@repo/db/src';
import type { LectureWithRelations } from '@/types/session';

function dateKeyKolkata(d: Date | string) {
  return new Date(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
}

function hourMinuteInKolkata(d: Date | string) {
  // returns { hour: number, minute: number }
  const parts = new Date(d).toLocaleString('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }).split(':');
  return { hour: parseInt(parts[0], 10), minute: parseInt(parts[1], 10) };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  // const { weekStart, weekEnd, weekDays } = getWeekRange(offset);
  return NextResponse.json({ message: 'Not implemented' });
  // try {
  //   const lectures = await db.lecture.findMany({
  //     where: { date: { gte: weekStart, lte: weekEnd } },
  //     include: { subject: true, teacher: true, timeSlot: true },
  //     orderBy: [{ date: 'asc' }, { timeSlot: { startTime: 'asc' } }],
  //   });

  //   type Enriched = LectureWithRelations & {
  //     dateKey: string;
  //     slotStartISO: string;
  //     slotEndISO: string;
  //     slotHour: number;
  //     slotMinute: number;
  //     durationMinutes: number;
  //   };

  //   const lecturesByDay: Record<string, Enriched[]> = {};
  //   const weekDayKeys = weekDays.map((d) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
  //   for (const k of weekDayKeys) lecturesByDay[k] = [];

  //   for (const lec of lectures) {
  //     // Prefer the timeSlot start/end if present; fallback to lecture.date
  //     const slotStartSrc = lec.timeSlot?.startTime ?? lec.date;
  //     const slotEndSrc = lec.timeSlot?.endTime ?? new Date(new Date(slotStartSrc).getTime() + 60 * 60 * 1000);

  //     const { hour: slotHour, minute: slotMinute } = hourMinuteInKolkata(slotStartSrc);
  //     const durationMinutes = Math.round((new Date(slotEndSrc).getTime() - new Date(slotStartSrc).getTime()) / 60000);

  //     const enriched: Enriched = {
  //       ...(lec as LectureWithRelations),
  //       dateKey: dateKeyKolkata(lec.date),
  //       slotStartISO: new Date(slotStartSrc).toISOString(),
  //       slotEndISO: new Date(slotEndSrc).toISOString(),
  //       slotHour,
  //       slotMinute,
  //       durationMinutes,
  //     };

  //     if (!lecturesByDay[enriched.dateKey]) lecturesByDay[enriched.dateKey] = [];
  //     lecturesByDay[enriched.dateKey].push(enriched);
  //   }

  //   return NextResponse.json({ lecturesByDay, weekDayKeys });
  // } catch (err) {
  //   console.error('Failed to fetch lectures:', err);
  //   return NextResponse.json({ error: 'Failed to fetch lectures' }, { status: 500 });
  // }
}
