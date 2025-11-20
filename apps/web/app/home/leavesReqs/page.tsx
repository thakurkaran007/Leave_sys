"use server";

import { auth } from "@/auth";
import { db } from "@repo/db/src";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
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
        status: "PENDING",
        replacementOffers: {
          some: {
            status: "ACCEPTED",
          },
        }
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            _count: {
              select: {
                leavesRequested: true,
                replacementOffered: true,
              },
            },
          },
        },
        lecture: {
          include: {
            subject: true,
            timeSlot: true,
          },
        },
        replacementOffers: {
          where: {
            status: {
              in: ["ACCEPTED"],
            },
          },
          include: {
            accepter: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
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
    // HOD sees pending requests with comprehensive data
    leaveReqs = await db.leaveRequest.findMany({
      where: {
        approverId: null,
        status: "PENDING",
        replacementOffers: {
          some: {
            status: "ACCEPTED",
          },
        }
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            teacher_status: true,
            createdAt: true,
            _count: {
              select: {
                leavesRequested: true,
                replacementOffered: true,
              },
            },
          },
        },
        lecture: {
          include: {
            subject: true,
            timeSlot: true,
          },
        },
        replacementOffers: {
          where: {
            status: {
              in: ["ACCEPTED"],
            },
          },
          include: {
            accepter: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
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

  console.log("Leave Requests:", leaveReqs);

  const totalPending = leaveReqs.length;


  const helpedCount = await db.replacementOffer.count({
    where: {
      status: "ACCEPTED",
      approver: {
        role: 'ADMIN',
      },
      accepterId: session?.user.id
    }
  })
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Leave Requests</h1>
        <p className="text-muted-foreground mt-2">
          {session?.user.role === "ADMIN"
            ? "Review and approve leave requests from HOD"
            : "Review and approve pending leave requests with comprehensive insights"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting {session?.user.role === "ADMIN" ? "final" : "your"} approval
            </p>
          </CardContent>
        </Card>
      </div>

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {leaveReqs.map((request) => (
            <LeaveRequestCard
              key={request.id}
              helpedCount={helpedCount}
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