"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateUserForm } from "@/components/features/auth/create-user-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Crown,
    Shield,
    UserCog,
    UtensilsCrossed,
    Archive,
    MoreHorizontal,
    Trash2,
    UserPlus,
} from "lucide-react";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ErrorSplashScreen } from "@/components/ui/error-splash-screen";

type UserProfile = {
    id: string;
    email: string;
    display_name?: string;
    timezone?: string;
    city_id?: string;
    city_name?: string;
    city_ids?: string[];
    city_names?: string[];
    onboards?: number;
    requestsAssigned?: number;
    roles?: string[];
};

const ROLE_LABELS: Record<string, string> = {
    ACCOUNT_MANAGER: "Account Manager",
    BDR: "BDR",
    TEAM_LEAD: "Team Lead",
    SUPER_ADMIN: "Super Admin",
};

const ROLE_CLASSES: Record<string, string> = {
    ACCOUNT_MANAGER: "bg-emerald-600 text-white",
    BDR: "bg-amber-500 text-slate-950",
    TEAM_LEAD: "bg-rose-600 text-white",
    SUPER_ADMIN: "bg-indigo-600 text-white",
};

const ROLE_ICON_MAP: Record<string, typeof Shield> = {
    ACCOUNT_MANAGER: UserCog,
    BDR: UtensilsCrossed,
    TEAM_LEAD: Crown,
    SUPER_ADMIN: Shield,
};

const CITY_PILL_STYLES = [
    "bg-sky-200/80 text-sky-950 border border-sky-300/70",
    "bg-emerald-200/80 text-emerald-950 border border-emerald-300/70",
    "bg-amber-200/90 text-amber-900 border border-amber-300/80",
    "bg-rose-200/80 text-rose-950 border border-rose-300/70",
    "bg-indigo-200/80 text-indigo-950 border border-indigo-300/70",
];

const getCityPillClass = (name: string) => {
    if (!name) return "bg-white/20 text-foreground border border-white/30";
    const index = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0) % CITY_PILL_STYLES.length;
    return CITY_PILL_STYLES[index];
};

function UserCard({
    user,
    onClick,
    onArchive,
    onDelete,
}: {
    user: UserProfile;
    onClick: (user: UserProfile) => void;
    onArchive: (user: UserProfile) => void;
    onDelete: (user: UserProfile) => void;
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick(user)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick(user);
                }
            }}
            className="widget rounded-xl border border-white/15 bg-card p-5 text-center shadow-lg space-y-3 transition hover:border-primary/40 min-w-[260px] w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">User actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            className="text-amber-600 focus:text-amber-600"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onArchive(user);
                            }}
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive user
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onDelete(user);
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete permanently
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/5 text-2xl font-semibold text-primary/80">
                    {(user.display_name || user.email || "?")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((chunk) => chunk[0]?.toUpperCase())
                        .join("")}
                </div>
            </div>

            <p className="text-base font-semibold truncate">{user.display_name || user.email}</p>

            <div className="flex justify-center gap-1 flex-wrap">
                {user.roles?.length ? (
                    user.roles.map((role) => {
                        const label = ROLE_LABELS[role] ?? role.replace("_", " ");
                        const Icon = ROLE_ICON_MAP[role] ?? Shield;
                        return (
                            <div
                                key={`${user.id}-${role}`}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${ROLE_CLASSES[role] || "bg-gray-500 text-white"}`}
                            >
                                <Icon className="h-3 w-3" />
                                {label}
                            </div>
                        );
                    })
                ) : (
                    <span className="text-xs text-muted-foreground">No roles</span>
                )}
            </div>

            {user.city_names && user.city_names.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                    {user.city_names.slice(0, 3).map((cityName, idx) => (
                        <span
                            key={idx}
                            className={`text-xs px-2 py-0.5 rounded-full ${getCityPillClass(cityName)}`}
                        >
                            {cityName}
                        </span>
                    ))}
                    {user.city_names.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-foreground">
                            +{user.city_names.length - 3}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

const UserListCard = dynamic(
    () =>
        Promise.resolve(({ users, usersLoading }: { users: UserProfile[]; usersLoading: boolean }) => (
            <div className="widget">
                <Card className="border border-white/15 p-6">
                    <h3 className="text-lg font-semibold mb-4">All Users ({users.length})</h3>
                    {usersLoading ? (
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-4 w-[200px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No users found</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Click on a user card to view details
                        </p>
                    )}
                </Card>
            </div>
        )),
    { ssr: false }
);

export default function CreateUserPage() {
    const { user, isSuperAdmin, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userToArchive, setUserToArchive] = useState<UserProfile | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

    const loadUsers = async () => {
        try {
            setUsersLoading(true);
            const { data: { session } } = await (window as any).supabase.auth.getSession();

            const response = await fetch("/api/admin/get-users", {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch users");

            const data = await response.json();
            setUsers(data.users || []);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        if (user && isSuperAdmin) {
            loadUsers();
        }
    }, [user, isSuperAdmin]);

    const handleArchiveUser = async () => {
        if (!userToArchive) return;

        try {
            const { data: { session } } = await (window as any).supabase.auth.getSession();

            const response = await fetch("/api/admin/archive-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    user_id: userToArchive.id,
                    reason: "Archived via UI",
                }),
            });

            if (!response.ok) throw new Error("Failed to archive user");

            toast({
                title: "User Archived",
                description: `${userToArchive.email} has been archived`,
            });

            await loadUsers();
            setUserToArchive(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const { data: { session } } = await (window as any).supabase.auth.getSession();

            const response = await fetch("/api/admin/delete-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    user_id: userToDelete.id,
                    reason: "Deleted via UI",
                }),
            });

            if (!response.ok) throw new Error("Failed to delete user");

            toast({
                title: "User Deleted",
                description: `${userToDelete.email} has been permanently deleted`,
            });

            await loadUsers();
            setUserToDelete(null);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    if (authLoading) return <SplashScreen />;
    if (!user) return <ErrorSplashScreen message="Please log in" actionText="Go to Login" onActionClick={() => window.location.href = '/'} />;
    if (!isSuperAdmin) return <ErrorSplashScreen message="Access denied - Super Admin only" actionText="Go to Dashboard" onActionClick={() => window.location.href = '/dashboard'} />;

    return (
        <DashboardLayout title="Create User">
            {/* Page wordmark */}
            <div className="pointer-events-none fixed left-4 bottom-0 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 opacity-50">
                Users
            </div>

            {/* Create User Button */}
            <div className="mb-6">
                <Button onClick={() => setShowCreateModal(true)} size="lg">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create New User
                </Button>
            </div>

            {/* User Grid */}
            <div className="dashboard-grid">
                <UserListCard users={users} usersLoading={usersLoading} />

                {!usersLoading &&
                    users.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            onClick={setSelectedUser}
                            onArchive={setUserToArchive}
                            onDelete={setUserToDelete}
                        />
                    ))}
            </div>

            {/* Create User Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="rounded-[24px] backdrop-blur-xl max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <CreateUserForm
                        onCancel={() => setShowCreateModal(false)}
                        onCreated={() => {
                            setShowCreateModal(false);
                            loadUsers();
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Archive Confirmation */}
            <AlertDialog open={!!userToArchive} onOpenChange={() => setUserToArchive(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive User?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to archive {userToArchive?.email}? This user will be moved to the
                            archive and can be restored later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchiveUser}>Archive</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User Permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete {userToDelete?.email}? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
