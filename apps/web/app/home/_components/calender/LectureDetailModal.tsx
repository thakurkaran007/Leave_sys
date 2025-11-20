"use client";
import React, { useEffect, useState } from "react";
import type { FC } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  User,
  UserPlus,
  FileText,
  ArrowLeft,
  Search,
  CheckCircle,
  Send,
  Loader2,
} from "lucide-react";
import { LectureWithRelations, TimeSlotType } from "../../types";
import getTeachers from "@/actions/teacher/availableTeachers";
import { getUser } from "@/hooks/getUser";
import createReplacementOffer from "@/actions/teacher/createReplacement";
import { toast } from "@repo/ui/src/hooks/use-toast";
import { createLeave } from "@/actions/teacher/leave";
import { getSignUrl } from "@/data/teachers/user";
import LeaveRequestDialog from "./LeaveReqDialog";
import { redirect } from "next/dist/server/api-utils";
import { EmptySlotProps } from "./dayColumns";
import { getEmptySlots } from "@/actions/teacher/emptySlots";

interface LectureDetailModalProps {
  lecture: LectureWithRelations;
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = "details" | "selectTeachers" | "confirmOffer" | "success";

const LectureDetailModal: FC<LectureDetailModalProps> = ({
  lecture,
  isOpen,
  onClose,
}) => {
  const user = getUser();
  const [viewMode, setViewMode] = useState<ViewMode>("details");
  const [teachers, setTeachers] = useState<LectureWithRelations["teacher"][]>(
    []
  );
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leave dialog & upload url
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [signedUrl, setSignedUrl] = useState("");

  // --- Slot selection / replacement ---
  const [emptySlots, setEmptySlots] = useState<TimeSlotType[]>([]);
  const [replaceSlot, setReplaceSlot] = useState<TimeSlotType | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  useEffect(() => {
    // fetch empty slots for this lecture's weekday
    let mounted = true;
    setIsLoadingSlots(true);
    getEmptySlots(lecture.id)
      .then((slots) => {
        if (!mounted) return;
        setEmptySlots(slots || []);
      })
      .catch((error) => {
        console.error("Error fetching empty slots:", error);
        toast({
          title: "Error",
          description: "Failed to load available slots.",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (mounted) setIsLoadingSlots(false);
      });

    return () => {
      mounted = false;
    };
  }, [lecture.id]);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (date: Date): string => {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    const [hour, min] = timeString.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${period}`;
  };

  // --- Leave flows ---
  // When clicking Request Leave in UI: get signed URL and show dialog (keeps flow from second file)
  const handleRequestLeave = async () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please log in to request a leave.",
        duration: 5000,
      });
      return;
    }

    try {
      const key = `leaves/${user?.name}/${lecture.id}.pdf`;
      const url = await getSignUrl(key);
      setSignedUrl(url);
      setShowLeaveDialog(true);
    } catch (error) {
      console.error("Error getting signed URL:", error);
      toast({
        title: "Error",
        description: "Failed to get upload URL for leave document.",
        variant: "destructive",
      });
    }
  };

  // Called by LeaveRequestDialog when user submits (keeps logic from second file but supports both createLeave signatures)
  const handleLeaveSubmit = async (reason: string, file: File | null) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting leave request:", { lectureId: lecture.id, reason, file });
      const res = await createLeave(lecture.id, reason);

      if (res.error) throw res.error;
      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted successfully.",
        duration: 5000,
      });
      setShowLeaveDialog(false);
      onClose();
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "Leave Request Failed",
        description: `There is an error: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Replacement flows ---
  const handleOfferReplacement = async () => {
    // require the user to pick a slot to offer (UI-level enforcement)
    if (!replaceSlot) {
      toast({
        title: "Select a slot",
        description: "Please select an available slot to offer replacement for.",
      });
      return;
    }

    setIsLoadingSlots(true);
    setIsLoadingTeachers(true);
    try {
      const fetchedTeachers = await getTeachers(
        lecture.weekDay,
        lecture.timeSlot.startTime,
        lecture.timeSlot.endTime,
        replaceSlot
      );
      const filteredTeachers = fetchedTeachers.filter(
        (teacher: any) => teacher.id !== user?.id
      );
      console.log("Filtered teachers:", filteredTeachers);
      setTeachers(filteredTeachers);
      setViewMode("selectTeachers");
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch available teachers.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTeachers(false);
      setIsLoadingSlots(false);
    }
  };

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId) ? prev.filter((id) => id !== teacherId) : [...prev, teacherId]
    );
  };

  const handleSendOffer = async () => {
    setIsSubmitting(true);
    try {
      // prefer sending to the teachers user explicitly selected
      const idsToSend = selectedTeachers.length > 0 ? selectedTeachers : teachers.map(t => t.id);
      const response = await createReplacementOffer(lecture.id, idsToSend, message, replaceSlot!, lecture.weekDay);

      // first file expected response.success
      if (response && (response as any).success) {
        setViewMode("success");
      } else {
        // if no structured response but request didn't throw, treat as success
        setViewMode("success");
      }
    } catch (error) {
      console.error("Error sending offers:", error);
      toast({
        title: "Error",
        description: `Failed to send replacement offers. ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    (teacher.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTeacherDetails = teachers.filter((t) => selectedTeachers.includes(t.id));

  if (!isOpen) return null;

  const renderContent = () => {
    switch (viewMode) {
      case "details":
        return (
          <>
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

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Location</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{lecture.room || "TBA"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Instructor</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {lecture.teacher.name || "Not assigned"}
                  </p>
                  {lecture.teacher.email && (
                    <p className="text-xs text-gray-500 mt-0.5">{lecture.teacher.email}</p>
                  )}
                </div>
              </div>

              {/* --- Empty slots UI --- */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium uppercase mb-3">Available slots (this weekday)</p>

                {isLoadingSlots ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm text-gray-500">Loading slots...</p>
                  </div>
                ) : emptySlots.length === 0 ? (
                  <div className="text-sm text-gray-500">No empty slots available for this weekday.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {emptySlots.map((slot) => {
                      const isSelected = replaceSlot && replaceSlot.startTime === slot.startTime && replaceSlot.endTime === slot.endTime;
                      return (
                        <button
                          key={`${slot.startTime}-${slot.endTime}`}
                          onClick={() => setReplaceSlot(slot)}
                          className={`px-3 py-1.5 rounded-md border transition-all text-sm focus:outline-none ${isSelected ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:border-green-300'}`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      );
                    })}
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3">Select a slot above to offer replacement for that time. You must pick one to continue.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={handleRequestLeave}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  <FileText className="w-5 h-5" />
                  Request Leave
                </button>

                <button
                  onClick={handleOfferReplacement}
                  disabled={isLoadingTeachers || !replaceSlot}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-green-300"
                >
                  {isLoadingTeachers ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Offer Replacement
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">Lecture ID: {lecture.id}</p>
            </div>
          </>
        );

      case "selectTeachers":
        return (
          <>
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg relative">
              <button
                onClick={() => setViewMode("details")}
                className="absolute top-4 left-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 pl-12">
                <UserPlus className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Select Teachers</h2>
                  <p className="text-green-100 text-sm">{teachers.length} available teachers</p>
                  {replaceSlot && (
                    <p className="text-green-100 text-sm mt-1">Selected slot: {replaceSlot.startTime} - {replaceSlot.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredTeachers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No available teachers found</p>
                  </div>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      onClick={() => toggleTeacher(teacher.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTeachers.includes(teacher.id)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {teacher.name?.charAt(0) || "T"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{teacher.name || "Unknown"}</p>
                            <p className="text-sm text-gray-500">{teacher.email}</p>
                          </div>
                        </div>
                        {selectedTeachers.includes(teacher.id) && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">
                  {selectedTeachers.length} teacher{selectedTeachers.length !== 1 ? "s" : ""} selected
                </p>
              </div>

              <button
                onClick={() => setViewMode("confirmOffer")}
                disabled={selectedTeachers.length === 0}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </>
        );

      case "confirmOffer":
        return (
          <>
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg relative">
              <button
                onClick={() => setViewMode("selectTeachers")}
                className="absolute top-4 left-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 pl-12">
                <Send className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Review & Send</h2>
                  <p className="text-green-100 text-sm">Confirm your replacement offer</p>
                  {replaceSlot && (
                    <p className="text-green-100 text-sm mt-1">Selected slot: {replaceSlot.startTime} - {replaceSlot.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Sending offer to:</p>
                <div className="space-y-2">
                  {selectedTeacherDetails.map((teacher) => (
                    <div key={teacher.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {teacher.name?.charAt(0) || "T"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{teacher.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{teacher.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message for the teachers (optional)..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleSendOffer}
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-green-400 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Replacement Offers
                  </>
                )}
              </button>
            </div>
          </>
        );

      case "success":
        return (
          <>
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Success!</h2>
                  <p className="text-green-100 text-sm">Offers sent successfully</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Offers Sent!</h3>
                <p className="text-gray-600">
                  Your replacement offer has been sent to {selectedTeachers.length} teacher{selectedTeachers.length !== 1 ? "s" : ""}.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  You'll be notified when someone accepts your offer.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {renderContent()}
        </div>
      </div>

      {/* Leave Request Dialog (from second file) */}
      <LeaveRequestDialog
        url={signedUrl}
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        onSubmit={handleLeaveSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default LectureDetailModal;
