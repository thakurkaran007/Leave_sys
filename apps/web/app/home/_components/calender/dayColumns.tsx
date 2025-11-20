"use client";
import React from 'react';
import type { FC } from 'react';
import { Clock } from 'lucide-react';
import LectureCard from './LectureCard';
import { DayType, TimeSlotType, LectureWithRelations } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface DayColumnProps {
  day: DayType;
  lectures: LectureWithRelations[];
}

export interface EmptySlotProps {
  timeSlot: TimeSlotType;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
const TIMETABLE_CONFIG = {
  START_HOUR: 8,
  END_HOUR: 17,
  SLOT_DURATION: 60, // minutes
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates hourly time slots for the timetable
 */
const generateTimeSlots = (): TimeSlotType[] => {
  const slots: TimeSlotType[] = [];
  let hour = TIMETABLE_CONFIG.START_HOUR;
  let minute = 0;
  
  while (hour < TIMETABLE_CONFIG.END_HOUR) {
    const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    minute += TIMETABLE_CONFIG.SLOT_DURATION;
    if (minute >= 60) {
      hour += 1;
      minute = 0;
    }
    
    const endTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    slots.push({ startTime, endTime });
  }
  
  return slots;
};

/**
 * Converts Date object to "HH:MM" format using UTC time
 * (matching how times are stored in the database)
 */
const formatTimeFromDate = (date: Date): string => {
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Finds a lecture that matches the given time slot
 */
const findLectureForSlot = (
  slot: TimeSlotType,
  lectures: LectureWithRelations[]
): LectureWithRelations | undefined => {
  return lectures.find(lecture => {
    const lectureStartTime = formatTimeFromDate(lecture.timeSlot.startTime);
    const lectureEndTime = formatTimeFromDate(lecture.timeSlot.endTime);
    
    return lectureStartTime === slot.startTime && lectureEndTime === slot.endTime;
  });
};

// Generate time slots once
const TIME_SLOTS: TimeSlotType[] = generateTimeSlots();

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Empty slot component - displayed when no lecture is scheduled
 */
const EmptySlot: FC<EmptySlotProps> = ({ timeSlot }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md h-full w-full flex items-center justify-center hover:border-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
        <span className="text-[10px] text-gray-400">Available</span>
      </div>
    </div>
  );
};

/**
 * Time column component - displays time slots in the left sidebar
 */
export const TimeColumn: FC = () => {
  return (
    <div className="sticky left-0 bg-white z-20 border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-center font-semibold text-gray-700 px-3 bg-gray-50">
        <Clock className="w-4 h-4 mr-1.5" />
        <span className="text-sm">Time</span>
      </div>
      
      {/* Time slots */}
      {TIME_SLOTS.map((slot, idx) => (
        <div
          key={idx}
          className="h-20 border-b border-gray-200 flex flex-col items-center justify-center px-3 text-xs bg-white"
        >
          <span className="font-medium text-gray-700">{slot.startTime}</span>
          <span className="text-[10px] text-gray-400 my-0.5">-</span>
          <span className="font-medium text-gray-700">{slot.endTime}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Day column component - displays lectures for a specific day
 */
export const DayColumn: FC<DayColumnProps> = ({ day, lectures }) => {
  return (
    <div className="flex-1 min-w-[150px]">
      {/* Day header */}
      <div className="h-14 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center font-semibold text-gray-700 sticky top-0 z-10">
        <span className="text-sm font-bold">{day.short}</span>
        <span className="text-[10px] text-gray-500 font-normal">{day.name}</span>
      </div>

      {/* Lecture slots */}
      {TIME_SLOTS.map((slot, idx) => {
        const lecture = findLectureForSlot(slot, lectures);

        return (
          <div key={idx} className="h-20 border-b border-r border-gray-200 p-1">
            {lecture ? (
              <LectureCard lecture={lecture} />
            ) : (
              <EmptySlot timeSlot={slot} />
            )}
          </div>
        );
      })}
    </div>
  );
};