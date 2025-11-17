"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Separator } from "@repo/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { 
  Users, 
  Crown, 
  Mail, 
  Calendar, 
  RefreshCw, 
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";


interface UserCardProps {
  user: any;
  type: "teacher" | "hod";
  stats: {
    leaves?: number;
    replacements?: number;
    approved?: number;
    replacementsApproved?: number;
  };
}

const UserCard = ({ user, type, stats }: UserCardProps) => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      ACTIVE: { variant: "default", icon: CheckCircle },
      PENDING: { variant: "secondary", icon: Clock },
      INACTIVE: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || variants.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemoveUser = () => {
    // Handler for removing user
    console.log("Remove user:", user.id);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-lg">{user.name || "Unnamed"}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs">
                <Mail className="h-3 w-3" />
                {user.email}
              </CardDescription>
            </div>
          </div>
          {(type === "hod" || user.role === "HOD" || user.role === "ADMIN") && (
            <Crown className="h-5 w-5 text-yellow-500" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {getStatusBadge(user.teacher_status)}
        </div>

        <Separator />

        {/* Stats */}
        {type === "teacher" ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Leaves
              </div>
              <p className="text-2xl font-bold">{stats.leaves || 0}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                Replacements
              </div>
              <p className="text-2xl font-bold">{stats.replacements || 0}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                Approved
              </div>
              <p className="text-2xl font-bold">{stats.approved || 0}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                Replacements
              </div>
              <p className="text-2xl font-bold">{stats.replacementsApproved || 0}</p>
            </div>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <UserDetailsDialog user={user} type={type} stats={stats} />

          <Button variant="destructive" size="icon" onClick={handleRemoveUser}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Separate component for the dialog to make it cleaner
const UserDetailsDialog = ({ user, type, stats }: UserCardProps) => {
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      ACTIVE: { variant: "default", icon: CheckCircle },
      PENDING: { variant: "secondary", icon: Clock },
      INACTIVE: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || variants.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl">{user.name || "Unnamed User"}</p>
              <p className="text-sm font-normal text-muted-foreground flex items-center gap-1 mt-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete user information and statistics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <div className="flex items-center gap-2">
                  {(user.role === "HOD" || user.role === "ADMIN") && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <p className="text-lg font-semibold">{user.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                {getStatusBadge(user.teacher_status)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity Statistics */}
          {type === "teacher" ? (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Activity Statistics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Total Leaves</p>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-3xl font-bold">{stats.leaves || 0}</p>
                      <p className="text-xs text-muted-foreground">Leave requests made</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Replacements</p>
                        <RefreshCw className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-3xl font-bold">{stats.replacements || 0}</p>
                      <p className="text-xs text-muted-foreground">Offers made to others</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approval Statistics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Leaves Approved</p>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-3xl font-bold">{stats.approved || 0}</p>
                      <p className="text-xs text-muted-foreground">Leave requests processed</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Replacements</p>
                        <RefreshCw className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-3xl font-bold">{stats.replacementsApproved || 0}</p>
                      <p className="text-xs text-muted-foreground">Replacements approved</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <Separator />

          {/* Account Info */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Account Information
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-sm font-semibold">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.floor(
                    (new Date().getTime() - new Date(user.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </Badge>
              </div>

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-semibold">
                    {new Date(user.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {user.emailVerified && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Email verified on{" "}
                  {new Date(user.emailVerified).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserCard;