"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Calendar, Clock, User, MapPin, BookOpen, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { useState } from "react";

// Mock data for demonstration

const ProgressBar = ({ status, approverRole, onClick }: { status: string; approverRole: string | null; onClick: () => void }) => {
  const getProgress = () => {
    if (status === "PENDING") return { width: "33%", text: "Awaiting Acceptance" };
    if (status === "DECLINED") return { width: "0%", text: "Declined" };
    if (status === "ACCEPTED" && !approverRole) return { width: "66%", text: "Accepted - Pending Approval" };
    if (status === "ACCEPTED" && approverRole === "HOD") return { width: "66%", text: "Approved by HOD" };
    if (status === "ACCEPTED" && approverRole === "ADMIN") return { width: "100%", text: "Fully Approved" };
    return { width: "0%", text: "Unknown" };
  };

  const progress = getProgress();
  const isDone = progress.width === "100%";
  const isDeclined = status === "DECLINED";

  return (
    <div className="mt-4 cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{progress.text}</span>
        <span className="text-xs text-gray-500">{progress.width}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isDeclined ? "bg-red-500" : isDone ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: progress.width }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Offered</span>
        <span>Accepted</span>
        <span>Approved</span>
      </div>
    </div>
  );
};

export const ReplacementCard = ({ replacement }: { replacement: any }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { status, lecture, accepter, approver, message, createdAt } = replacement;

  const getStatusColor = () => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED": return "bg-green-100 text-green-800";
      case "DECLINED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "PENDING": return <Clock3 className="w-4 h-4" />;
      case "ACCEPTED": return <CheckCircle2 className="w-4 h-4" />;
      case "DECLINED": return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {lecture.subject.name}
              <span className="text-sm text-gray-500 font-normal">({lecture.subject.code})</span>
            </CardTitle>
          </div>
          <Badge className={`${getStatusColor()} flex items-center gap-1`}>
            {getStatusIcon()}
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Lecture Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <div>
                <div className="font-medium">{weekDays[lecture.weekDay]}</div>
              <div className="text-xs">
                {new Date(lecture.date).toLocaleDateString("en-IN", { timeZone: "UTC" })}
              </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <div>
                <div className="font-medium">{lecture.timeSlot.label}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{lecture.room}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="font-medium">{lecture.teacher.name}</span>
            </div>
          </div>

          {/* Replacement Details */}
          <div className="pt-3 border-t border-gray-200">
            {status === "PENDING" && (
              <div className="text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Offered to:</span> {accepter.name}
                </p>
                {message && (
                  <p className="text-gray-500 mt-1 italic">"{message}"</p>
                )}
              </div>
            )}

            {status === "ACCEPTED" && (
              <div className="text-sm space-y-1">
                <p className="text-green-600 font-medium">
                  ✓ Accepted by {accepter.name}
                </p>
                {approver && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Approver:</span> {approver.name} ({approver.role})
                  </p>
                )}
                {!approver && (
                  <p className="text-amber-600">Awaiting final approval</p>
                )}
              </div>
            )}

            {status === "DECLINED" && (
              <div className="text-sm">
                <p className="text-red-600 font-medium">
                  ✗ Declined by {accepter.name}
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <ProgressBar
            status={status}
            approverRole={approver?.role}
            onClick={() => setShowDetails(!showDetails)}
          />

          {/* Additional Details (Expandable) */}
          {showDetails && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm space-y-2">
              <p><span className="font-semibold">Created:</span> {new Date(createdAt).toLocaleString()}</p>
              {accepter.email && (
                <p><span className="font-semibold">Accepter Email:</span> {accepter.email}</p>
              )}
              {lecture.teacher.email && (
                <p><span className="font-semibold">Original Teacher:</span> {lecture.teacher.email}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};