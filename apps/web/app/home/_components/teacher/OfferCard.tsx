"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Calendar, Clock, BookOpen, User, MessageSquare } from "lucide-react";
import { acceptOffer, declineOffer } from "@/actions/teacher/handleOffer";
import { toast } from "@repo/ui/src/hooks/use-toast";
import { useState } from "react";

interface ReplacementOfferCardProps {
  offer: any;
}

const ReplacementOfferCard = ({ offer }: ReplacementOfferCardProps) => {
  // 🔥 Local UI state so no reload is needed
  const [status, setStatus] = useState(offer.status);
  const [loading, setLoading] = useState(false);

  console.log("Offer in OfferCard:", offer);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: "secondary", label: "Pending" },
      ACCEPTED: { variant: "default", label: "Accepted" },
      DECLINED: { variant: "destructive", label: "Declined" },
    };

    const config = variants[status] || variants.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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



  const Accept = async () => {
    if (status !== "PENDING") return; // prevent double action
    setLoading(true);

    const res = await acceptOffer(offer.id);
    if (res) {
      setStatus("ACCEPTED"); // 🔥 update UI instantly
      toast({
        title: "Offer Accepted",
        description: "You have successfully accepted the replacement offer.",
      });
    } else {
      toast({
        title: "Error",
        description: "There was an error accepting the offer. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const Decline = async () => {
    if (status !== "PENDING") return;
    setLoading(true);

    const res = await declineOffer(offer.id);
    if (res) {
      setStatus("DECLINED"); // 🔥 update UI instantly
      toast({
        title: "Offer Declined",
        description: "You have successfully declined the replacement offer.",
      });
    } else {
      toast({
        title: "Error",
        description: "There was an error declining the offer. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Replacement Request</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {offer.offerer?.name || "Unknown Teacher"}
            </CardDescription>
          </div>
          {getStatusBadge(status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{offer.lecture?.subject?.name || "Subject"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{offer.lecture?.date ? formatDate(offer.lecture.date) : "Date N/A"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {offer.lecture?.timeSlot?.startTime && offer.lecture?.timeSlot?.endTime
                ? `${formatTime(offer.lecture.timeSlot.startTime)} - ${formatTime(offer.lecture.timeSlot.endTime)}`
                : "Time N/A"}
            </span>
          </div>
        </div>

        {offer.message && (
          <div className="pt-3 border-t">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                <p className="text-sm">{offer.message}</p>
              </div>
            </div>
          </div>
        )}

        {offer.lecture?.room && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Room:</span> {offer.lecture.room}
          </div>
        )}
      </CardContent>

      {status === "PENDING" ? (
        <CardFooter className="flex gap-2 pt-4 border-t">
          <Button
            variant="default"
            className="flex-1"
            disabled={loading}
            onClick={Accept}
          >
            Accept
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={loading}
            onClick={Decline}
          >
            Decline
          </Button>
        </CardFooter>
      ) : (
        <CardFooter className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {status === "ACCEPTED"
              ? "You have accepted this replacement offer"
              : "You have declined this replacement offer"}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default ReplacementOfferCard;
