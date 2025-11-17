import { auth } from "@/auth";
import { db } from "@repo/db/src";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import {
  CheckCircle,
  AlertCircle
} from "lucide-react";
import LeaveRequestCard from "./_components/Card";

const LeaveRequests = async () => {
  const session = await auth();
  let leaveReqs;

  if (session?.user.role === "ADMIN") {
    // Admin sees requests approved by HOD
    leaveReqs = await db.leaveRequest.findMany({
      where: {
        approver: {
          role: "HOD",
        },
        status: "APPROVED",
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        lecture: {
          include: {
            subject: true,
            timeSlot: true,
          },
        },
        approver: {
          select: {
            name: true,
            role: true,
          },
        },
        application: {
          select: {
            s3ObjectKey: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // HOD sees pending requests
    leaveReqs = await db.leaveRequest.findMany({
      where: {
        approverId: null,
        status: "PENDING",
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        lecture: {
          include: {
            subject: true,
            timeSlot: true,
          },
        },
        application: {
          select: {
            s3ObjectKey: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Leave Requests</h1>
        <p className="text-muted-foreground mt-2">
          {session?.user.role === "ADMIN"
            ? "Review and approve leave requests from HOD"
            : "Review and approve pending leave requests"}
        </p>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {session?.user.role === "ADMIN" ? "Pending Admin Approval" : "Pending Requests"}
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leaveReqs.length}</div>
          <p className="text-xs text-muted-foreground">
            Requires {session?.user.role === "ADMIN" ? "final" : "your"} approval
          </p>
        </CardContent>
      </Card>

      {/* Leave Request Cards */}
      {leaveReqs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <p className="text-muted-foreground">No pending leave requests</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leaveReqs.map((request) => (
            <LeaveRequestCard
              key={request.id}
              request={request}
              userRole={session?.user.role!}
              userId={session?.user.id!}
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default LeaveRequests;