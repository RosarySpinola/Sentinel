"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, UserPlus, Trash2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import * as teamsService from "@/lib/services/teams-service";
import type { Team, TeamMember, TeamInvite, TeamRole } from "@/lib/types/team";
import { toast } from "sonner";
import { formatDistanceToNow } from "@/lib/utils/format";
import { useAuth } from "@/lib/hooks/use-auth";

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { walletAddress, isLoaded } = useAuth();
  const [team, setTeam] = useState<
    (Team & { members: TeamMember[]; invites: TeamInvite[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const fetchTeam = useCallback(async () => {
    if (!walletAddress) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await teamsService.getTeam(id, walletAddress);
      setTeam(data);
    } catch {
      toast.error("Failed to fetch team");
    } finally {
      setIsLoading(false);
    }
  }, [id, walletAddress]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !walletAddress) return;

    try {
      await teamsService.inviteMember(id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      }, walletAddress);
      toast.success("Invitation sent");
      setInviteEmail("");
      fetchTeam();
    } catch {
      toast.error("Failed to send invitation");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !walletAddress) return;
    try {
      await teamsService.removeMember(id, memberToRemove.userId, walletAddress);
      toast.success("Member removed");
      setMemberToRemove(null);
      fetchTeam();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleDeleteTeam = async () => {
    if (!walletAddress) return;
    try {
      await teamsService.deleteTeam(id, walletAddress);
      toast.success("Team deleted");
      router.push("/teams");
    } catch {
      toast.error("Failed to delete team");
    }
  };

  const roleColors: Record<TeamRole, string> = {
    owner: "bg-yellow-500/10 text-yellow-500",
    admin: "bg-blue-500/10 text-blue-500",
    member: "bg-gray-500/10 text-gray-400",
  };

  if (isLoading || !team) {
    return (
      <div className="p-6">
        <div className="bg-muted mb-6 h-8 w-48 animate-pulse rounded" />
        <div className="bg-muted h-64 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/teams")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">{team.memberCount} members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {member.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={roleColors[member.role]}
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.joinedAt
                          ? formatDistanceToNow(new Date(member.joinedAt))
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMemberToRemove(member)}
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {team.invites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invites</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.invites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell>{invite.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{invite.role}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {formatDistanceToNow(new Date(invite.expiresAt))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invite Member</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="member@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole(v as TeamRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invite
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from this
              team?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
