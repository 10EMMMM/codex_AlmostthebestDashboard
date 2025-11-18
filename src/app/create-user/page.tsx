"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CreateUserForm } from "@/components/create-user-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ErrorSplashScreen } from "@/components/ui/error-splash-screen";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Crown,
  MapPin,
  Shield,
  UserCog,
  UserRound,
  UtensilsCrossed,
  Archive,
  MoreHorizontal,
  Trash2,
  UserPlus,
  Target,
  Send,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

const AVAILABLE_ROLES = ["ACCOUNT_MANAGER", "BDR", "TEAM_LEAD"] as const;
const ROLE_LABELS: Record<(typeof AVAILABLE_ROLES)[number], string> = {
  ACCOUNT_MANAGER: "Account Manager",
  BDR: "BDR",
  TEAM_LEAD: "Team Lead",
};
const ROLE_CLASSES: Record<(typeof AVAILABLE_ROLES)[number], string> = {
  ACCOUNT_MANAGER: "bg-emerald-600 text-white hover:bg-emerald-500",
  BDR: "bg-amber-500 text-slate-950 hover:bg-amber-400",
  TEAM_LEAD: "bg-rose-600 text-white hover:bg-rose-500",
};
const ROLE_ICON_MAP: Record<string, typeof MapPin> = {
  ACCOUNT_MANAGER: UserCog,
  BDR: UtensilsCrossed,
  TEAM_LEAD: Crown,
  SUPER_ADMIN: Shield,
};
const ROLE_ICON_STYLES: Record<string, string> = {
  ACCOUNT_MANAGER: "bg-emerald-400/60 text-emerald-950 shadow-emerald-900/20",
  BDR: "bg-amber-300/70 text-amber-900 shadow-amber-900/20",
  TEAM_LEAD: "bg-rose-400/60 text-rose-950 shadow-rose-900/20",
  SUPER_ADMIN: "bg-indigo-400/60 text-indigo-950 shadow-indigo-900/20",
};
const ROLE_HOVER_STYLES: Record<string, string> = {
  ACCOUNT_MANAGER: "hover:bg-emerald-500/80 hover:text-emerald-50",
  BDR: "hover:bg-amber-400/80 hover:text-amber-950",
  TEAM_LEAD: "hover:bg-rose-500/80 hover:text-rose-50",
  SUPER_ADMIN: "hover:bg-indigo-500/80 hover:text-indigo-50",
};

const CITY_PILL_STYLES = [
  "bg-sky-200/80 text-sky-950 border border-sky-300/70",
  "bg-emerald-200/80 text-emerald-950 border border-emerald-300/70",
  "bg-amber-200/90 text-amber-900 border border-amber-300/80",
  "bg-rose-200/80 text-rose-950 border border-rose-300/70",
  "bg-indigo-200/80 text-indigo-950 border border-indigo-300/70",
  "bg-purple-200/85 text-purple-950 border border-purple-300/70",
  "bg-lime-200/90 text-lime-900 border border-lime-300/80",
];

const getCityPillClass = (name: string) => {
  if (!name) return "bg-white/20 text-foreground border border-white/30";
  const index =
    Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0) % CITY_PILL_STYLES.length;
  return CITY_PILL_STYLES[index];
};

const formatCityLabel = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "Unnamed City";
  if (trimmed.length <= 18) return trimmed;
  return trimmed.slice(0, 17) + "…";
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
      <div className="flex justify-center gap-1 overflow-x-auto">
        {user.roles?.length ? (
          user.roles.map((role) => {
            const label = ROLE_LABELS[role as (typeof AVAILABLE_ROLES)[number]] ?? role.replace("_", " ");
            return (
              <div
                key={`${user.id}-${role}`}
                className={`inline-flex size-7 items-center justify-center rounded-full text-[10px] uppercase shadow-[0_0_12px_rgba(0,0,0,0.25)] transition-colors ${ROLE_ICON_STYLES[role] ?? "bg-white/40 text-foreground/80"} ${ROLE_HOVER_STYLES[role] ?? "hover:bg-white/60"}`}
                aria-label={label}
                title={label}
              >
                {(() => {
                  const Icon = ROLE_ICON_MAP[role] ?? UserRound;
                  return <Icon className="size-3.5" strokeWidth={2.25} />;
                })()}
              </div>
            );
          })
        ) : (
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">No roles assigned</span>
        )}
      </div>
      <div className="space-y-1">
        {user.city_names?.length ? (
          <div className="flex flex-wrap justify-center gap-1">
            {user.city_names.map((city, idx) => (
              <span
                key={`${user.id}-city-${idx}`}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur ${getCityPillClass(
                  city
                )}`}
                title={city}
              >
                <span className="truncate">{formatCityLabel(city)}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap justify-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-foreground">
          <Target className="h-3 w-3" />
          {user.onboards ?? 0} onboards
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-foreground">
          <Send className="h-3 w-3" />
          {user.requestsAssigned ?? 0} requests
        </span>
      </div>
    </div>
  );
}

export default function CreateUserPage() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { supabase, isSuperAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    user_id: "",
    display_name: "",
    timezone: "America/New_York",
    city_ids: [] as string[],
    roles: [] as string[],
  });
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [cityQuery, setCityQuery] = useState("");
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<UserProfile | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    const response = await fetch("/api/admin/get-users", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (response.ok) {
      const payload = await response.json();
      setUsers(
        (payload.users || []).map((user: any) => ({
          ...user,
          onboards: user.onboards ?? 0,
          requestsAssigned: user.requestsAssigned ?? 0,
        }))
      );
    } else {
      setUsers([]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!supabase) return;
    const loadCities = async () => {
      const { data } = await supabase.from("cities").select("id,name").order("name");
      if (data) setCities(data as { id: string; name: string }[]);
    };
    loadCities();
  }, [supabase]);

  const filteredCities = useMemo(() => {
    const q = cityQuery.toLowerCase();
    return cities.filter((city) => city.name.toLowerCase().includes(q));
  }, [cities, cityQuery]);

  const cityLookup = useMemo(() => {
    const map: Record<string, string> = {};
    cities.forEach((city) => {
      map[city.id] = city.name;
    });
    return map;
  }, [cities]);

  const handleCardClick = (user: UserProfile) => {
    setProfileForm({
      user_id: user.id,
      display_name: user.display_name ?? "",
      timezone: user.timezone ?? "America/New_York",
      city_ids: user.city_ids ?? [],
      roles: user.roles ?? [],
    });
    setCityQuery("");
    setProfileDialogOpen(true);
  };

  const handleArchiveStart = (user: UserProfile) => {
    setArchiveTarget(user);
    setArchiveReason("");
  };

  const handleDeleteStart = (user: UserProfile) => {
    setDeleteTarget(user);
    setDeleteReason("");
  };

  const toggleProfileRole = (role: (typeof AVAILABLE_ROLES)[number]) => {
    setProfileForm((prev) => {
      const nextRoles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return {
        ...prev,
        roles: nextRoles,
        city_ids: nextRoles.includes("ACCOUNT_MANAGER") ? prev.city_ids : [],
      };
    });
    if (role === "ACCOUNT_MANAGER") {
      setCityQuery("");
    }
  };

  const handleProfileSave = async () => {
    if (!supabase) return;
    if (profileForm.roles.includes("ACCOUNT_MANAGER") && profileForm.city_ids.length === 0) {
      toast({
        title: "City required",
        description: "Assign a city before saving an Account Manager.",
        variant: "destructive",
      });
      return;
    }
    setProfileSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setProfileSaving(false);
      return;
    }
    const response = await fetch("/api/admin/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id: profileForm.user_id,
        display_name: profileForm.display_name,
        timezone: profileForm.timezone,
        city_ids: profileForm.city_ids,
        roles: profileForm.roles,
      }),
    });
    const payload = await response.json().catch(() => null);
    setProfileSaving(false);
    if (!response.ok) {
      toast({
        title: "Error",
        description: payload?.error || "Failed to update profile.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Profile updated", variant: "success" });
    setProfileDialogOpen(false);
    setUsers((prev) =>
      prev.map((user) =>
        user.id === profileForm.user_id
          ? {
              ...user,
              display_name: profileForm.display_name,
              timezone: profileForm.timezone,
              city_ids: profileForm.city_ids,
              city_names: profileForm.city_ids.map((id) => cityLookup[id]).filter(Boolean),
              roles: profileForm.roles,
            }
          : user
      )
    );
  };

  const handleArchiveConfirm = async () => {
    if (!supabase || !archiveTarget) return;
    setArchiveLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setArchiveLoading(false);
      toast({
        title: "Session expired",
        description: "Sign in again to archive users.",
        variant: "warning",
      });
      return;
    }
    const response = await fetch("/api/admin/archive-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id: archiveTarget.id,
        reason: archiveReason || null,
      }),
    });
    const payload = await response.json().catch(() => null);
    setArchiveLoading(false);
    if (!response.ok) {
      toast({
        title: "Archive failed",
        description: payload?.error || "Unable to move the user to archive.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "User archived",
      description: `${archiveTarget.display_name || archiveTarget.email} was archived.`,
      variant: "success",
    });
    setArchiveTarget(null);
    setArchiveReason("");
    await loadUsers();
  };

  const handleDeleteConfirm = async () => {
    if (!supabase || !deleteTarget) return;
    setDeleteLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setDeleteLoading(false);
      toast({
        title: "Session expired",
        description: "Sign in again to delete users.",
        variant: "warning",
      });
      return;
    }
    const response = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id: deleteTarget.id,
        reason: deleteReason || null,
      }),
    });
    const payload = await response.json().catch(() => null);
    setDeleteLoading(false);
    if (!response.ok) {
      toast({
        title: "Delete failed",
        description: payload?.error || "Unable to remove this user.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "User deleted",
      description: `${deleteTarget.display_name || deleteTarget.email} was removed permanently.`,
      variant: "success",
    });
    setDeleteTarget(null);
    setDeleteReason("");
    await loadUsers();
  };

  if (authLoading || !supabase) {
    return <SplashScreen loading />;
  }

  if (!isSuperAdmin) {
    return (
      <ErrorSplashScreen
        message="Only super admins can access the Create User page."
        actionText="Return to Dashboard"
        onActionClick={() => router.push("/dashboard")}
      />
    );
  }

  if (authLoading || !supabase) {
    return <SplashScreen loading />;
  }

  if (!isSuperAdmin) {
    return (
      <ErrorSplashScreen
        message="Only super admins can access the Create User page."
        actionText="Return to Dashboard"
        onActionClick={() => router.push("/dashboard")}
      />
    );
  }

  return (
    <>
      <div className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]">
        Create User
      </div>
      <DashboardLayout
        title=""
        actionButton={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpen(true);
                      }}
                    >
                      <span className="text-lg leading-none">+</span>
                      <span className="sr-only">New User</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create new user</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-[12px] border border-white/30 bg-white/10 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              <DialogHeader>
                <DialogTitle className="text-center text-lg font-semibold tracking-[0.3em] uppercase text-white/90">
                  User Details
                </DialogTitle>
              </DialogHeader>
              <div className="px-4 sm:px-6">
                <CreateUserForm
                onCancel={() => setOpen(false)}
                onCreated={async () => {
                  setOpen(false);
                  await loadUsers();
                }}
                />
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="relative w-full h-full">
          <div className="relative z-10 flex flex-col gap-6 max-w-4xl mx-auto pt-6">
            <div className="dashboard-grid">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`user-skeleton-${index}`}
                    className="widget rounded-xl border border-white/10 bg-card/60 p-5 text-center shadow-lg space-y-3"
                  >
                    <div className="flex justify-end">
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <div className="flex justify-center">
                      <Skeleton className="h-16 w-16 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-2/3 mx-auto" />
                      <div className="flex justify-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-3/4 mx-auto" />
                      <div className="flex justify-center gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))
              ) : users.length ? (
                users.map((u) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    onClick={handleCardClick}
                    onArchive={handleArchiveStart}
                    onDelete={handleDeleteStart}
                  />
                ))
              ) : (
                <div className="widget rounded-2xl border border-dashed bg-card/60 p-6 text-center text-muted-foreground">
                  No users yet. Use the New User button above to create one.
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-[12px] border border-white/30 bg-white/10 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold tracking-[0.3em] uppercase text-white/90">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={profileForm.display_name}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, display_name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Roles</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ROLES.map((role) => {
                  const selected = profileForm.roles.includes(role);
                  return (
                    <Button
                      key={role}
                      type="button"
                      size="xs"
                      variant="ghost"
                      className={`px-2 py-1 text-xs ${
                        selected ? ROLE_CLASSES[role] : "border border-border text-muted-foreground"
                      }`}
                      onClick={() => toggleProfileRole(role)}
                    >
                      {ROLE_LABELS[role]}
                    </Button>
                  );
                })}
              </div>
            </div>
            {profileForm.roles.includes("ACCOUNT_MANAGER") && (
              <div className="space-y-1.5">
                <Label>Account Manager Cities</Label>
                <div className="relative">
                  <Popover open={cityPickerOpen} onOpenChange={setCityPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between text-sm"
                        onClick={() => setCityPickerOpen(true)}
                      >
                        {profileForm.city_ids.length
                          ? `${profileForm.city_ids.length} cities selected`
                          : "Search cities"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[320px] rounded-[12px] border border-border/70 bg-background p-2 shadow-xl"
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search cities..."
                          value={cityQuery}
                          onValueChange={(value) => setCityQuery(value)}
                          className="placeholder:text-muted-foreground"
                        />
                        {cityQuery ? (
                          <CommandList>
                            {!filteredCities.length && <CommandEmpty>No cities found.</CommandEmpty>}
                            <CommandGroup>
                              {filteredCities.map((city) => (
                                <CommandItem
                                  key={city.id}
                                  onSelect={() => {
                                    if (!profileForm.city_ids.includes(city.id)) {
                                      setProfileForm((prev) => ({
                                        ...prev,
                                        city_ids: [...prev.city_ids, city.id],
                                      }));
                                    }
                                    setCityQuery("");
                                    setCityPickerOpen(false);
                                  }}
                                >
                                  {city.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        ) : (
                          <p className="px-2 py-1 text-xs text-muted-foreground">
                            Start typing to search cities.
                          </p>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                {profileForm.city_ids.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profileForm.city_ids.map((cityId) => (
                      <span
                        key={cityId}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-xs font-semibold"
                      >
                        {cityLookup[cityId] ?? cityId}
                        <button
                          type="button"
                          onClick={() =>
                            setProfileForm((prev) => ({
                              ...prev,
                              city_ids: prev.city_ids.filter((entry) => entry !== cityId),
                            }))
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
      <div className="flex justify-end">
        <Button size="sm" onClick={handleProfileSave} disabled={profileSaving}>
          {profileSaving ? "Saving..." : "Save"}
        </Button>
      </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open && !archiveLoading) {
            setArchiveTarget(null);
            setArchiveReason("");
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md rounded-[12px] border border-white/30 bg-white/10 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg font-semibold tracking-[0.3em] uppercase text-white/90">
              Archive User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-muted-foreground">
              {archiveTarget
                ? `Move ${archiveTarget.display_name || archiveTarget.email} to the archive. You can restore them later.`
                : "Select a user to archive."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 text-sm">
            <Label htmlFor="archiveReason">Archive reason (optional)</Label>
            <Textarea
              id="archiveReason"
              placeholder="Add a context note that will be stored with the archive log."
              value={archiveReason}
              onChange={(event) => setArchiveReason(event.target.value)}
              disabled={archiveLoading}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={archiveLoading}
              onClick={() => {
                if (!archiveLoading) {
                  setArchiveTarget(null);
                  setArchiveReason("");
                }
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={archiveLoading}
              onClick={handleArchiveConfirm}
              className="bg-amber-600 text-white hover:bg-amber-500"
            >
              {archiveLoading ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) {
            setDeleteTarget(null);
            setDeleteReason("");
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md rounded-[12px] border border-white/30 bg-white/10 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg font-semibold tracking-[0.3em] uppercase text-white/90">
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-muted-foreground">
              {deleteTarget
                ? `Permanently remove ${deleteTarget.display_name || deleteTarget.email}. This cannot be undone.`
                : "Select a user to delete."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 text-sm">
            <Label htmlFor="deleteReason">Deletion note (optional)</Label>
            <Textarea
              id="deleteReason"
              placeholder="Explain why this account is being removed."
              value={deleteReason}
              onChange={(event) => setDeleteReason(event.target.value)}
              disabled={deleteLoading}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteLoading}
              onClick={() => {
                if (!deleteLoading) {
                  setDeleteTarget(null);
                  setDeleteReason("");
                }
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteLoading}
              onClick={handleDeleteConfirm}
              className="bg-rose-600 text-white hover:bg-rose-500"
            >
              {deleteLoading ? "Deleting..." : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
