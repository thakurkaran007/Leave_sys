
"use client";
import React from 'react';
import type { FC } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface WeekNavigationProps {
  currentWeek: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const WeekNavigation: FC<WeekNavigationProps> = ({ currentWeek, onPrevWeek, onNextWeek }) => {
  return (
    <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={onPrevWeek}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700 font-medium"
        disabled={currentWeek === 1}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous Week
      </button>
      
      <div className="flex items-center gap-2 text-gray-700">
        <Calendar className="w-5 h-5" />
        <span className="font-semibold text-lg">Week {currentWeek}</span>
      </div>
      
      <button
        onClick={onNextWeek}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700 font-medium"
      >
        Next Week
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default WeekNavigation;
