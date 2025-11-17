
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  ChevronsUpDown,
  FilePlus,
  MapPin,
  PauseCircle,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/ui/splash-screen";


type Status = "new" | "on progress" | "done" | "on hold";
type RequestType = "RESTAURANT" | "EVENT" | "CUISINE";

type RequestRecord = {
  id: string;
  title: string;
  description: string | null;
  request_type: RequestType;
  requester_id: string;
  city_id: string;
  status: Status | null;
  priority: string | null;
  category: string | null;
  budget: number | null;
  deadline: string | null;
  created_at: string;
};

type EnrichedRequest = Omit<RequestRecord, "status"> & {
  status: Status;
  requesterName: string;
  cityLabel: string;
};

type CityOption = { id: string; label: string };
type RequesterOption = { id: string; label: string };

const statusConfig: Record<
  Status,
  {
    icon: typeof PlusCircle;
    badgeClass: string;
  }
> = {
  new: {
    icon: PlusCircle,
    badgeClass: "border-blue-500/50 text-blue-500",
  },
  "on progress": {
    icon: RefreshCw,
    badgeClass: "border-yellow-500/50 text-yellow-500",
  },
  done: {
    icon: CheckCircle,
    badgeClass: "border-green-500/50 text-green-500",
  },
  "on hold": {
    icon: PauseCircle,
    badgeClass: "border-gray-500/50 text-gray-500",
  },
};

const REQUEST_TYPES: { value: RequestType; label: string }[] = [
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "EVENT", label: "Event" },
  { value: "CUISINE", label: "Cuisine" },
];

const normalizeStatus = (value: string | null | undefined): Status => {
  if (value && value in statusConfig) {
    return value as Status;
  }
  return "new";
};

const formatDate = (value: string | null, detailed?: boolean) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(
    "en-US",
    detailed
      ? { year: "numeric", month: "long", day: "numeric" }
      : undefined
  );
};
const RequestCard = ({
  request,
  onClick,
}: {
  request: EnrichedRequest;
  onClick: () => void;
}) => {
  const { icon: StatusIcon, badgeClass } = statusConfig[request.status];

  return (
    <div className="widget flex flex-col">
      <Card
        className="flex flex-1 cursor-pointer flex-col hover:border-primary"
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-start justify-between p-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <div className="flex flex-col text-sm text-muted-foreground">
              <span className="font-medium">{request.requesterName}</span>
              <div className="flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                <span>{request.cityLabel}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>Req. Date: {formatDate(request.created_at)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3 text-destructive" />
                <span>Deadline: {formatDate(request.deadline)}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={cn("capitalize", badgeClass)}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {request.status}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-4 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {request.description ?? "No description provided."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const RequestDetailView = ({ request }: { request: EnrichedRequest }) => {
  const { badgeClass } = statusConfig[request.status];

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">{request.title}</CardTitle>
          <div className="flex flex-col text-sm text-muted-foreground">
            <span className="font-medium">{request.requesterName}</span>
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              <span>{request.cityLabel}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              <span>Req. Date: {formatDate(request.created_at, true)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3 text-destructive" />
              <span>Deadline: {formatDate(request.deadline, true)}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={cn("capitalize", badgeClass)}>
          {request.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4 pt-0 text-sm text-muted-foreground">
        <p>{request.description ?? "No description"}</p>
        <div className="mt-4 space-y-2">
          <p>
            <span className="font-medium text-foreground">Type:</span> {request.request_type}
          </p>
          {request.priority && (
            <p>
              <span className="font-medium text-foreground">Priority:</span> {request.priority}
            </p>
          )}
          {request.category && (
            <p>
              <span className="font-medium text-foreground">Category:</span> {request.category}
            </p>
          )}
          {typeof request.budget === "number" && (
            <p>
              <span className="font-medium text-foreground">Budget:</span> ${request.budget.toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const FilterPopover = ({
  triggerLabel,
  value,
  onValueChange,
  items,
  placeholder,
}: {
  triggerLabel: string;
  value: string;
  onValueChange: (value: string) => void;
  items: string[];
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const currentValue = value === "all" ? triggerLabel : value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto w-[150px] justify-between px-2 py-1 text-xs capitalize"
        >
          <span className="truncate">{currentValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        style={{ transform: "scale(0.85)", transformOrigin: "top center" }}
      >
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onValueChange("all");
                  setOpen(false);
                }}
              >
                All
              </CommandItem>
              {items.map((item) => (
                <CommandItem
                  key={item}
                  onSelect={() => {
                    onValueChange(item);
                    setOpen(false);
                  }}
                  className="capitalize"
                >
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
const CreateRequestForm = ({
  onCancel,
  onCreated,
  accountManagers,
  accountManagersLoading,
}: {
  onCancel: () => void;
  onCreated: () => void;
  accountManagers: RequesterOption[];
  accountManagersLoading: boolean;
}) => {
  const { supabase, user, roles, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [requestType, setRequestType] = useState<RequestType | "">("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [cityId, setCityId] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [requesterId, setRequesterId] = useState("");
  const [requesterQuery, setRequesterQuery] = useState("");
  const [requesterPickerOpen, setRequesterPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canChooseRequester = isSuperAdmin;
  const isAccountManager = roles.includes("ACCOUNT_MANAGER");

  useEffect(() => {
    const loadCities = async () => {
      if (!supabase) return;
      const targetUserId = canChooseRequester ? requesterId : user?.id;

      if (!targetUserId) {
        setCities([]);
        setCityId("");
        setLoadingCities(false);
        return;
      }

      setLoadingCities(true);
      try {
        if (canChooseRequester) {
          const { data, error } = await supabase
            .from("account_manager_cities")
            .select("city_id, cities!inner(id, name, state_code)")
            .eq("user_id", targetUserId);

          if (error) throw error;

          setCities(
            data?.map((row) => ({
              id: row.city_id,
              label: `${row.cities.name}, ${row.cities.state_code}`,
            })) ?? []
          );

          if (!data?.length) {
            setCityId("");
          }
        } else if (isAccountManager) {
          const { data, error } = await supabase
            .from("account_manager_cities")
            .select("city_id, cities!inner(id, name, state_code)")
            .eq("user_id", targetUserId);

          if (error) throw error;

          setCities(
            data?.map((row) => ({
              id: row.city_id,
              label: `${row.cities.name}, ${row.cities.state_code}`,
            })) ?? []
          );
        } else {
          const { data, error } = await supabase
            .from("cities")
            .select("id, name, state_code")
            .order("name");

          if (error) throw error;

          setCities(
            data?.map((city) => ({
              id: city.id,
              label: `${city.name}, ${city.state_code}`,
            })) ?? []
          );
        }
      } catch (error) {
        console.error("Error loading cities", error);
        toast({
          title: "Unable to load cities",
          description:
            error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive",
        });
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, [supabase, user?.id, canChooseRequester, requesterId, isAccountManager, toast]);

  useEffect(() => {
    if (!canChooseRequester && user?.id) {
      setRequesterId(user.id);
    }
  }, [canChooseRequester, user]);

  useEffect(() => {
    if (canChooseRequester) {
      setCityId("");
      setCityQuery("");
    }
  }, [requesterId, canChooseRequester]);

  useEffect(() => {
    if (canChooseRequester && !requestType) {
      setRequesterId("");
      setCityId("");
      setCityQuery("");
    }
  }, [requestType, canChooseRequester]);

  const filteredCities = useMemo(() => {
    const query = cityQuery.toLowerCase();
    return cities.filter((city) => city.label.toLowerCase().includes(query));
  }, [cities, cityQuery]);

  const filteredRequesters = useMemo(() => {
    const query = requesterQuery.toLowerCase();
    return accountManagers.filter((manager) =>
      manager.label.toLowerCase().includes(query)
    );
  }, [accountManagers, requesterQuery]);

  const hasRequesterQuery = requesterQuery.trim().length > 0;

  const selectedCity = cities.find((city) => city.id === cityId);
  const selectedRequester = accountManagers.find((manager) => manager.id === requesterId);
  const hasSelectedType = Boolean(requestType);
  const showRequesterField = !canChooseRequester || hasSelectedType;
  const showCityField =
    !canChooseRequester || (canChooseRequester && requesterId && hasSelectedType);

  useEffect(() => {
    if (!showRequesterField && canChooseRequester) {
      setRequesterPickerOpen(false);
    }
  }, [showRequesterField, canChooseRequester]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || !user) {
      toast({
        title: "You must be signed in",
        description: "Sign in again and retry.",
        variant: "destructive",
      });
      return;
    }

    if (!cityId) {
      toast({
        title: "City required",
        description: "Select one of your assigned cities.",
        variant: "destructive",
      });
      return;
    }

    if (!requestType) {
      toast({
        title: "Request type required",
        description: "Select the appropriate request type.",
        variant: "destructive",
      });
      return;
    }

    const effectiveRequesterId = canChooseRequester ? requesterId : user.id;
    if (!effectiveRequesterId) {
      toast({
        title: "Requester missing",
        description: "Select an Account Manager for this request.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        request_type: requestType as RequestType,
        city_id: cityId,
        requester_id: effectiveRequesterId,
        created_by: user.id,
        priority: priority || null,
        category: category || null,
        budget: budget ? Number(budget) : null,
        deadline: deadline || null,
      };

      const { error } = await supabase.from("requests").insert(payload);
      if (error) throw error;

      toast({
        title: "Request created",
        description: "Your request has been added to the queue.",
      });
      setTitle("");
      setDescription("");
      setPriority("");
      setCategory("");
      setBudget("");
      setDeadline("");
      setCityId("");
      setCityQuery("");
      setRequestType("");
      if (canChooseRequester) {
        setRequesterId("");
      }
      onCreated();
    } catch (error) {
      console.error("Error creating request", error);
      toast({
        title: "Failed to create request",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <DialogHeader>
        <DialogTitle>New Request</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Capture the essentials so the team can route and prioritize this request without
          follow-up. Required fields are marked and optional fields help us act faster.
        </p>
      </DialogHeader>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Step 1
                  </p>
                  <h3 className="text-base font-semibold">Request basics</h3>
                  <p className="text-sm text-muted-foreground">
                    Start with a clear title and type so we can route the work to the right team.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  Required
                </Badge>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Give this request a clear title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Aim for a short, action-focused phrase (e.g., "Add Miami launch partners").
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestType">Request Type</Label>
                  <Select
                    value={requestType}
                    onValueChange={(value: RequestType) => setRequestType(value)}
                  >
                    <SelectTrigger id="requestType">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUEST_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {canChooseRequester && !hasSelectedType && (
                    <p className="text-xs text-destructive/80">
                      Choose a request type to continue.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Step 2
                  </p>
                  <h3 className="text-base font-semibold">People & timeline</h3>
                  <p className="text-sm text-muted-foreground">
                    Link the request to an owner and when it needs to be done.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  Priority helper
                </Badge>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label>Requested By</Label>
                  {canChooseRequester ? (
                    showRequesterField ? (
                      <Popover
                        open={requesterPickerOpen}
                        onOpenChange={setRequesterPickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            role="combobox"
                            disabled={accountManagersLoading}
                          >
                            <span className="truncate">
                              {selectedRequester
                                ? selectedRequester.label
                                : "Search Account Managers"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder={
                                accountManagersLoading
                                  ? "Loading Account Managers..."
                                  : "Search Account Managers..."
                              }
                              value={requesterQuery}
                              onValueChange={(value) => setRequesterQuery(value)}
                              disabled={accountManagersLoading}
                            />
                            <CommandList>
                              {accountManagersLoading ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  Loading...
                                </div>
                              ) : hasRequesterQuery ? (
                                filteredRequesters.length ? (
                                  <CommandGroup>
                                    {filteredRequesters.map((option) => (
                                      <CommandItem
                                        key={option.id}
                                        onSelect={() => {
                                          setRequesterId(option.id);
                                          setRequesterQuery("");
                                          setRequesterPickerOpen(false);
                                        }}
                                      >
                                        {option.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                ) : (
                                  <div className="px-3 py-2 text-sm text-muted-foreground">
                                    No Account Managers found.
                                  </div>
                                )
                              ) : (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  Start typing to search Account Managers.
                                </div>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="rounded-md border border-dashed border-border/70 px-3 py-2 text-sm text-muted-foreground">
                        Select a request type before choosing who requested this.
                      </div>
                    )
                  ) : (
                    <Input
                      value={
                        selectedRequester?.label || user?.email || "Your account"
                      }
                      readOnly
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    This person will see updates and influence available cities.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If there is no hard date, leave blank or set an expected week.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Step 3
                  </p>
                  <h3 className="text-base font-semibold">Location & context</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us where this should happen and add any helpful background.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  Smart filters
                </Badge>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label>City</Label>
                  {showCityField ? (
                    <>
                      <div className="rounded-lg border border-border/70 bg-background">
                        <Command>
                          <CommandInput
                            placeholder={
                              loadingCities
                                ? "Loading cities..."
                                : "Start typing to search"
                            }
                            value={cityQuery}
                            onValueChange={(value) => setCityQuery(value)}
                            disabled={loadingCities}
                          />
                          <CommandList>
                            {!loadingCities && cityQuery && filteredCities.length > 0 && (
                              <CommandGroup>
                                {filteredCities.map((city) => (
                                  <CommandItem
                                    key={city.id}
                                    onSelect={() => {
                                      setCityId(city.id);
                                      setCityQuery("");
                                    }}
                                  >
                                    {city.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedCity
                          ? `Selected: ${selectedCity.label}`
                          : "Select one of your assigned cities."}
                      </p>
                    </>
                  ) : (
                    <div className="rounded-md border border-dashed border-border/70 px-3 py-2 text-sm text-muted-foreground">
                      Choose who requested this to load their assigned cities.
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Details</Label>
                  <Textarea
                    id="description"
                    placeholder="Share the context, requirements, or helpful links..."
                    className="min-h-[120px]"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Outline goals, constraints, and any partners or venues already in mind.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Step 4
                  </p>
                  <h3 className="text-base font-semibold">Optional helpers</h3>
                  <p className="text-sm text-muted-foreground">
                    Add prioritization cues now to avoid back-and-forth later.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  Nice to have
                </Badge>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    placeholder="e.g., High, Medium"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="Optional grouping"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional budget amount"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick tips</CardTitle>
                <CardDescription>
                  Keep the essentials handy while you fill out the form.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  Save before leaving the dialog to avoid losing progress.
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  If you cannot find a city, confirm the requester assignment first.
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                  Deadlines help us prioritize; budget unlocks faster approvals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Live snapshot</CardTitle>
                <CardDescription className="text-sm">
                  A quick review of what will be submitted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium text-right">{title || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize text-right">
                    {requestType.toLowerCase() || "Not selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Requested by</span>
                  <span className="font-medium text-right">
                    {selectedRequester?.label || user?.email || "Not selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">City</span>
                  <span className="font-medium text-right">
                    {selectedCity?.label || "Not selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium text-right">
                    {deadline || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <span className="font-medium text-right">{priority || "Not set"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t p-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            submitting ||
            !title ||
            !cityId ||
            !requestType ||
            (canChooseRequester && !requesterId)
          }
        >
          {submitting ? "Creating..." : "Create Request"}
        </Button>
      </div>
    </form>
  );
};
export default function RequestPage() {
  const { supabase, isSuperAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [isDetailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EnrichedRequest | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [requests, setRequests] = useState<EnrichedRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    city: "all",
    requester: "all",
  });
  const [managerDirectory, setManagerDirectory] = useState<RequesterOption[]>([]);
  const [managerDirectoryLoading, setManagerDirectoryLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const { data, error } = await supabase
        .from("requests")
        .select(
          "id, title, description, request_type, requester_id, city_id, status, priority, category, budget, deadline, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const records = (data ?? []) as RequestRecord[];
      if (!records.length) {
        setRequests([]);
        return;
      }

      const cityIds = Array.from(new Set(records.map((record) => record.city_id)));
      const requesterIds = Array.from(new Set(records.map((record) => record.requester_id)));

      const cityLookup: Record<string, string> = {};
      if (cityIds.length) {
        const { data: cityRows, error: cityError } = await supabase
          .from("cities")
          .select("id, name, state_code")
          .in("id", cityIds);
        if (cityError) throw cityError;
        cityRows?.forEach((city) => {
          cityLookup[city.id] = `${city.name}, ${city.state_code}`;
        });
      }

      const requesterLookup: Record<string, string> = {};
      if (requesterIds.length) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", requesterIds);
        if (profileError) throw profileError;
        profileRows?.forEach((profile) => {
          requesterLookup[profile.user_id] = profile.display_name ?? "Account Manager";
        });
      }

      const enriched: EnrichedRequest[] = records.map((record) => ({
        ...record,
        status: normalizeStatus(record.status),
        cityLabel: cityLookup[record.city_id] ?? "Unassigned city",
        requesterName: requesterLookup[record.requester_id] ?? "Account Manager",
      }));

      setRequests(enriched);
    } catch (error) {
      console.error("Error loading requests", error);
      toast({
        title: "Unable to load requests",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const loadManagers = useCallback(async () => {
    if (!isSuperAdmin) {
      setManagerDirectory([]);
      return;
    }

    setManagerDirectoryLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Unable to verify session for manager lookup.");
      }

      const response = await fetch("/api/admin/account-managers", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? response.statusText);
      }

      const payload = await response.json();
      setManagerDirectory(payload.managers ?? []);
    } catch (error) {
      console.error("Error loading Account Managers", error);
      toast({
        title: "Unable to load Account Managers",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      setManagerDirectory([]);
    } finally {
      setManagerDirectoryLoading(false);
    }
  }, [isSuperAdmin, supabase, toast]);

  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const statusMatch =
        filters.status === "all" || request.status === filters.status;
      const cityMatch =
        filters.city === "all" || request.cityLabel === filters.city;
      const requesterMatch =
        filters.requester === "all" || request.requesterName === filters.requester;
      return statusMatch && cityMatch && requesterMatch;
    });
  }, [requests, filters]);

  const uniqueStatuses = useMemo(() => Object.keys(statusConfig), []);
  const uniqueCities = useMemo(
    () => Array.from(new Set(requests.map((req) => req.cityLabel))).filter(Boolean),
    [requests]
  );
  const uniqueRequesters = useMemo(
    () => Array.from(new Set(requests.map((req) => req.requesterName))).filter(Boolean),
    [requests]
  );

  const handleRequestClick = (request: EnrichedRequest) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRequestCreated = () => {
    setCreateDialogOpen(false);
    loadRequests();
  };

  if (loading) {
    return <SplashScreen loading />;
  }

  return (
    <DashboardLayout
      title="Requests"
      actionButton={
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <TooltipProvider>
            <Tooltip>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl border-transparent hover:border-primary"
                >
                  <FilePlus className="h-4 w-4" />
                  <span className="sr-only">New Request</span>
                </Button>
              </DialogTrigger>
              <TooltipContent>
                <p>New Request</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="scale-80">
            <CreateRequestForm
              onCancel={() => setCreateDialogOpen(false)}
              onCreated={handleRequestCreated}
              accountManagers={managerDirectory}
              accountManagersLoading={managerDirectoryLoading}
            />
          </DialogContent>
        </Dialog>
      }
    >
      <div
        style={{ transform: "scale(0.8)", transformOrigin: "top center" }}
        className="relative h-full w-full"
      >
        <div className="absolute left-1/2 top-0 z-10 w-full max-w-5xl -translate-x-1/2 px-4">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex gap-2 rounded-full p-2 backdrop-blur-sm">
              <FilterPopover
                triggerLabel="Status"
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
                items={uniqueStatuses}
                placeholder="Filter status..."
              />
              <FilterPopover
                triggerLabel="City"
                value={filters.city}
                onValueChange={(value) => handleFilterChange("city", value)}
                items={uniqueCities}
                placeholder="Filter city..."
              />
              <FilterPopover
                triggerLabel="Requester"
                value={filters.requester}
                onValueChange={(value) => handleFilterChange("requester", value)}
                items={uniqueRequesters}
                placeholder="Filter requester..."
              />
            </div>
          </div>
        </div>
        <div className="dashboard-grid mx-auto h-full max-w-5xl overflow-y-auto pt-20">
          {isSuperAdmin && (
            <div className="widget">
              <Card className="flex h-full flex-col">
                <CardHeader>
                  <CardTitle className="text-base">Account Managers</CardTitle>
                  <CardDescription>
                    {managerDirectoryLoading
                      ? "Loading directory..."
                      : `${managerDirectory.length} total`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto pt-0">
                  {managerDirectoryLoading ? (
                    <div className="py-4 text-sm text-muted-foreground">
                      Fetching Account Managers...
                    </div>
                  ) : managerDirectory.length ? (
                    <ul className="space-y-2 text-sm">
                      {managerDirectory.map((manager) => (
                        <li
                          key={manager.id}
                          className="rounded-md border border-border/60 px-3 py-2"
                        >
                          {manager.label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-4 text-sm text-muted-foreground">
                      No Account Managers found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {requestsLoading && (
            <div className="widget">
              <Card className="p-4 text-center text-sm text-muted-foreground">
                Loading requests...
              </Card>
            </div>
          )}
          {!requestsLoading && !filteredRequests.length && (
            <div className="widget">
              <Card className="p-4 text-center text-sm text-muted-foreground">
                {requests.length === 0
                  ? "No requests have been submitted yet."
                  : "No requests match your filters."}
              </Card>
            </div>
          )}
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onClick={() => handleRequestClick(request)}
            />
          ))}
        </div>
      </div>
      <Dialog open={isDetailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl scale-80">
          <DialogTitle className="sr-only">Request Details</DialogTitle>
          {selectedRequest && <RequestDetailView request={selectedRequest} />}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

