"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Separator } from "@repo/ui/separator";

import {
  User,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
} from "lucide-react";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { approveReplacementRequest, rejectReplacementRequest } from "@/actions/admins/replacementReqs";
import { toast } from "@repo/ui/src/hooks/use-toast";

interface ReplacementRequestCardProps {
  offer: any;
  userRole: UserRole;
  userId: string;
}

const ReplacementRequestCard = ({ offer, userRole, userId }: ReplacementRequestCardProps) => {
  const [status, setStatus] = useState("PENDING");

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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

  const handleAccept = async () => {
    const res = await approveReplacementRequest(offer.id)
    if (res && !res.error) {
      setStatus("APPROVED");
      toast({
        title: "Replacement Request Approved",
        description: "The replacement request has been approved successfully.",
        variant: "default",
      });
    } else if (res && res.error) {
      console.error("Error approving replacement request:", res.error);
      toast({
        title: "Error",
        description: `There was an error approving the replacement request.: ${res.error}`,
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {

    const res = await rejectReplacementRequest(offer.id, offer.lectureId);
    if (res && !res.error) {
      setStatus("REJECTED");
      toast({
        title: "Replacement Request Rejected",
        description: "The replacement request has been rejected successfully.",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "There was an error rejecting the replacement request.",
        variant: "destructive",
      });
    }
  };

  const lecture = offer.lecture;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          {/* Offerer Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={offer.offerer?.image || undefined} />
              <AvatarFallback>{getInitials(offer.offerer?.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {offer.offerer?.name || "Unknown"}
              </CardTitle>
              <CardDescription className="text-xs">
                Offered by {offer.offerer?.email}
              </CardDescription>
            </div>
          </div>

          {/* Status Badge */}
          <div>
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Accepter Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4" /> Replacing Teacher
          </h4>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={offer.accepter?.image || undefined} />
              <AvatarFallback>{getInitials(offer.accepter?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{offer.accepter?.name}</p>
              <p className="text-xs text-muted-foreground">{offer.accepter?.email}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Lecture Details */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lecture Details
          </h4>

          <p className="text-sm font-medium">
            {lecture?.subject?.name || "Subject N/A"}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {lecture?.date ? formatDate(lecture.date) : "Date N/A"}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {lecture?.timeSlot
              ? `${formatTime(lecture.timeSlot.startTime)} - ${formatTime(
                  lecture.timeSlot.endTime
                )}`
              : "Time N/A"}
          </div>

          {lecture?.room && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Room {lecture.room}
            </div>
          )}
        </div>

        <Separator />

        {/* Message */}
        {offer.message && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Message</p>
            <p className="text-sm bg-muted/50 p-3 rounded-md">
              {offer.message}
            </p>
          </div>
        )}

        {/* Request Time */}
        <div className="text-xs text-muted-foreground text-center">
          Offered on {formatDate(offer.createdAt)} at {formatTime(offer.createdAt)}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t">
        <Button
          variant="default"
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={handleAccept}
          disabled={status !== "PENDING"}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Accept
        </Button>

        <Button
          variant="destructive"
          className="flex-1"
          onClick={handleReject}
          disabled={status !== "PENDING"}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReplacementRequestCard;
