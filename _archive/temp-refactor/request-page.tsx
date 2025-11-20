"use client";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  FormEvent,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CalendarDays,
  Check,
  CheckCircle,
  Eye,
  FilePlus,
  Flame,
  MapPin,
  PauseCircle,
  Pencil,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  UtensilsCrossed,
  ChevronsUpDown,
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
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/ui/splash-screen";
import { Skeleton } from "@/components/ui/skeleton";
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
  volume: number | null;
  need_answer_by: string | null;
  delivery_date: string | null;
  company: string | null;
  created_at: string;
};
type EnrichedRequest = Omit<RequestRecord, "status"> & {
  status: Status;
  requesterName: string;
  cityLabel: string;
};
type CityOption = { id: string; label: string };
type RequesterOption = { id: string; label: string };
type BdrOption = { id: string; label: string };
type RequestBdrAssignment = { user_id: string; display_name: string | null };
type RequestFilters = {
  status: Status | "all";
  city: string;
  requester: string;
};
type EditFormState = {
  title: string;
  description: string;
  status: Status;
  requestType: RequestType;
  needAnswerBy: string;
  deliveryDate: string;
  priority: string;
  category: string;
  volume: string;
  company: string;
};


const COLUMN_PREVIEW = true;
const LIST_VIEW = false;

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
const REQUEST_TYPE_ICONS: Record<RequestType, typeof MapPin> = {
  RESTAURANT: UtensilsCrossed,
  EVENT: CalendarDays,
  CUISINE: Flame,
};

const kanbanThemes: Record<
  Status,
  { accent: string; container: string; card: string }
> = {
  new: {
    accent: "text-sky-200",
    container: "bg-gradient-to-b from-sky-500/30 via-sky-500/10 to-transparent border-sky-400/40",
    card: "border-sky-300/40",
  },
  "on progress": {
    accent: "text-amber-200",
    container: "bg-gradient-to-b from-amber-500/30 via-amber-500/10 to-transparent border-amber-400/40",
    card: "border-amber-300/40",
  },
  "on hold": {
    accent: "text-slate-200",
    container: "bg-gradient-to-b from-slate-500/30 via-slate-500/10 to-transparent border-slate-400/40",
    card: "border-slate-300/40",
  },
  done: {
    accent: "text-emerald-200",
    container: "bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent border-emerald-400/40",
    card: "border-emerald-300/40",
  },
};
const REQUEST_BORDER_CLASSES: Record<Status, string> = {
  new: "border-sky-400/40 hover:border-sky-300/80",
  "on progress": "border-amber-400/40 hover:border-amber-300/80",
  "on hold": "border-slate-400/40 hover:border-slate-300/80",
  done: "border-emerald-400/40 hover:border-emerald-300/80",
};

type KanbanGroup = {
  column: { key: Status; label: string };
  items: EnrichedRequest[];
};

const RequestKanban = ({
  groups,
  onView,
  onEdit,
  canEdit,
  enableDrag = false,
  draggingRequestId,
  activeDropStatus,
  onDropStatus,
  onDragStart,
  onDragEnd,
  onDragOverStatusChange,
  movingRequestId,
  activeDropCardId,
  assignmentLookup,
  showAssignAction = false,
  onAssignBdr,
}: {
  groups: KanbanGroup[];
  onView: (request: EnrichedRequest) => void;
  onEdit: (request: EnrichedRequest) => void;
  canEdit: (request: EnrichedRequest) => boolean;
  enableDrag?: boolean;
  draggingRequestId?: string | null;
  activeDropStatus?: Status | null;
  onDropStatus?: (status: Status, beforeCardId?: string | null) => void;
  onDragStart?: (requestId: string) => void;
  onDragEnd?: () => void;
  onDragOverStatusChange?: (status: Status | null, cardId?: string | null) => void;
  movingRequestId?: string | null;
  activeDropCardId?: string | null;
  assignmentLookup?: Record<string, RequestBdrAssignment[]>;
  showAssignAction?: boolean;
  onAssignBdr?: (request: EnrichedRequest) => void;
}) => (
  <div className="mx-auto grid w-full max-w-[24rem] gap-2 justify-center">
    {groups.map(({ column, items }) => {
      const theme = kanbanThemes[column.key];
      return (
        <div
          key={`summary-${column.key}`}
          className={cn(
            "space-y-3 rounded-2xl border border-white/10 p-3 backdrop-blur-sm transition",
            theme.container,
            activeDropStatus === column.key && enableDrag
              ? "border-primary/40 bg-white/10 shadow-lg"
              : ""
          )}
          onDragOver={(event) => {
            if (!enableDrag || !draggingRequestId) return;
            event.preventDefault();
          }}
          onDrop={(event) => {
            if (!enableDrag || !onDropStatus) return;
            event.preventDefault();
            onDragOverStatusChange?.(null, null);
            onDropStatus(column.key, null);
          }}
          onDragEnter={(event) => {
            if (!enableDrag || !draggingRequestId) return;
            event.preventDefault();
            onDragOverStatusChange?.(column.key, null);
          }}
          onDragLeave={(event) => {
            if (!enableDrag || !draggingRequestId) return;
            event.preventDefault();
            onDragOverStatusChange?.(null, null);
          }}
        >
          <div className="flex items-center justify-between px-1">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.3em]",
                theme.accent
              )}
            >
              {column.label}
            </p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/80">
              {items.length}
            </span>
          </div>
          {items.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-xs text-white/60">
              No requests
            </div>
          )}
          <div className="space-y-[3px]">
            {items.slice(0, 4).map((request) => {
              const assignedBdrs = assignmentLookup?.[request.id] ?? [];
              return (
                <div
                  key={`kanban-${column.key}-${request.id}`}
                  className={cn(
                    "flex justify-center relative",
                    activeDropCardId === request.id
                      ? "before:absolute before:-top-2 before:left-0 before:right-0 before:h-1 before:rounded-full before:bg-primary/70 before:content-['']"
                      : ""
                  )}
                  draggable={enableDrag}
                  onDragStart={(event) => {
                    if (!enableDrag || !onDragStart) return;
                    event.stopPropagation();
                    onDragStart(request.id);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", request.id);
                  }}
                  onDragEnd={(event) => {
                    if (!enableDrag || !onDragEnd) return;
                    event.preventDefault();
                    onDragEnd();
                  }}
                  onDragOver={(event) => {
                    if (!enableDrag || !draggingRequestId) return;
                    event.preventDefault();
                    onDragOverStatusChange?.(column.key, request.id);
                  }}
                  onDrop={(event) => {
                    if (!enableDrag || !onDropStatus) return;
                    event.preventDefault();
                    onDragOverStatusChange?.(null, null);
                    onDropStatus(column.key, request.id);
                  }}
                >
                  <div className="w-full max-w-md">
                    <RequestCard
                      request={request}
                      onView={() => onView(request)}
                      onEdit={() => onEdit(request)}
                      canEdit={canEdit(request)}
                      isPendingMove={
                        movingRequestId === request.id ||
                        draggingRequestId === request.id
                      }
                      assignedBdrs={assignedBdrs}
                      showAssignAction={showAssignAction}
                      onAssignBdr={() => onAssignBdr?.(request)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);
const KANBAN_COLUMNS: { key: Status; label: string }[] = [
  { key: "new", label: "New" },
  { key: "on progress", label: "On Progress" },
  { key: "on hold", label: "On Hold" },
  { key: "done", label: "Done" },
];
const kanbanColors: Record<Status, string> = {
  new: "bg-blue-500/20",
  "on progress": "bg-amber-500/20",
  "on hold": "bg-gray-500/20",
  done: "bg-emerald-500/20",
};
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
const ageLabel = (value: string | null) => {
  if (!value) return "—";
  const created = new Date(value).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - created);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays >= 1) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} old`;
  }
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  return `${diffHours} hour${diffHours === 1 ? "" : "s"} old`;
};
const RequestCard = ({
  request,
  onView,
  onEdit,
  canEdit,
  isPendingMove = false,
  assignedBdrs = [],
  showAssignAction = false,
  onAssignBdr,
}: {
  request: EnrichedRequest;
  onView: () => void;
  onEdit: () => void;
  canEdit: boolean;
  isPendingMove?: boolean;
  assignedBdrs?: RequestBdrAssignment[];
  showAssignAction?: boolean;
  onAssignBdr?: () => void;
}) => {
  const { icon: StatusIcon, badgeClass } = statusConfig[request.status];
  const TypeIcon = REQUEST_TYPE_ICONS[request.request_type] ?? FilePlus;
  return (
    <div className="relative">
      <div
        className={cn(
          "widget flex flex-col rounded-xl border bg-card p-5 shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          REQUEST_BORDER_CLASSES[request.status],
          isPendingMove ? "opacity-60" : ""
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-primary/80">
              <TypeIcon className="h-4 w-4" />
            </div>
            <p className="text-xl font-semibold text-foreground">
              {request.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]",
                badgeClass
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {request.status}
            </span>
            {canEdit && showAssignAction ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full border border-white/30 bg-white/5 text-muted-foreground hover:text-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit or assign</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onEdit();
                    }}
                  >
                    Edit Request
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onAssignBdr?.();
                    }}
                  >
                    Assign BDR
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : canEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full border border-white/30 bg-white/5 text-muted-foreground hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit request</span>
              </Button>
            ) : null}
          </div>
        </div>
        <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
          <span className="italic font-semibold text-foreground">
            {request.description ?? "No description provided."}
          </span>
        </p>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {request.company && (
            <p className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {request.company}
            </p>
          )}
          {request.delivery_date && (
            <p className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Delivery {formatDate(request.delivery_date)}
            </p>
          )}
          {request.need_answer_by && (
            <p className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Need answer by {formatDate(request.need_answer_by)}
            </p>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{request.cityLabel}</span>
          <span>{ageLabel(request.created_at)}</span>
        </div>
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">BDR</p>
          {assignedBdrs.length ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {assignedBdrs.map((assignment) => (
                <span
                  key={`${request.id}-${assignment.user_id}`}
                  className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-white/80"
                >
                  {assignment.display_name ?? "BDR"}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">No BDR assigned</p>
          )}
        </div>
      </div>
      {isPendingMove && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
    </div>
  );
};
const RequestListRow = ({
  request,
  onView,
  onEdit,
  canEdit,
}: {
  request: EnrichedRequest;
  onView: () => void;
  onEdit: () => void;
  canEdit: boolean;
}) => {
  const TypeIcon = REQUEST_TYPE_ICONS[request.request_type] ?? FilePlus;
  return (
    <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,auto] items-center gap-3 border-b border-white/10 px-4 py-3 text-sm text-muted-foreground last:border-0">
      <div className="flex items-center gap-2 truncate text-foreground">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-primary/80">
          <TypeIcon className="h-4 w-4" />
        </div>
        <div className="flex flex-col truncate">
          <span className="font-semibold">{request.title}</span>
          <span className="text-xs text-muted-foreground">
            {request.company ?? "—"}
          </span>
        </div>
      </div>
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {request.request_type}
      </span>
      <span className={cn("text-xs font-semibold uppercase tracking-[0.2em]", statusConfig[request.status].badgeClass)}>
        {request.status}
      </span>
      <span className="truncate">{request.cityLabel}</span>
      <span>{ageLabel(request.created_at)}</span>
      <span>
        {request.delivery_date ? formatDate(request.delivery_date) : "—"}
      </span>
      <div className="flex items-center gap-2">
        <span className="truncate text-xs text-muted-foreground">
          {request.requesterName}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 text-muted-foreground"
          onClick={onView}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Button>
        {canEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 text-muted-foreground"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </div>
    </div>
  );
};
const RequestListSkeleton = () => (
  <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,auto] items-center gap-3 border-b border-white/10 px-4 py-3 text-sm text-muted-foreground last:border-0">
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </div>
    <Skeleton className="h-3 w-16 rounded" />
    <Skeleton className="h-5 w-20 rounded-full" />
    <Skeleton className="h-3 w-24 rounded" />
    <Skeleton className="h-3 w-20 rounded" />
    <Skeleton className="h-3 w-24 rounded" />
    <div className="flex items-center gap-2">
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-7 w-7 rounded-full" />
      <Skeleton className="h-7 w-7 rounded-full" />
    </div>
  </div>
);
const RequestCardSkeleton = () => (
  <div className="widget flex flex-col rounded-xl border border-white/15 bg-card p-5 shadow-lg space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-40 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
    <Skeleton className="h-12 w-full rounded" />
    <div className="space-y-2 text-xs">
      <Skeleton className="h-3 w-48 rounded" />
      <Skeleton className="h-3 w-40 rounded" />
      <Skeleton className="h-3 w-32 rounded" />
      <Skeleton className="h-3 w-36 rounded" />
    </div>
  </div>
);
const RequestDetailView = ({ request }: { request: EnrichedRequest }) => {
  const { badgeClass } = statusConfig[request.status];
  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">{request.title}</CardTitle>
          <div className="flex flex-col text-sm text-muted-foreground">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
              Requested By
            </span>
            <span className="font-semibold text-foreground">
              {request.requesterName}
            </span>
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              <span>{request.cityLabel}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              <span>Req. Date: {formatDate(request.created_at, true)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3 text-emerald-500" />
              <span>Need Answer: {formatDate(request.need_answer_by, true)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3 text-destructive" />
              <span>Delivery: {formatDate(request.delivery_date, true)}</span>
            </div>
          </div>
        </div>
        <span className={cn("text-xs font-semibold uppercase tracking-[0.2em]", badgeClass)}>
          {request.status}
        </span>
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
          {typeof request.volume === "number" && (
            <p>
              <span className="font-medium text-foreground">Volume:</span> {request.volume.toLocaleString()}
            </p>
          )}
          {request.company && (
            <p>
              <span className="font-medium text-foreground">Company:</span> {request.company}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
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
  const { supabase, user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [requestType, setRequestType] = useState<RequestType | "">("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [volume, setVolume] = useState("");
  const [company, setCompany] = useState("");
  const [needAnswerBy, setNeedAnswerBy] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [cityId, setCityId] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [requesterId, setRequesterId] = useState("");
  const [requesterSearch, setRequesterSearch] = useState("");
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [justAdvanced, setJustAdvanced] = useState(false);
  const canChooseRequester = isSuperAdmin;
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
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();
          if (sessionError || !session) {
            throw new Error("Unable to verify session for city lookup.");
          }
          const response = await fetch(
            `/api/admin/account-manager-cities?userId=${targetUserId}`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
            cities?: CityOption[];
          };
          if (!response.ok) {
            throw new Error(payload.error ?? response.statusText);
          }
          const cityOptions = payload.cities ?? [];
          setCities(cityOptions);
          if (!cityOptions.length) {
            setCityId("");
          }
        } else {
          const { data, error } = await supabase
            .from("account_manager_cities")
            .select("city_id, cities!inner(id, name, state_code)")
            .eq("user_id", targetUserId);
          if (error) throw error;
          const cityOptions =
            data?.map((row) => ({
              id: row.city_id,
              label: `${row.cities.name}, ${row.cities.state_code}`,
            })) ?? [];
          setCities(cityOptions);
          if (!cityOptions.length) {
            setCityId("");
          }
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
  }, [supabase, user?.id, canChooseRequester, requesterId, toast]);
  useEffect(() => {
    if (!canChooseRequester && user?.id) {
      setRequesterId(user.id);
    }
  }, [canChooseRequester, user]);
  useEffect(() => {
    if (canChooseRequester) {
      setCityId("");
      setCityQuery("");
      setCityPickerOpen(false);
      setRequesterSearch("");
    }
  }, [requesterId, canChooseRequester]);
  useEffect(() => {
    if (canChooseRequester && !requestType) {
      setRequesterId("");
      setCityId("");
      setCityQuery("");
      setCityPickerOpen(false);
    }
  }, [requestType, canChooseRequester]);
  const filteredCities = useMemo(() => {
    const query = cityQuery.toLowerCase();
    return cities.filter((city) => city.label.toLowerCase().includes(query));
  }, [cities, cityQuery]);
  const filteredRequesters = useMemo(() => {
    const term = requesterSearch.toLowerCase().trim();
    if (!term) return accountManagers;
    return accountManagers.filter((manager) =>
      manager.label.toLowerCase().includes(term)
    );
  }, [accountManagers, requesterSearch]);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const steps = useMemo(() => {
    if (canChooseRequester) {
      return [
        { id: "type", label: "Request Type" },
        { id: "details", label: "Details & Dates" },
        { id: "review", label: "Review & Assign" },
      ];
    }
    return [
      { id: "basics", label: "Basics" },
      { id: "city", label: "City" },
      { id: "summary", label: "Summary" },
    ];
  }, [canChooseRequester]);
  const selectedCity = cities.find((city) => city.id === cityId);
  const selectedRequester = accountManagers.find((manager) => manager.id === requesterId);
  const hasSelectedType = Boolean(requestType);
  const currentStepId = steps[currentStep]?.id ?? "basics";
  const isLastStep = currentStep === steps.length - 1;
  const isStepValid = useCallback(
    (stepId: string) => {
      if (canChooseRequester) {
        switch (stepId) {
          case "type":
            return Boolean(requestType && title);
          case "details":
            return true;
          case "review":
            return Boolean(cityId && requesterId);
          default:
            return true;
        }
      }
      switch (stepId) {
        case "basics":
          return Boolean(title && requestType);
        case "city":
          return Boolean(cityId);
        case "summary":
          return true;
        default:
          return true;
      }
    },
    [title, requestType, canChooseRequester, requesterId, cityId]
  );
  const currentStepValid = isStepValid(currentStepId);
  const formReady = Boolean(
    title &&
    cityId &&
    requestType &&
    (!canChooseRequester || requesterId)
  );
  useEffect(() => {
    if (currentStep > steps.length - 1) {
      setCurrentStep(steps.length - 1);
    }
  }, [steps.length, currentStep]);
  useEffect(() => {
    if (canChooseRequester && !hasSelectedType) {
      setRequesterSearch("");
      setRequesterId("");
    }
  }, [canChooseRequester, hasSelectedType]);
  useEffect(() => {
    if (!justAdvanced) return;
    const timer = setTimeout(() => setJustAdvanced(false), 300);
    return () => clearTimeout(timer);
  }, [justAdvanced]);
  const handleNextStep = () => {
    if (isLastStep || !currentStepValid) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    setJustAdvanced(true);
  };
  const handlePreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
    setJustAdvanced(false);
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLastStep) {
      handleNextStep();
      return;
    }
    if (justAdvanced) {
      return;
    }
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
        volume: volume ? Number(volume) : null,
        company: company || null,
        need_answer_by: needAnswerBy || null,
        delivery_date: deliveryDate || null,
      };
      const requiresAdminInsert =
        isSuperAdmin && effectiveRequesterId !== user.id;
      if (requiresAdminInsert) {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error("Unable to verify session for request creation.");
        }
        const response = await fetch("/api/admin/create-request", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? response.statusText);
        }
      } else {
        const { error } = await supabase.from("requests").insert(payload);
        if (error) {
          console.error("Supabase insert error", error);
          if (error.code === "23503") {
            throw new Error(
              "The selected city is not assigned to that requester. Choose a valid city."
            );
          }
          throw new Error(error.message);
        }
      }
      toast({
        title: "Request created",
        description: "Your request has been added to the queue.",
      });
      setTitle("");
      setDescription("");
      setPriority("");
      setCategory("");
      setVolume("");
      setCompany("");
      setNeedAnswerBy("");
      setDeliveryDate("");
      setCityId("");
      setCityQuery("");
      setRequestType("");
      if (canChooseRequester) {
        setRequesterId("");
      }
      setCurrentStep(0);
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
  const SummaryCard = () => (
    <div className="space-y-2">
      <Label>Summary</Label>
      <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Type</span>
          <span className="font-medium">{requestType || "Not set"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Company</span>
          <span className="font-medium">{company || "Not set"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">City</span>
          <span className="font-medium">{selectedCity?.label ?? "Not set"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Volume</span>
          <span className="font-medium">{volume || "Not set"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Need Answer By</span>
          <span className="font-medium">{needAnswerBy || "Not set"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Delivery Date</span>
          <span className="font-medium">
            {deliveryDate || "No delivery date"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Request By</span>
          <span className="font-medium">
            {canChooseRequester
              ? selectedRequester?.label ?? "Not set"
              : selectedRequester?.label || user?.email || "Your account"}
          </span>
        </div>
      </div>
    </div>
  );

  const RequesterSelector = () => (
    <div className="space-y-2">
      <Label>Requested By</Label>
      {!hasSelectedType ? (
        <p className="text-xs text-muted-foreground">
          Choose a request type first to pick an Account Manager.
        </p>
      ) : (
        <Command className="rounded-[12px] border border-white/15 bg-background/60">
          <CommandInput
            placeholder={
              accountManagersLoading
                ? "Loading Account Managers..."
                : "Search Account Managers..."
            }
            value={requesterSearch}
            onValueChange={setRequesterSearch}
            disabled={accountManagersLoading}
            className="placeholder:text-muted-foreground"
          />
          <CommandList>
            {accountManagersLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>No Account Managers found.</CommandEmpty>
                <CommandGroup>
                  {filteredRequesters.map((option) => (
                    <CommandItem
                      key={option.id}
                      className="flex items-center justify-between"
                      onSelect={() => {
                        setRequesterId(option.id);
                        setRequesterSearch("");
                      }}
                    >
                      <span>{option.label}</span>
                      {option.id === requesterId && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      )}
      {selectedRequester && (
        <p className="text-xs text-muted-foreground">
          Selected:{" "}
          <span className="font-semibold text-foreground">
            {selectedRequester.label}
          </span>
        </p>
      )}
    </div>
  );

  const CitySelector = () => (
    <div className="space-y-2">
      <Label>City *</Label>
      <Popover open={cityPickerOpen} onOpenChange={setCityPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            role="combobox"
            disabled={
              loadingCities ||
              (canChooseRequester && !requesterId) ||
              (!loadingCities && cities.length === 0)
            }
          >
            <span className="truncate">
              {selectedCity
                ? selectedCity.label
                : canChooseRequester && !requesterId
                  ? "Choose who requested this first"
                  : loadingCities
                    ? "Loading cities..."
                    : cities.length
                      ? "Select or search city"
                      : "No cities available"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(320px,calc(100vw-2rem))] p-0"
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandInput
              placeholder={
                loadingCities ? "Loading cities..." : "Start typing to search"
              }
              value={cityQuery}
              onValueChange={(value) => setCityQuery(value)}
              disabled={loadingCities}
            />
            <CommandList>
              {loadingCities ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Loading cities...
                </div>
              ) : (cityQuery ? filteredCities : cities).length ? (
                <CommandGroup>
                  {(cityQuery ? filteredCities : cities).map((city) => (
                    <CommandItem
                      key={city.id}
                      onSelect={() => {
                        setCityId(city.id);
                        setCityQuery("");
                        setCityPickerOpen(false);
                      }}
                    >
                      {city.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {canChooseRequester && !requesterId
                    ? "Choose who requested this to load their cities."
                    : "No cities available."}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        {selectedCity
          ? `Selected: ${selectedCity.label}`
          : canChooseRequester
            ? requesterId
              ? cities.length
                ? "Choose from the cities assigned to this Account Manager."
                : "This Account Manager has no assigned cities yet."
              : "Choose who requested this to load their cities."
            : cities.length
              ? "Select one of your assigned cities."
              : "No city assignments found for your account."}
      </p>
    </div>
  );



  const renderStepContent = () => {
    if (canChooseRequester) {
      switch (currentStepId) {
        case "type":
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Select
                  value={requestType}
                  onValueChange={(value: RequestType) => setRequestType(value)}
                >
                  <SelectTrigger id="requestType">
                    <SelectValue placeholder="Select a Request Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give this request a clear title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Who is this request for?"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume">Volume</Label>
                <Input
                  id="volume"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Optional volume amount"
                  value={volume}
                  onChange={(event) => setVolume(event.target.value)}
                />
              </div>
            </div>
          );
        case "details":
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Details</Label>
                <Textarea
                  id="description"
                  placeholder="Share the context, requirements, or helpful links..."
                  className="min-h-[140px]"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="needAnswerBy">Need Answer By</Label>
                <Input
                  id="needAnswerBy"
                  type="date"
                  min={today}
                  value={needAnswerBy}
                  onChange={(event) => setNeedAnswerBy(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  min={today}
                  value={deliveryDate}
                  onChange={(event) => setDeliveryDate(event.target.value)}
                />
              </div>
            </div>
          );
        case "review":
          return (
            <div className="space-y-6">
              <RequesterSelector />
              <CitySelector />
              <SummaryCard />
            </div>
          );
        default:
          return null;
      }
    }
    switch (currentStepId) {
      case "basics":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give this request a clear title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestType">Request Type</Label>
              <Select
                value={requestType}
                onValueChange={(value: RequestType) => setRequestType(value)}
              >
                <SelectTrigger id="requestType">
                  <SelectValue placeholder="Select a Request Type" />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Who is this request for?"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                type="number"
                min="0"
                step="1"
                placeholder="Optional volume amount"
                value={volume}
                onChange={(event) => setVolume(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Details</Label>
              <Textarea
                id="description"
                placeholder="Share the context, requirements, or helpful links..."
                className="min-h-[140px]"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="needAnswerBy">Need Answer By</Label>
              <Input
                id="needAnswerBy"
                type="date"
                min={today}
                value={needAnswerBy}
                onChange={(event) => setNeedAnswerBy(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                min={today}
                value={deliveryDate}
                onChange={(event) => setDeliveryDate(event.target.value)}
              />
            </div>
          </div>
        );
      case "city":
        return <CitySelector />;
      case "summary":
      default:
        return (
          <div className="space-y-6">
            <SummaryCard />
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
          </div>
        );
    }

  };
  return (
    <div className="flex h-full flex-col gap-4">
      <DialogHeader className="px-4 pt-4 text-center">
        <DialogTitle className="text-center text-lg font-semibold tracking-[0.3em] uppercase text-white/90">
          New Request
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <ul className="steps steps-horizontal w-full justify-center text-[11px] uppercase tracking-[0.25em]">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              return (
                <li
                  key={step.id}
                  data-content={isCompleted ? "✓" : index + 1}
                  className={cn(
                    "step whitespace-nowrap text-muted-foreground transition-colors",
                    isCompleted && "step-primary text-primary",
                    isActive && "step-primary text-primary",
                    !isCompleted && !isActive && "step-neutral"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-semibold tracking-[0.2em]",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ul>
          {renderStepContent()}
        </div>
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={submitting}
            >
              Back
            </Button>
          )}
          {isLastStep ? (
            <Button type="submit" disabled={submitting || !formReady}>
              {submitting ? "Creating..." : "Create Request"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNextStep} disabled={!currentStepValid}>
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
const useRequestPageController = () => {
  const { supabase, isSuperAdmin, loading, user } = useAuth();
  const { toast } = useToast();
  const [isDetailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EnrichedRequest | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [requests, setRequests] = useState<EnrichedRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [managerDirectory, setManagerDirectory] = useState<RequesterOption[]>([]);
  const [managerDirectoryLoading, setManagerDirectoryLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    city: "all",
    requester: "all",
  });
  const [filterSpotlightOpen, setFilterSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState("");
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EnrichedRequest | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [draggingRequestId, setDraggingRequestId] = useState<string | null>(null);
  const [activeDropStatus, setActiveDropStatus] = useState<Status | null>(null);
  const [activeDropCardId, setActiveDropCardId] = useState<string | null>(null);
  const [movingRequestId, setMovingRequestId] = useState<string | null>(null);
  const [bdrDirectory, setBdrDirectory] = useState<BdrOption[]>([]);
  const [bdrDirectoryLoading, setBdrDirectoryLoading] = useState(false);
  const [requestBdrAssignments, setRequestBdrAssignments] = useState<Record<string, RequestBdrAssignment[]>>({});
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTargetRequest, setAssignTargetRequest] = useState<EnrichedRequest | null>(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignSelectedBdrs, setAssignSelectedBdrs] = useState<string[]>([]);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    description: "",
    status: "new",
    requestType: "RESTAURANT",
    needAnswerBy: "",
    deliveryDate: "",
    priority: "",
    category: "",
    volume: "",
    company: "",
  });
  const managerLabelLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    managerDirectory.forEach((manager) => {
      lookup[manager.id] = manager.label;
    });
    return lookup;
  }, [managerDirectory]);
  const updateRequestOnServer = useCallback(
    async (requestId: string, updates: Partial<RequestRecord>) => {
      if (!supabase) {
        throw new Error("Supabase client is not ready.");
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session expired. Please sign in again.");
      }
      const response = await fetch("/api/admin/update-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          request_id: requestId,
          updates,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? response.statusText);
      }
    },
    [supabase]
  );
  const applyRequestUpdatesLocal = useCallback(
    (requestId: string, updates: Partial<EnrichedRequest>) => {
      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, ...updates } : request
        )
      );
      setSelectedRequest((prev) =>
        prev && prev.id === requestId ? { ...prev, ...updates } : prev
      );
    },
    []
  );
  const moveRequestLocally = useCallback(
    (requestId: string, targetStatus: Status, beforeCardId?: string | null) => {
      setRequests((prev) => {
        const currentIndex = prev.findIndex((req) => req.id === requestId);
        if (currentIndex === -1) {
          return prev;
        }
        const updated = [...prev];
        const [moving] = updated.splice(currentIndex, 1);
        const nextRequest: EnrichedRequest = {
          ...moving,
          status: targetStatus,
        };
        let insertIndex = updated.length;
        if (beforeCardId) {
          const beforeIndex = updated.findIndex((req) => req.id === beforeCardId);
          insertIndex = beforeIndex === -1 ? updated.length : beforeIndex;
        } else {
          insertIndex = updated.length;
          for (let index = 0; index < updated.length; index++) {
            if (updated[index].status === targetStatus) {
              insertIndex = index + 1;
            }
          }
        }
        updated.splice(insertIndex, 0, nextRequest);
        return updated;
      });
      setSelectedRequest((prev) =>
        prev && prev.id === requestId ? { ...prev, status: targetStatus } : prev
      );
    },
    []
  );
  const loadBdrDirectory = useCallback(async () => {
    if (!isSuperAdmin) {
      setBdrDirectory([]);
      return;
    }
    if (!supabase) {
      return;
    }
    setBdrDirectoryLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session expired. Please sign in again.");
      }
      const response = await fetch("/api/admin/bdrs", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error ?? response.statusText);
      }
      setBdrDirectory(payload.bdrs ?? []);
    } catch (error) {
      console.error("Unable to load BDR directory", error);
      setBdrDirectory([]);
    } finally {
      setBdrDirectoryLoading(false);
    }
  }, [isSuperAdmin, supabase]);
  const loadRequestAssignments = useCallback(async () => {
    if (!isSuperAdmin || !requests.length) {
      setRequestBdrAssignments({});
      return;
    }
    if (!supabase) {
      return;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session expired. Please sign in again.");
      }
      const params = new URLSearchParams();
      params.set("requestIds", requests.map((request) => request.id).join(","));
      const response = await fetch(
        `/api/admin/request-assignments?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error ?? response.statusText);
      }
      const grouped: Record<string, RequestBdrAssignment[]> = {};
      (payload.assignments ?? []).forEach(
        (assignment: { request_id: string; user_id: string; display_name: string | null }) => {
          if (!grouped[assignment.request_id]) {
            grouped[assignment.request_id] = [];
          }
          grouped[assignment.request_id].push({
            user_id: assignment.user_id,
            display_name: assignment.display_name,
          });
        }
      );
      setRequestBdrAssignments(grouped);
    } catch (error) {
      console.error("Unable to load request assignments", error);
      setRequestBdrAssignments({});
    }
  }, [isSuperAdmin, requests, supabase]);
  const loadRequests = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase client is not ready yet; skipping request load.");
      return;
    }
    setRequestsLoading(true);
    try {
      const { data, error } = await supabase
        .from("requests")
        .select(
          "id, title, description, request_type, requester_id, city_id, status, priority, category, volume, need_answer_by, delivery_date, company, created_at"
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
    if (supabase) {
      loadRequests();
    }
  }, [supabase, loadRequests]);
  const loadManagers = useCallback(async () => {
    if (!isSuperAdmin) {
      setManagerDirectory([]);
      return;
    }
    if (!supabase) {
      console.warn("Supabase client is not ready yet; skipping manager load.");
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
    if (supabase) {
      loadManagers();
    }
  }, [supabase, loadManagers]);
  useEffect(() => {
    if (isSuperAdmin) {
      loadBdrDirectory();
    } else {
      setBdrDirectory([]);
    }
  }, [isSuperAdmin, loadBdrDirectory]);
  useEffect(() => {
    if (isSuperAdmin && requests.length) {
      loadRequestAssignments();
    } else if (!requests.length) {
      setRequestBdrAssignments({});
    }
  }, [isSuperAdmin, requests.length, loadRequestAssignments]);
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
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setFilterSpotlightOpen((prev) => !prev);
        setSpotlightQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    if (!filterSpotlightOpen) {
      setSpotlightQuery("");
    }
  }, [filterSpotlightOpen]);
  useEffect(() => {
    if (!isSuperAdmin || !managerDirectory.length) {
      return;
    }
    setRequests((prev) =>
      prev.map((request) => ({
        ...request,
        requesterName:
          managerLabelLookup[request.requester_id] ?? request.requesterName,
      }))
    );
  }, [isSuperAdmin, managerLabelLookup, managerDirectory.length]);
  const spotlightResults = useMemo(() => {
    const q = spotlightQuery.toLowerCase().trim();
    if (!q) {
      return [];
    }
    return requests
      .filter((request) => {
        const assignedBdrs = requestBdrAssignments[request.id] ?? [];
        const bdrMatch = assignedBdrs.some((assignment) => (
          (assignment.display_name ?? "BDR")
            .toLowerCase()
            .includes(q)
        ));
        return (
          request.title.toLowerCase().includes(q) ||
          request.description?.toLowerCase().includes(q) ||
          (request.company ?? "").toLowerCase().includes(q) ||
          request.cityLabel.toLowerCase().includes(q) ||
          request.requesterName.toLowerCase().includes(q) ||
          bdrMatch
        );
      })
      .slice(0, 10);
  }, [requests, spotlightQuery, requestBdrAssignments]);
  const groupedRequests = useMemo(() => {
    return KANBAN_COLUMNS.map((column) => ({
      column,
      items: filteredRequests.filter(
        (request) => request.status === column.key
      ),
    }));
  }, [filteredRequests]);
  const canEditRequest = useCallback(
    (request: EnrichedRequest) =>
      isSuperAdmin || request.requester_id === user?.id,
    [isSuperAdmin, user?.id]
  );
  const handleRequestClick = (request: EnrichedRequest) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };
  const openEditDialog = (request: EnrichedRequest) => {
    if (!canEditRequest(request)) return;
    setEditTarget(request);
    setEditForm({
      title: request.title,
      description: request.description ?? "",
      status: request.status,
      requestType: request.request_type,
      needAnswerBy: request.need_answer_by ?? "",
      deliveryDate: request.delivery_date ?? "",
      priority: request.priority ?? "",
      category: request.category ?? "",
      volume: request.volume?.toString() ?? "",
      company: request.company ?? "",
    });
    setEditDialogOpen(true);
  };
  const handleEditInputChange = (
    field: keyof EditFormState,
    value: string
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !editTarget) return;
    setEditSaving(true);
    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim() || null,
      status: editForm.status,
      request_type: editForm.requestType,
      need_answer_by: editForm.needAnswerBy || null,
      delivery_date: editForm.deliveryDate || null,
      priority: editForm.priority.trim() || null,
      category: editForm.category.trim() || null,
      volume: editForm.volume ? Number(editForm.volume) : null,
      company: editForm.company.trim() || null,
    };
    try {
      await updateRequestOnServer(editTarget.id, payload);
    } catch (error) {
      toast({
        title: "Failed to update request",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      setEditSaving(false);
      return;
    }
    toast({ title: "Request updated" });
    setRequests((prev) =>
      prev.map((request) =>
        request.id === editTarget.id
          ? {
            ...request,
            ...payload,
            status: payload.status as Status,
            request_type: payload.request_type as RequestType,
            description: payload.description,
            need_answer_by: payload.need_answer_by,
            delivery_date: payload.delivery_date,
            priority: payload.priority,
            category: payload.category,
            volume: payload.volume,
            company: payload.company,
          }
          : request
      )
    );
    if (selectedRequest?.id === editTarget.id) {
      setSelectedRequest((prev) =>
        prev
          ? {
            ...prev,
            ...payload,
            status: payload.status as Status,
            request_type: payload.request_type as RequestType,
            description: payload.description,
            need_answer_by: payload.need_answer_by,
            delivery_date: payload.delivery_date,
            priority: payload.priority,
            category: payload.category,
            volume: payload.volume,
            company: payload.company,
          }
          : prev
      );
    }
    setEditSaving(false);
    setEditDialogOpen(false);
    setEditTarget(null);
  };
  const handleRequestCreated = () => {
    setCreateDialogOpen(false);
    loadRequests();
  };
  const handleCardDragStart = useCallback((requestId: string) => {
    setDraggingRequestId(requestId);
  }, []);
  const handleCardDragEnd = useCallback(() => {
    setDraggingRequestId(null);
    setActiveDropStatus(null);
    setActiveDropCardId(null);
  }, []);
  const handleDragOverStatusChange = useCallback(
    (status: Status | null, cardId?: string | null) => {
      if (!draggingRequestId) return;
      setActiveDropStatus(status);
      setActiveDropCardId(cardId ?? null);
    },
    [draggingRequestId]
  );
  const handleKanbanDrop = useCallback(
    async (targetStatus: Status, beforeCardId?: string | null) => {
      if (!draggingRequestId) return;
      const request = requests.find((item) => item.id === draggingRequestId);
      if (!request) {
        handleCardDragEnd();
        return;
      }
      moveRequestLocally(draggingRequestId, targetStatus, beforeCardId);
      setMovingRequestId(draggingRequestId);
      handleCardDragEnd();
      try {
        await updateRequestOnServer(draggingRequestId, { status: targetStatus });
        toast({
          title: "Request moved",
          description: `${request.title} moved to ${targetStatus}.`,
        });
      } catch (error) {
        toast({
          title: "Unable to move request",
          description:
            error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive",
        });
        loadRequests();
      } finally {
        setMovingRequestId(null);
      }
    },
    [
      draggingRequestId,
      requests,
      moveRequestLocally,
      handleCardDragEnd,
      updateRequestOnServer,
      toast,
      loadRequests,
    ]
  );
  const openAssignDialogForRequest = useCallback(
    (request: EnrichedRequest) => {
      if (!isSuperAdmin) return;
      setAssignTargetRequest(request);
      setAssignSearch("");
      setAssignSelectedBdrs([]);
      setAssignDialogOpen(true);
    },
    [isSuperAdmin]
  );
  const assignSelectedBdrsToRequest = useCallback(async () => {
    if (!assignTargetRequest || !supabase || assignSelectedBdrs.length === 0) {
      return;
    }
    setAssignSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session expired. Please sign in again.");
      }
      for (const bdrUserId of assignSelectedBdrs) {
        const response = await fetch("/api/admin/request-assignments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            requestId: assignTargetRequest.id,
            bdrUserId,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error ?? response.statusText);
        }
        const label =
          bdrDirectory.find((option) => option.id === bdrUserId)?.label ?? "BDR";
        setRequestBdrAssignments((prev) => {
          const next = { ...prev };
          const list = next[assignTargetRequest.id] ?? [];
          next[assignTargetRequest.id] = [
            ...list.filter((assignment) => assignment.user_id !== bdrUserId),
            { user_id: bdrUserId, display_name: label },
          ];
          return next;
        });
      }
      toast({
        title: "BDR assigned",
        description:
          assignSelectedBdrs.length === 1
            ? `${assignTargetRequest.title} assigned to ${bdrDirectory.find(
              (option) => option.id === assignSelectedBdrs[0]
            )?.label ?? "BDR"}.`
            : `${assignSelectedBdrs.length} BDRs assigned to ${assignTargetRequest.title}.`,
      });
      setAssignDialogOpen(false);
      setAssignTargetRequest(null);
      setAssignSearch("");
      setAssignSelectedBdrs([]);
    } catch (error) {
      toast({
        title: "Unable to assign BDR",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setAssignSaving(false);
    }
  }, [assignTargetRequest, supabase, assignSelectedBdrs, bdrDirectory, toast]);
  const unassignBdrFromRequest = useCallback(
    async (bdrUserId: string) => {
      if (!assignTargetRequest || !supabase) return;
      setAssignSaving(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Session expired. Please sign in again.");
        }
        const response = await fetch("/api/admin/request-assignments", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            requestId: assignTargetRequest.id,
            bdrUserId,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error ?? response.statusText);
        }
        setRequestBdrAssignments((prev) => {
          const next = { ...prev };
          next[assignTargetRequest.id] = (next[assignTargetRequest.id] ?? []).filter(
            (assignment) => assignment.user_id !== bdrUserId
          );
          return next;
        });
        toast({
          title: "BDR unassigned",
          description: `${assignTargetRequest.title} no longer assigned to this BDR.`,
        });
      } catch (error) {
        toast({
          title: "Unable to unassign BDR",
          description:
            error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setAssignSaving(false);
      }
    },
    [assignTargetRequest, supabase, toast]
  );
  const handlePendingBdrToggle = useCallback((bdrUserId: string) => {
    setAssignSelectedBdrs((prev) =>
      prev.includes(bdrUserId)
        ? prev.filter((id) => id !== bdrUserId)
        : [...prev, bdrUserId]
    );
  }, []);
  const filteredBdrDirectory = useMemo(() => {
    const term = assignSearch.toLowerCase().trim();
    const assignedIds = new Set(
      assignTargetRequest
        ? (requestBdrAssignments[assignTargetRequest.id] ?? []).map(
          (assignment) => assignment.user_id
        )
        : []
    );
    assignSelectedBdrs.forEach((id) => assignedIds.add(id));
    return bdrDirectory.filter((option) => {
      if (assignedIds.has(option.id)) {
        return false;
      }
      if (!term) {
        return true;
      }
      return option.label.toLowerCase().includes(term);
    });
  }, [assignSearch, bdrDirectory, assignTargetRequest, requestBdrAssignments, assignSelectedBdrs]);
  const handleEditDialogOpenChange = (open: boolean) => {
    if (!open && !editSaving) {
      setEditDialogOpen(false);
      setEditTarget(null);
    } else if (open) {
      setEditDialogOpen(true);
    }
  };
  return {
    loading,
    isCreateDialogOpen,
    setCreateDialogOpen,
    managerDirectory,
    managerDirectoryLoading,
    requests,
    requestsLoading,
    filteredRequests,
    groupedRequests,
    canEditRequest,
    handleRequestClick,
    openEditDialog,
    filterSpotlightOpen,
    setFilterSpotlightOpen,
    spotlightQuery,
    setSpotlightQuery,
    spotlightResults,
    filters,
    setFilters,
    isDetailDialogOpen,
    setDetailDialogOpen,
    selectedRequest,
    setSelectedRequest,
    isEditDialogOpen,
    handleEditDialogOpenChange,
    editForm,
    handleEditInputChange,
    handleEditSubmit,
    editSaving,
    editTarget,
    handleRequestCreated,
    isSuperAdmin,
    draggingRequestId,
    activeDropStatus,
    handleKanbanDrop,
    handleCardDragStart,
    handleCardDragEnd,
    handleDragOverStatusChange,
    movingRequestId,
    activeDropCardId,
    bdrDirectory,
    bdrDirectoryLoading,
    requestBdrAssignments,
    assignDialogOpen,
    setAssignDialogOpen,
    assignTargetRequest,
    setAssignTargetRequest,
    assignSearch,
    setAssignSearch,
    assignSelectedBdrs,
    setAssignSelectedBdrs,
    assignSaving,
    filteredBdrDirectory,
    openAssignDialogForRequest,
    handlePendingBdrToggle,
    assignSelectedBdrsToRequest,
    unassignBdrFromRequest,
  };
};

type RequestPageController = ReturnType<typeof useRequestPageController>;

const RequestPageLayout = ({
  controller,
}: {
  controller: RequestPageController;
}) => {
  const {
    loading,
    isCreateDialogOpen,
    setCreateDialogOpen,
    managerDirectory,
    managerDirectoryLoading,
    requests,
    requestsLoading,
    filteredRequests,
    groupedRequests,
    canEditRequest,
    handleRequestClick,
    openEditDialog,
    filterSpotlightOpen,
    setFilterSpotlightOpen,
    spotlightQuery,
    setSpotlightQuery,
    spotlightResults,
    isDetailDialogOpen,
    setDetailDialogOpen,
    selectedRequest,
    isEditDialogOpen,
    handleEditDialogOpenChange,
    editForm,
    handleEditInputChange,
    handleEditSubmit,
    editSaving,
    editTarget,
    handleRequestCreated,
    setSelectedRequest,
    isSuperAdmin,
    draggingRequestId,
    activeDropStatus,
    handleKanbanDrop,
    handleCardDragStart,
    handleCardDragEnd,
    handleDragOverStatusChange,
    movingRequestId,
    activeDropCardId,
    bdrDirectory,
    bdrDirectoryLoading,
    requestBdrAssignments,
    openAssignDialogForRequest,
    assignDialogOpen,
    setAssignDialogOpen,
    assignTargetRequest,
    setAssignTargetRequest,
    assignSearch,
    setAssignSearch,
    assignSelectedBdrs,
    setAssignSelectedBdrs,
    assignSaving,
    filteredBdrDirectory,
    handlePendingBdrToggle,
    assignSelectedBdrsToRequest,
    unassignBdrFromRequest,
  } = controller;

  if (loading) {
    return <SplashScreen loading />;
  }

  const hasRequests = filteredRequests.length > 0;

  return (<>
    <div className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]">
      Requests
    </div>
    <DashboardLayout
      title=""
      actionButton={
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <TooltipProvider>
            <Tooltip>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full border-transparent hover:border-primary"
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
          <DialogContent className="w-full sm:max-w-lg">
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
        style={{ transform: "scale(0.9)", transformOrigin: "top center", paddingTop: "5%" }}
        className="relative h-full overflow-visible"
      >
        {COLUMN_PREVIEW ? (
          <div className="w-[80vw] px-6 mx-auto">
            {requestsLoading ? (
              <div className="grid grid-cols-4 gap-4">
                {KANBAN_COLUMNS.map((column) => (
                  <div key={`loading-column-${column.key}`} className="space-y-4">
                    <div className="flex items-center justify-between px-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      <span>{column.label}</span>
                      <Skeleton className="h-4 w-6 rounded-full" />
                    </div>
                    <RequestCardSkeleton />
                    <RequestCardSkeleton />
                  </div>
                ))}
              </div>
            ) : !hasRequests ? (
              <div className="widget rounded-2xl border border-dashed bg-card/60 p-6 text-center text-muted-foreground">
                {requests.length === 0
                  ? "No requests have been submitted yet."
                  : "No requests match your filters."}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {groupedRequests.map(({ column, items }) => (
                  <div
                    key={`kanban-column-${column.key}`}
                    className={cn(
                      "space-y-4 rounded-2xl border-2 p-3 transition",
                      draggingRequestId
                        ? "border-dashed border-white/40"
                        : "border-transparent",
                      activeDropStatus === column.key
                        ? "border-primary/70 bg-white/5"
                        : ""
                    )}
                    onDragOver={(event) => {
                      if (!draggingRequestId) return;
                      event.preventDefault();
                      handleDragOverStatusChange(column.key, null);
                    }}
                    onDrop={(event) => {
                      if (!draggingRequestId) return;
                      event.preventDefault();
                      handleDragOverStatusChange(null, null);
                      handleKanbanDrop(column.key, null);
                    }}
                    onDragEnter={(event) => {
                      if (!draggingRequestId) return;
                      event.preventDefault();
                      handleDragOverStatusChange(column.key, null);
                    }}
                    onDragLeave={(event) => {
                      if (!draggingRequestId) return;
                      event.preventDefault();
                      handleDragOverStatusChange(null, null);
                    }}
                  >
                    <div className="flex items-center justify-between px-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      <span>{column.label}</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-foreground">
                        {items.length}
                      </span>
                    </div>
                    {items.length ? (
                      items.map((request) => {
                        const editable = canEditRequest(request);
                        const assignedBdrs = requestBdrAssignments[request.id] ?? [];
                        return (
                          <div
                            key={`${column.key}-${request.id}`}
                            draggable={editable}
                            onDragStart={(event) => {
                              if (!editable) return;
                              event.stopPropagation();
                              handleCardDragStart(request.id);
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", request.id);
                            }}
                            onDragEnd={(event) => {
                              event.preventDefault();
                              handleCardDragEnd();
                            }}
                            onDragOver={(event) => {
                              if (!editable || !draggingRequestId) return;
                              event.preventDefault();
                              handleDragOverStatusChange(column.key, request.id);
                            }}
                            onDrop={(event) => {
                              if (!editable) return;
                              event.preventDefault();
                              handleDragOverStatusChange(null, null);
                              handleKanbanDrop(column.key, request.id);
                            }}
                            className={cn(
                              "relative",
                              editable ? "cursor-grab active:cursor-grabbing" : "",
                              activeDropCardId === request.id
                                ? "before:absolute before:-top-2 before:left-0 before:right-0 before:h-1 before:rounded-full before:bg-primary/70 before:content-['']"
                                : ""
                            )}
                          >
                            <RequestCard
                              request={request}
                              onView={() => handleRequestClick(request)}
                              onEdit={() => openEditDialog(request)}
                              canEdit={editable}
                              isPendingMove={
                                draggingRequestId === request.id ||
                                movingRequestId === request.id
                              }
                              assignedBdrs={assignedBdrs}
                              showAssignAction={isSuperAdmin}
                              onAssignBdr={() => openAssignDialogForRequest(request)}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div className="widget rounded-2xl border border-dashed bg-card/20 p-4 text-center text-[11px] text-muted-foreground">
                        No {column.label.toLowerCase()} requests
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : LIST_VIEW ? (
          <div className="mx-auto w-full max-w-none pt-20">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Requests Dashboard
                  </p>
                  <h2 className="text-2xl font-semibold text-white">
                    List View
                  </h2>
                  <p className="text-sm text-white/70">
                    Detailed list of every request with quick actions.
                  </p>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Visible{" "}
                  <span className="text-white">{filteredRequests.length}</span>
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="hidden grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,auto] gap-3 border-b border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-white/70 md:grid">
                  <span>Title</span>
                  <span>Type</span>
                  <span>Status</span>
                  <span>City</span>
                  <span>Age</span>
                  <span>Delivery</span>
                  <span>Requested By</span>
                </div>
                <div className="divide-y divide-white/10">
                  {requestsLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                      <RequestListSkeleton key={`request-list-skeleton-${index}`} />
                    ))
                    : !hasRequests
                      ? [
                        <div
                          key="list-empty"
                          className="p-6 text-center text-sm text-muted-foreground"
                        >
                          {requests.length === 0
                            ? "No requests have been submitted yet."
                            : "No requests match your filters."}
                        </div>,
                      ]
                      : filteredRequests.map((request) => {
                        const editable = canEditRequest(request);
                        return (
                          <RequestListRow
                            key={`list-${request.id}`}
                            request={request}
                            onView={() => handleRequestClick(request)}
                            onEdit={() => openEditDialog(request)}
                            canEdit={editable}
                          />
                        );
                      })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-none pt-12">
            <div className="rounded-[36px] bg-gradient-to-r from-sky-500/40 via-amber-400/40 to-emerald-400/40 p-[2px]">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur w-full">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Requests Dashboard
                    </p>
                    <h2 className="text-2xl font-semibold text-white">Kanban Board</h2>
                    <p className="text-sm text-white/70">
                      Track every restaurant request from intake through launch.
                    </p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                    Visible{" "}
                    <span className="text-white">{filteredRequests.length}</span>
                  </div>
                </div>
                {requestsLoading ? (
                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {KANBAN_COLUMNS.map((column) => (
                      <div
                        key={`loading-kanban-${column.key}`}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between px-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          <span>{column.label}</span>
                          <Skeleton className="h-4 w-6 rounded-full" />
                        </div>
                        <RequestCardSkeleton />
                        <RequestCardSkeleton />
                      </div>
                    ))}
                  </div>
                ) : hasRequests ? (
                  <div className="mt-8">
                    <RequestKanban
                      groups={groupedRequests}
                      onView={handleRequestClick}
                      onEdit={openEditDialog}
                      canEdit={canEditRequest}
                      enableDrag
                      draggingRequestId={draggingRequestId}
                      activeDropStatus={activeDropStatus}
                      onDropStatus={handleKanbanDrop}
                      onDragStart={handleCardDragStart}
                      onDragEnd={handleCardDragEnd}
                      onDragOverStatusChange={handleDragOverStatusChange}
                      movingRequestId={movingRequestId}
                      activeDropCardId={activeDropCardId}
                      assignmentLookup={requestBdrAssignments}
                      showAssignAction={isSuperAdmin}
                      onAssignBdr={openAssignDialogForRequest}
                    />
                  </div>
                ) : (
                  <div className="mt-8 rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-sm text-white/70">
                    {requests.length === 0
                      ? "No requests have been submitted yet."
                      : "No requests match your filters."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Dialog open={isDetailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-[12px] border border-white/30 bg-white/10 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <DialogTitle className="sr-only">Request Details</DialogTitle>
          {selectedRequest && (
            <div className="px-4 sm:px-6 pb-4">
              <RequestDetailView request={selectedRequest} />
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-[12px] border border-white/30 bg-white/10 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <DialogTitle className="text-center text-lg font-semibold tracking-[0.3em] uppercase text-white/90">
            Edit Request
          </DialogTitle>
          <form className="space-y-4 text-sm" onSubmit={handleEditSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="editTitle">Title</Label>
              <Input
                id="editTitle"
                value={editForm.title}
                onChange={(event) =>
                  handleEditInputChange("title", event.target.value)
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editRequestType">Request Type</Label>
              <Select
                value={editForm.requestType}
                onValueChange={(value: RequestType) =>
                  handleEditInputChange("requestType", value)
                }
              >
                <SelectTrigger id="editRequestType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(event) =>
                  handleEditInputChange("description", event.target.value)
                }
                className="min-h-[120px]"
                placeholder="Update request details..."
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: Status) =>
                    handleEditInputChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(statusConfig).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Input
                  value={editForm.priority}
                  onChange={(event) =>
                    handleEditInputChange("priority", event.target.value)
                  }
                  placeholder="High, Medium..."
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={editForm.category}
                  onChange={(event) =>
                    handleEditInputChange("category", event.target.value)
                  }
                  placeholder="Optional grouping"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Volume</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={editForm.volume}
                  onChange={(event) =>
                    handleEditInputChange("volume", event.target.value)
                  }
                  placeholder="Volume"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Need Answer By</Label>
                <Input
                  type="date"
                  value={editForm.needAnswerBy}
                  onChange={(event) =>
                    handleEditInputChange("needAnswerBy", event.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Delivery Date</Label>
                <Input
                  type="date"
                  value={editForm.deliveryDate}
                  onChange={(event) =>
                    handleEditInputChange("deliveryDate", event.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input
                value={editForm.company}
                onChange={(event) =>
                  handleEditInputChange("company", event.target.value)
                }
                placeholder="Company name"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (!editSaving) { handleEditDialogOpenChange(false); }
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editSaving || !editTarget}>
                {editSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={assignDialogOpen}
        onOpenChange={(open) => {
          setAssignDialogOpen(open);
          if (!open) {
            setAssignTargetRequest(null);
            setAssignSearch("");
            setAssignSelectedBdrs([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-[12px] border border-white/20 bg-white/5 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-[0.3em] uppercase text-muted-foreground">
              Assign BDR
            </DialogTitle>
          </DialogHeader>
          {assignTargetRequest ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Search BDRs</Label>
                <Command className="rounded-[12px] border border-white/15 bg-background/60">
                  <CommandInput
                    placeholder="Type a name or email..."
                    value={assignSearch}
                    onValueChange={setAssignSearch}
                    className="placeholder:text-muted-foreground"
                  />
                  <CommandList>
                    {filteredBdrDirectory.length === 0 ? (
                      <CommandEmpty>
                        {bdrDirectory.length ===
                          (requestBdrAssignments[assignTargetRequest.id]?.length ?? 0) +
                          assignSelectedBdrs.length
                          ? "All BDRs are selected."
                          : "No BDRs found."}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {filteredBdrDirectory.map((option) => (
                          <CommandItem
                            key={option.id}
                            disabled={assignSaving}
                            className="cursor-pointer hover:bg-primary/10 data-[selected=true]:bg-transparent data-[selected=true]:text-foreground"
                            onSelect={() => {
                              handlePendingBdrToggle(option.id);
                              setAssignSearch("");
                            }}
                          >
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </div>
              {assignSelectedBdrs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {assignSelectedBdrs.map((bdrId) => (
                    <span
                      key={`pending-${bdrId}`}
                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {bdrDirectory.find((option) => option.id === bdrId)?.label ??
                        "Selected BDR"}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full p-0 text-xs"
                        onClick={() => handlePendingBdrToggle(bdrId)}
                      >
                        ×
                        <span className="sr-only">Remove pending BDR</span>
                      </Button>
                    </span>
                  ))}
                </div>
              )}
              {requestBdrAssignments[assignTargetRequest.id]?.length ? (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Assigned BDRs
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {requestBdrAssignments[assignTargetRequest.id].map((assignment) => (
                      <span
                        key={assignment.user_id}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"
                      >
                        {assignment.display_name ?? "BDR"}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={assignSaving}
                          onClick={() => unassignBdrFromRequest(assignment.user_id)}
                          className="h-5 w-5 rounded-full p-0 text-xs"
                        >
                          ×
                          <span className="sr-only">Remove BDR</span>
                        </Button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  No BDRs assigned yet.
                </p>
              )}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  disabled={assignSelectedBdrs.length === 0 || assignSaving}
                  onClick={assignSelectedBdrsToRequest}
                >
                  {assignSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a request first to assign a BDR.
            </p>
          )}
        </DialogContent>
      </Dialog>
      <CommandDialog open={filterSpotlightOpen} onOpenChange={setFilterSpotlightOpen}>
        <CommandInput
          placeholder="Search requests by title, company, city, requester, or BDR..."
          value={spotlightQuery}
          onValueChange={setSpotlightQuery}
        />
        <DialogTitle className="sr-only">Search Requests</DialogTitle>
        <CommandList>
          <CommandEmpty>
            {spotlightQuery.trim().length === 0
              ? "Start typing to search requests…"
              : "No requests found."}
          </CommandEmpty>
          {spotlightResults.length > 0 && (
            <CommandGroup heading="Matching Requests">
              {spotlightResults.map((request) => (
                <CommandItem
                  key={`spotlight-${request.id}`}
                  onSelect={() => {
                    setFilterSpotlightOpen(false);
                    setDetailDialogOpen(true);
                    setSelectedRequest(request);
                  }}
                  className="group flex flex-col gap-2 rounded-md border border-transparent px-4 py-3 text-left text-sm transition hover:border-primary/40 hover:bg-primary/5 data-[selected=true]:border-primary/40 data-[selected=true]:bg-primary/10 data-[selected=true]:shadow-[0_0_0_1px_rgba(59,130,246,0.2)]"
                >
                  <div className="flex w-full items-center justify-between gap-6">
                    <span className="font-semibold text-foreground">
                      {request.title}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.2em]",
                        statusConfig[request.status].badgeClass
                      )}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-left text-xs text-muted-foreground">
                    {request.description?.trim() || "No details provided."}
                  </p>
                  {requestBdrAssignments[request.id]?.length ? (
                    <p className="text-left text-[11px] text-muted-foreground">
                      Assigned to{" "}
                      {requestBdrAssignments[request.id]
                        .map((assignment) => assignment.display_name ?? "BDR")
                        .join(", ")}
                    </p>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </DashboardLayout>
  </>
  );
};

export const RequestPageRefactor = () => {
  const controller = useRequestPageController();
  return <RequestPageLayout controller={controller} />;
};

export default RequestPageRefactor;
