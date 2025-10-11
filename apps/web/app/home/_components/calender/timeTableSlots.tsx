
"use client";
import React from 'react';
import type { FC } from 'react';
import { BookOpen, User } from 'lucide-react';
import { TimetableStatsProps } from '../../types';

const TimetableStats: FC<TimetableStatsProps> = ({ lectures }) => {
  const totalLectures = lectures.length;
  const uniqueSubjects = new Set(lectures.map(l => l.subject.name)).size;
  const uniqueTeachers = new Set(lectures.map(l => l.teacher.name)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-2xl font-bold text-blue-900">{totalLectures}</p>
            <p className="text-sm text-blue-700">Total Lectures</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-2xl font-bold text-green-900">{uniqueSubjects}</p>
            <p className="text-sm text-green-700">Subjects</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-2xl font-bold text-purple-900">{uniqueTeachers}</p>
            <p className="text-sm text-purple-700">Teachers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableStats;