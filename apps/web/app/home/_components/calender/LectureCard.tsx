"use client";
import React, { useState } from 'react';
import type { FC } from 'react';
import { MapPin } from 'lucide-react';
import { LectureWithRelations } from '../../types';
import LectureDetailModal from './LectureDetailModal';

interface LectureCardProps {
  lecture: LectureWithRelations;
}

const LectureCard: FC<LectureCardProps> = ({ lecture }) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOnClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div 
        onClick={handleOnClick} 
        className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 h-full cursor-pointer border-l-4 border-blue-700 flex flex-col"
>
        {/* Subject Name and Code */}
        <div className="flex-1 min-h-0">
          <h4 className="font-semibold text-xs leading-tight truncate">
            {lecture.subject.name}
          </h4>
          <p className="text-[10px] opacity-90 truncate">{lecture.subject.code}</p>
        </div>
        
        {/* Details with icons - Compact Layout */}
        <div className="mt-1 space-y-0.5">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="text-[10px] truncate">{lecture.room}</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <LectureDetailModal
          lecture={lecture}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default LectureCard;