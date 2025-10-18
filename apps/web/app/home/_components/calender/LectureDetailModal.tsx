"use client";
import React, { useState } from 'react';
import type { FC } from 'react';
import { X, Calendar, Clock, MapPin, BookOpen, User, UserPlus, FileText } from 'lucide-react';
import { LectureWithRelations } from '../../types';
import getTeachers from '@/actions/teacher/getTeachers';

interface LectureDetailModalProps {
  lecture: LectureWithRelations;
  isOpen: boolean;
  onClose: () => void;
}

const LectureDetailModal: FC<LectureDetailModalProps> = ({ lecture, isOpen, onClose }) => {
  const [teachers, setTeachers] = useState<LectureWithRelations['teacher'][]>([]);
  const [isRequestingLeave, setIsRequestingLeave] = useState(false);
  const [isOfferingReplacement, setIsOfferingReplacement] = useState(false);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date): string => {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Convert to 12-hour format
    const [hour, min] = timeString.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
  };

  const handleRequestLeave = async () => {

    setIsRequestingLeave(true);
  };

  const handleOfferReplacement = async (date: Date) => {
    try {
      const teachers = await getTeachers(date);
      setTeachers(teachers);
      setIsOfferingReplacement(true);
    } catch (error) { 
      setIsOfferingReplacement(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-3">
            <BookOpen className="w-8 h-8 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-1">{lecture.subject.name}</h2>
              <p className="text-blue-100 text-sm">{lecture.subject.code}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date & Time Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Date</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {formatDate(lecture.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Time</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {formatTime(lecture.timeSlot.startTime)} - {formatTime(lecture.timeSlot.endTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Location</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{lecture.room || 'TBA'}</p>
            </div>
          </div>

          {/* Teacher Section */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Instructor</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {lecture.teacher.name || 'Not assigned'}
              </p>
              {lecture.teacher.email && (
                <p className="text-xs text-gray-500 mt-0.5">{lecture.teacher.email}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => handleRequestLeave()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <FileText className="w-5 h-5" />
              Request Leave
            </button>

            <button
              onClick={() => handleOfferReplacement(lecture.date)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Offer Replacement
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Lecture ID: {lecture.id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LectureDetailModal;