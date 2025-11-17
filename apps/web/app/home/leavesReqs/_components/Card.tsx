"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Separator } from "@repo/ui/separator";
import {
  FileText,
  Calendar,
  Clock,
  User,
  BookOpen,
  MapPin,
  CheckCircle,
  XCircle,
  ExternalLink,
  Send,
} from "lucide-react";
import { getImageByKey } from "@/data/teachers/user";
import { approveLeaveRequest, rejectLeaveRequest } from "@/actions/admins/leaveReqs";
import { useState } from "react";

interface LeaveRequestCardProps {
    request: any;
    userRole: string;
    userId: string;
}

const LeaveRequestCard = ({ request, userRole, userId }: LeaveRequestCardProps) => {
  const [status, setStatus] = useState(request.status || "PENDING");

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = async () => {
    await approveLeaveRequest(
      request.id,
      userId,
      userRole
    );
    setStatus("APPROVED");
  };

  const handleReject = async () => {
    await rejectLeaveRequest(
        request.id,
        userId
    )
    setStatus("REJECTED");
  };

  const handleViewApplication = async () => {
    if (request.application?.s3ObjectKey) {
      try {
        const signedUrl = await getImageByKey(request.application.s3ObjectKey);
        window.open(signedUrl, "_blank");
      } catch (error) {
        console.error("Error fetching application:", error);
      }
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={request.requester?.image || undefined}
                alt={request.requester?.name || "User"}
              />
              <AvatarFallback>{getInitials(request.requester?.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-lg">{request.requester?.name || "Unknown"}</CardTitle>
              <CardDescription className="text-xs">
                {request.requester?.email}
              </CardDescription>
            </div>
          </div>

          {/* UPDATED BADGE */}
          {status === "PENDING" && (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}

          {status === "APPROVED" && (
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Approved
            </Badge>
          )}

          {status === "REJECTED" && (
            <Badge className="bg-red-600 text-white">
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lecture Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {request.lecture?.subject?.name || "Subject N/A"}
            </span>
            {request.lecture?.subject?.code && (
              <Badge variant="outline" className="text-xs">
                {request.lecture.subject.code}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{request.lecture?.date ? formatDate(request.lecture.date) : "Date N/A"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {request.lecture?.timeSlot?.startTime && request.lecture?.timeSlot?.endTime
                ? `${formatTime(request.lecture.timeSlot.startTime)} - ${formatTime(
                    request.lecture.timeSlot.endTime
                  )}`
                : request.lecture?.timeSlot?.label || "Time N/A"}
            </span>
          </div>

          {request.lecture?.room && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Room {request.lecture.room}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Reason */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Leave Reason
          </p>
          <p className="text-sm bg-muted/50 p-3 rounded-md">{request.reason}</p>
        </div>

        {/* HOD Approval Info (for Admin) */}
        {userRole === "ADMIN" && request.approver && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>
                Approved by {request.approver.name} ({request.approver.role})
              </span>
            </div>
          </>
        )}

        {/* Application Document */}
        {request.application?.s3ObjectKey && (
          <>
            <Separator />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleViewApplication}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Application Document
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </>
        )}

        <div className="text-xs text-muted-foreground"></div>
      </CardContent>

      {/* HIDE BUTTONS AFTER ACTION */}
      {status === "PENDING" && (
        <CardFooter className="flex gap-2 pt-4 border-t">
          <Button variant="default" className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleApprove}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {userRole === "ADMIN" ? "Approve" : "Approve & Forward"}
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleReject}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </CardFooter>
      )}

      {userRole === "HOD" && (
        <div className="px-6 pb-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Send className="h-3 w-3" />
            Approval will be forwarded to Admin for final review
          </p>
        </div>
      )}
    </Card>
  );
};

export default LeaveRequestCard;
