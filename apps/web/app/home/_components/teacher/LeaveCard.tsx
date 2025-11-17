"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { CalendarDays, Clock, BookOpen, MapPin, User, CheckCircle2, Clock3, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { getUser } from '@/hooks/getUser';
import { getImageByKey } from '@/data/teachers/user';

// Mock data based on your Prisma schema

const LeaveCard = ({ leave }: any) => {
  const user = getUser();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleShowApplication = async () => {
    try {
      const url = await getImageByKey(leave.application.s3ObjectKey);
      console.log("Fetched application URL:", url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error("Failed loading application:", err);
    }
  };

  // Determine progress stages
  const getProgressStage = () => {
    if (!leave.approver) {
      return { stage: 1, label: "Created", icon: AlertCircle, color: "text-blue-500" };
    } else if (leave.approver.role === "HOD") {
      return { stage: 2, label: "HOD Approved", icon: CheckCircle2, color: "text-orange-500" };
    } else if (leave.approver.role === "ADMIN" && leave.status === "APPROVED") {
      return { stage: 3, label: "Admin Approved", icon: CheckCircle2, color: "text-green-500" };
    }
    return { stage: 1, label: "Created", icon: AlertCircle, color: "text-blue-500" };
  };

  const progress = getProgressStage();
  const isDenied = leave.status === "DENIED";
  const isPending = leave.status === "PENDING";

  const getStatusBadge = () => {
    if (isDenied) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Denied</Badge>;
    }
    if (isPending) {
      return <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800 border-yellow-300"><Clock3 className="h-3 w-3" />Pending</Badge>;
    }
    if (progress.stage === 3) {
      return <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-300"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
    }
    return <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-800 border-blue-300"><Clock3 className="h-3 w-3" />In Progress</Badge>;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (

    <>
      {/* ⭐ ADDED: full screen preview overlay */}
      {previewUrl && (
        <div
          onClick={() => setPreviewUrl(null)}
          className="fixed inset-0 bg-black bg-opacity-70 z-[9999] flex items-center justify-center"
        >
          <img
            src={previewUrl}
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl border"
          />
        </div>
      )}

      <Card className="w-full max-w-3xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-gray-900">Leave Request</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Requested {new Date(leave.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </CardDescription>

              {leave.application && (
                <button
                  onClick={handleShowApplication}
                  className="text-indigo-600 underline text-xs mt-1 hover:text-indigo-800"
                >
                  View Application
                </button>
              )}
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Lecture Details */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              Lecture Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">
                  {weekDays[leave.lecture.weekDay]}, {new Date(leave.lecture.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{leave.lecture.timeSlot.label}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{leave.lecture.subject.name} ({leave.lecture.subject.code})</span>
              </div>
              {leave.lecture.room && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Room {leave.lecture.room}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Reason</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
              {leave.reason}
            </p>
          </div>

          {/* Progress Tracker */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Approval Progress</h3>
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    isDenied ? 'bg-red-500' : progress.stage === 1 ? 'bg-blue-500 w-0' : progress.stage === 2 ? 'bg-orange-500 w-1/2' : 'bg-green-500 w-full'
                  }`}
                />
              </div>

              <div className="relative flex justify-between">

                {/* Created */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${
                    progress.stage >= 1 ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-400'
                  }`}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 mt-2">Created</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(leave.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* HOD */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${
                    progress.stage >= 2 ? 'border-orange-500 text-orange-500' : 'border-gray-300 text-gray-400'
                  }`}>
                    {isDenied && progress.stage < 2 ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : progress.stage >= 2 ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock3 className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 mt-2">HOD Approval</span>
                  {progress.stage >= 2 && (
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(leave.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Admin */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${
                    progress.stage >= 3 ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-400'
                  }`}>
                    {isDenied && progress.stage < 3 ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : progress.stage >= 3 ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock3 className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 mt-2">Admin Approval</span>
                  {progress.stage >= 3 && (
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(leave.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Assigned To Section */}
          {leave.assignedTo && progress.stage <= 2 && !isDenied && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="h-4 w-size4 text-green-600" />
                Assigned Replacement Teacher
              </h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-green-300">
                  <AvatarImage src={leave.assignedTo.image || undefined} />
                  <AvatarFallback className="bg-green-200 text-green-700 font-semibold">
                    {leave.assignedTo.name?.split(' ').map((n: any) => n[0]).join('') || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{leave.assignedTo.name}</p>
                  <p className="text-xs text-gray-600">{leave.assignedTo.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Approver Info */}
          {leave.approver && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
              <Avatar className="h-8 w-8">
                <AvatarImage src={leave.approver.image || undefined} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  {leave.approver.name?.split(' ').map((n: any) => n[0]).join('') || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-gray-500">
                  {isDenied ? 'Denied by' : 'Approved by'} {leave.approver.role}
                </p>
                <p className="text-sm font-medium text-gray-900">{leave.approver.name}</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </>
  );
};

export default LeaveCard;