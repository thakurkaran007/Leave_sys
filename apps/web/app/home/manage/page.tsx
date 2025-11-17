import { db } from "@repo/db/src";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { 
  Users, 
  Crown, 
  CheckCircle,
} from "lucide-react";
import UserCard from "./_components/UserCard";

// This is a SERVER COMPONENT (no "use client")
const ManageUsers = async () => {
  const teachers = await db.user.findMany({
    where: { role: "TEACHER" },
    include: {
      _count: {
        select: {
          leavesRequested: true,
          replacementOffered: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const hods = await db.user.findMany({
    where: { 
      OR: [
        { role: "HOD" },
        { role: "ADMIN" }
      ]
    },
    include: {
      _count: {
        select: {
          leavesApproved: true,
          replacementsApproved: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground mt-2">
          View and manage teachers and HODs in the system
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total HODs/Admins</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hods.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...teachers, ...hods].filter((u) => u.teacher_status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Teachers and HODs */}
      <Tabs defaultValue="teachers" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="teachers">
            <Users className="h-4 w-4 mr-2" />
            Teachers ({teachers.length})
          </TabsTrigger>
          <TabsTrigger value="hods">
            <Crown className="h-4 w-4 mr-2" />
            HODs ({hods.length})
          </TabsTrigger>
        </TabsList>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-4 mt-6">
          {teachers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No teachers found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher) => (
                <UserCard
                  key={teacher.id}
                  user={teacher}
                  type="teacher"
                  stats={{
                    leaves: teacher._count.leavesRequested,
                    replacements: teacher._count.replacementOffered,
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* HODs Tab */}
        <TabsContent value="hods" className="space-y-4 mt-6">
          {hods.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No HODs found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hods.map((hod) => (
                <UserCard
                  key={hod.id}
                  user={hod}
                  type="hod"
                  stats={{
                    approved: hod._count.leavesApproved,
                    replacementsApproved: hod._count.replacementsApproved,
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageUsers;