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
  TrendingUp,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { getImageByKey } from "@/data/teachers/user";
import { approveLeaveRequest, rejectLeaveRequest } from "@/actions/admins/leaveReqs";
import { useState } from "react";

interface LeaveRequestCardProps {
    request: any;
    helpedCount?: number;
    userRole: string;
    userId: string;
}

const LeaveRequestCard = ({ request, helpedCount, userRole, userId }: LeaveRequestCardProps) => {
  const [status, setStatus] = useState(request.status || "PENDING");
  
  // Check if this leave has been forwarded by HOD (approverId exists but status is PENDING)
  const isForwardedByHOD = request.status === "PENDING" && request.approverId && request.approver?.role === "HOD";

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

  const getLeaveHistory = () => {
    const total = request.requester._count?.leavesRequested || 0;
    const replacementsOffered = helpedCount;
    return { total, replacementsOffered };
  };

  const getTenure = () => {
    const joined = new Date(request.requester.createdAt);
    const now = new Date();
    const months = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return months;
  };

  const hasReplacement = (request.replacementOffers?.length || 0) > 0;
  const history = getLeaveHistory();
  const tenure = getTenure();

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
    );
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
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${
      !hasReplacement ? 'border-orange-200 border-2' : ''
    }`}>
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
              <CardTitle className="text-lg flex items-center gap-2">
                {request.requester?.name || "Unknown"}
                {request.requester?.teacher_status === "ACTIVE" && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {request.requester?.email}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {!hasReplacement && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                No Coverage
              </Badge>
            )}
            
            {/* Status Badge */}
            {status === "PENDING" && !isForwardedByHOD && (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}

            {isForwardedByHOD && (
              <Badge className="bg-blue-600 text-white">
                <Send className="h-3 w-3 mr-1" />
                Forwarded to Admin
              </Badge>
            )}

            {status === "APPROVED" && (
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved
              </Badge>
            )}

            {(status === "REJECTED" || status === "DENIED") && (
              <Badge className="bg-red-600 text-white">
                <XCircle className="h-3 w-3 mr-1" />
                Rejected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teacher Analytics - Critical for HOD Decision */}
        {userRole === "HOD" && status === "PENDING" && !isForwardedByHOD && (
          <>
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Teacher Profile & History
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{history.total}</p>
                    <p className="text-xs text-muted-foreground">Total Leaves</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{history.replacementsOffered}</p>
                    <p className="text-xs text-muted-foreground">Helped Others</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{tenure}</p>
                    <p className="text-xs text-muted-foreground">Months Here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Separator />
          </>
        )}

        {/* Lecture Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lecture Details
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{request.lecture?.subject?.name || "Subject N/A"}</span>
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
        </div>

        <Separator />

        {/* Replacement Coverage Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Replacement Status
          </h4>
          {hasReplacement ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">
                  {request.replacementOffers?.length || 0} Replacement(s) Available
                </span>
              </div>
              {request.replacementOffers?.map((offer: any, idx: number) => (
                <div key={idx} className="ml-6 text-sm bg-green-50 dark:bg-green-950 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span className="font-medium">{offer.accepter?.name || "Unknown"}</span>
                    <Badge variant="outline" className="text-xs">
                      {offer.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{offer.accepter?.email || "N/A"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600 text-sm bg-orange-50 dark:bg-orange-950 p-3 rounded">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">No replacement arranged - Needs manual assignment</span>
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

        {/* Request Time */}
        <div className="text-xs text-muted-foreground text-center">
          Requested on {formatDate(request.createdAt)} at {formatTime(request.createdAt)}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t">
        {status === "PENDING" && !isForwardedByHOD ? (
          <>
            <Button 
              variant="default" 
              className="flex-1 bg-green-600 hover:bg-green-700" 
              onClick={handleApprove}
              disabled={(!hasReplacement && userRole === "HOD")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {userRole === "ADMIN" ? "Approve" : "Approve & Forward"}
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1" 
              onClick={handleReject}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </>
        ) : isForwardedByHOD && userRole === "ADMIN" ? (
          <>
            <Button 
              variant="default" 
              className="flex-1 bg-green-600 hover:bg-green-700" 
              onClick={handleApprove}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1" 
              onClick={handleReject}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </>
        ) : isForwardedByHOD && userRole === "HOD" ? (
          <div className="w-full text-center py-2">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Send className="h-5 w-5" />
              <span className="font-semibold">Awaiting Admin Decision</span>
            </div>
          </div>
        ) : status === "APPROVED" ? (
          <div className="w-full text-center py-2">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Leave Approved ✓</span>
            </div>
          </div>
        ) : (status === "REJECTED" || status === "DENIED") ? (
          <div className="w-full text-center py-2">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-semibold">Leave Rejected ✗</span>
            </div>
          </div>
        ) : null}
      </CardFooter>

      {isForwardedByHOD && userRole === "HOD" && (
        <div className="px-6 pb-4 bg-blue-50 dark:bg-blue-950 rounded-b-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
            <Send className="h-3 w-3" />
            Forwarded by {request.approver?.name}. Awaiting Admin final approval.
          </p>
        </div>
      )}

      {userRole === "HOD" && status === "PENDING" && !isForwardedByHOD && (
        <div className="px-6 pb-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Send className="h-3 w-3" />
            {hasReplacement 
              ? "Approval will be forwarded to Admin for final review"
              : "⚠️ Consider assigning a replacement before approval"}
          </p>
        </div>
      )}

      {userRole === "ADMIN" && status === "APPROVED" && (
        <div className="px-6 pb-4 bg-green-50 dark:bg-green-950 rounded-b-lg">
          <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Leave has been fully approved and replacement lecture assigned
          </p>
        </div>
      )}

      {(status === "REJECTED" || status === "DENIED") && (
        <div className="px-6 pb-4 bg-red-50 dark:bg-red-950 rounded-b-lg">
          <p className="text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Leave request has been declined and all replacement offers cancelled
          </p>
        </div>
      )}
    </Card>
  );
};

export default LeaveRequestCard;