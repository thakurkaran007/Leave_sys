"use client";
import React, { useEffect, useState } from 'react';import TimetableStats from './timeTableSlots';
import WeekNavigation from './weekNavigations';
import { DayColumn, TimeColumn } from './dayColumns';
import { DayType, LectureWithRelations } from '../../types';


const weekDays: DayType[] = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' }
];

interface WeeklyTimetableProps {
  sampleLectures: LectureWithRelations[];
}

const WeeklyTimetable = ({ sampleLectures }: WeeklyTimetableProps) => {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [lectures] = useState<LectureWithRelations[]>(sampleLectures);
  const handlePrevWeek = () => setCurrentWeek(prev => Math.max(1, prev - 1));
  const handleNextWeek = () => setCurrentWeek(prev => prev + 1);

  const lecturesByDay = weekDays.reduce((acc: { [key: number]: LectureWithRelations[] }, day) => {
    acc[day.id] = lectures.filter(l => l.weekDay === day.id);
    return acc;
  }, {});

  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Weekly Lecture Timetable</h1>
          <p className="text-gray-600 text-sm">View and manage your weekly class schedule</p>
        </div>
        
        <TimetableStats lectures={lectures} />
        
        <WeekNavigation
          currentWeek={currentWeek}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <div className="flex min-w-[900px]">
              <TimeColumn />
              {weekDays.map(day => (
                <DayColumn
                  key={day.id}
                  day={day}
                  lectures={lecturesByDay[day.id] || []}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2 text-sm">Legend</h3>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded border border-blue-700"></div>
              <span>Regular Lecture</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-dashed border-gray-300 rounded"></div>
              <span>Free Slot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTimetable;