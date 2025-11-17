"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  CheckCircle,
  ChevronsUpDown,
  FilePlus,
  MapPin,
  PauseCircle,
  PlusCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/dashboard-layout';
import { getSupabaseClient } from '@/lib/supabaseClient';

const fallbackCities = ['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Austin, TX', 'Seattle, WA'];

const statusConfig = {
  new: {
    icon: PlusCircle,
    color: 'text-blue-500',
    badgeClass: 'border-blue-500/50 text-blue-500 bg-blue-50',
  },
  'on progress': {
    icon: RefreshCw,
    color: 'text-yellow-500',
    badgeClass: 'border-yellow-500/50 text-yellow-600 bg-yellow-50',
  },
  done: {
    icon: CheckCircle,
    color: 'text-green-500',
    badgeClass: 'border-green-500/50 text-green-600 bg-green-50',
  },
  'on hold': {
    icon: PauseCircle,
    color: 'text-gray-500',
    badgeClass: 'border-gray-500/50 text-gray-600 bg-gray-50',
  },
} as const;

type Status = keyof typeof statusConfig;
type Priority = 'low' | 'medium' | 'high';
type RequestType = 'restaurant' | 'event' | 'cuisine';

type Note = {
  text: string;
  author: string;
  date: string;
};

type Request = {
  id: number;
  title: string;
  requester: string;
  requesterTitle: string;
  avatar: string;
  city: string;
  date: string;
  deadline: string;
  status: Status;
  requestType: RequestType;
  budget: number;
  priority: Priority;
  description: string;
  notes: Note[];
};

const initialRequests: Request[] = [
  {
    id: 1,
    title: 'Onboard Main Street Restaurant',
    requester: 'Nora Lee',
    requesterTitle: 'Account Manager',
    avatar: '/avatars/01.png',
    city: 'New York, NY',
    date: '2024-10-12',
    deadline: '2024-11-05',
    status: 'on progress',
    requestType: 'restaurant',
    budget: 50000,
    priority: 'high',
    description:
      'Initial onboarding for the Main Street location. Needs menu audit, BDR assignment, and launch collateral before Thanksgiving weekend.',
    notes: [
      { text: 'Kickoff brief shared with design.', author: 'Ops Lead', date: '2024-10-15' },
      { text: 'Waiting on city permit upload from AM.', author: 'BDR Team', date: '2024-10-18' },
    ],
  },
  {
    id: 2,
    title: 'Q4 Pop-Up Event Coordination',
    requester: 'Miguel Carter',
    requesterTitle: 'Regional AM',
    avatar: '/avatars/02.png',
    city: 'San Francisco, CA',
    date: '2024-10-20',
    deadline: '2024-11-10',
    status: 'new',
    requestType: 'event',
    budget: 18000,
    priority: 'medium',
    description:
      'Plan a weekend pop-up for the new Mediterranean partner. Requires permits, signage, and influencer outreach. Confirm BDR coverage.',
    notes: [{ text: 'Venue shortlist delivered to requester.', author: 'Events', date: '2024-10-22' }],
  },
  {
    id: 3,
    title: 'Cuisine Expansion: Southeast Asian',
    requester: 'Priya Desai',
    requesterTitle: 'Strategic AM',
    avatar: '/avatars/03.png',
    city: 'Chicago, IL',
    date: '2024-09-30',
    deadline: '2024-11-01',
    status: 'on hold',
    requestType: 'cuisine',
    budget: 22000,
    priority: 'low',
    description:
      'Research partners for a Southeast Asian cuisine track. Gather menus, shortlist caterers, and confirm sourcing timelines for Q1.',
    notes: [{ text: 'Paused pending supplier pricing updates.', author: 'Ops Lead', date: '2024-10-05' }],
  },
  {
    id: 4,
    title: 'Upsell Campaign: River North',
    requester: 'Samir Patel',
    requesterTitle: 'Account Manager',
    avatar: '/avatars/04.png',
    city: 'Chicago, IL',
    date: '2024-09-10',
    deadline: '2024-10-15',
    status: 'done',
    requestType: 'restaurant',
    budget: 12500,
    priority: 'medium',
    description:
      'Closed-loop campaign to upsell River North partners on premium placements. Needs recap deck and follow-up note to stakeholders.',
    notes: [
      { text: 'Recap deck delivered and approved.', author: 'Marketing', date: '2024-10-02' },
      { text: 'Stakeholders notified in platform.', author: 'Ops Lead', date: '2024-10-03' },
    ],
  },
];

const priorityStyles: Record<Priority, string> = {
  high: 'bg-red-50 text-red-600 border-red-500/40',
  medium: 'bg-amber-50 text-amber-600 border-amber-500/40',
  low: 'bg-emerald-50 text-emerald-600 border-emerald-500/40',
};

const requestTypeCopy: Record<RequestType, string> = {
  restaurant: 'Restaurant',
  event: 'Event',
  cuisine: 'Cuisine',
};

type RequestFormState = {
  requestType: RequestType | '';
  title: string;
  city: string;
  description: string;
  budget: string;
  deadline: string;
  priority: Priority;
  requester: string;
};

const initialFormState: RequestFormState = {
  requestType: '',
  title: '',
  city: '',
  description: '',
  budget: '',
  deadline: '',
  priority: 'medium',
  requester: '',
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const RequestCard = ({ request, onClick }: { request: Request; onClick: () => void }) => {
  const { icon: StatusIcon, badgeClass } = statusConfig[request.status];

  return (
    <div className="widget flex flex-col">
      <Card className="flex-grow flex flex-col cursor-pointer hover:border-primary" onClick={onClick}>
        <CardHeader className="p-4 flex-row items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg leading-tight line-clamp-2">{request.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <Badge variant="outline" className="capitalize px-2 py-0.5">
                {requestTypeCopy[request.requestType]}
              </Badge>
              <Badge variant="outline" className={cn('px-2 py-0.5 capitalize', priorityStyles[request.priority])}>
                {request.priority} priority
              </Badge>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{request.city}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Requested: {formatDate(request.date)}</span>
              <span>Deadline: {formatDate(request.deadline)}</span>
            </div>
          </div>
          <Badge variant="outline" className={cn('whitespace-nowrap capitalize', badgeClass)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {request.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{request.description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

const RequestDetailView = ({ request, onAddNote }: { request: Request; onAddNote: (note: string) => void }) => {
  const { icon: StatusIcon, badgeClass } = statusConfig[request.status];
  const [noteText, setNoteText] = useState('');

  const handleSubmitNote = () => {
    if (!noteText.trim()) return;
    onAddNote(noteText.trim());
    setNoteText('');
  };

  return (
    <Card className="flex-grow flex flex-col">
      <CardHeader className="p-4 flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn('whitespace-nowrap capitalize', badgeClass)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {request.status}
            </Badge>
            <Badge variant="outline" className="capitalize">{requestTypeCopy[request.requestType]}</Badge>
            <Badge variant="outline" className={cn('capitalize', priorityStyles[request.priority])}>
              {request.priority} priority
            </Badge>
            <Badge variant="outline">Budget: {formatCurrency(request.budget)}</Badge>
          </div>
          <CardTitle className="text-xl leading-tight">{request.title}</CardTitle>
          <CardDescription>{request.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={request.avatar} alt={request.requester} />
              <AvatarFallback>{request.requester.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium leading-tight">{request.requester}</p>
              <p className="text-muted-foreground text-xs">{request.requesterTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{request.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Req. Date: {formatDate(request.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-destructive" />
            <span>Deadline: {formatDate(request.deadline)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Budget: {formatCurrency(request.budget)}</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>{request.notes.length} notes logged</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Notes keep the request aligned for AMs, BDRs, and super admins.</p>
          <div className="space-y-3">
            {request.notes.map((note, idx) => (
              <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{note.author}</span>
                  <span>{formatDate(note.date)}</span>
                </div>
                <p className="text-sm mt-1">{note.text}</p>
              </div>
            ))}
            {request.notes.length === 0 && (
              <p className="text-sm text-muted-foreground">No notes yet. Add context to keep the team aligned.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-note">Add a quick note</Label>
            <Textarea
              id="new-note"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Share handoff details, blockers, or next steps"
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitNote} size="sm" disabled={!noteText.trim()}>
                Log note
              </Button>
            </div>
          </div>
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
  const currentItem = value === 'all' ? triggerLabel : value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto px-2 py-1 text-xs w-[150px] justify-between capitalize"
        >
          <span className="truncate">{currentItem}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" style={{ transform: 'scale(0.92)', transformOrigin: 'top center' }}>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onValueChange('all');
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
  onSubmit,
  cities,
}: {
  onCancel: () => void;
  onSubmit: (payload: RequestFormState) => void;
  cities: string[];
}) => {
  const [formState, setFormState] = useState<RequestFormState>(initialFormState);
  const [error, setError] = useState('');

  const handleChange = (key: keyof RequestFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSubmit = () => {
    const missingRequired =
      !formState.requestType ||
      !formState.title.trim() ||
      !formState.city.trim() ||
      !formState.description.trim() ||
      !formState.budget.trim() ||
      !formState.deadline.trim() ||
      !formState.requester.trim();

    if (missingRequired) {
      setError('Please fill out request type, title, city, description, budget, deadline, and requester.');
      return;
    }

    onSubmit(formState);
    setFormState(initialFormState);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>New Request</DialogTitle>
        <CardDescription>Aligns with the `public.requests` intake fields from the database checklist.</CardDescription>
      </DialogHeader>
      <div className="p-4 flex-grow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="requestType">Request Type</Label>
            <Select onValueChange={(value) => handleChange('requestType', value)} value={formState.requestType}>
              <SelectTrigger id="requestType">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="cuisine">Cuisine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formState.priority} onValueChange={(value) => handleChange('priority', value)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(event) => handleChange('title', event.target.value)}
              placeholder="Summarize the request"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requester">Requester</Label>
            <Input
              id="requester"
              value={formState.requester}
              onChange={(event) => handleChange('requester', event.target.value)}
              placeholder="Who is opening this request?"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select value={formState.city} onValueChange={(value) => handleChange('city', value)}>
              <SelectTrigger id="city">
                <SelectValue placeholder="Select an assigned city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                value={formState.budget}
                onChange={(event) => handleChange('budget', event.target.value)}
                placeholder="USD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formState.deadline}
                onChange={(event) => handleChange('deadline', event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formState.description}
            onChange={(event) => handleChange('description', event.target.value)}
            placeholder="Add context, files to gather, and handoff notes"
            className="min-h-[120px]"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <div className="p-4 border-t-0 flex justify-end gap-2">
        <Button variant="secondary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </>
  );
};

export default function RequestPage() {
  const [isDetailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [cities, setCities] = useState<string[]>(fallbackCities);
  const supabase = getSupabaseClient();

  const [filters, setFilters] = useState({
    status: 'all',
    city: 'all',
    requester: 'all',
    requestType: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase.from('cities').select('name, state_code');

      if (data) {
        const mapped = data.map((city) => `${city.name}, ${city.state_code}`);
        setCities(mapped.length > 0 ? mapped : fallbackCities);
      }
      if (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, [supabase]);

  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const uniqueCities = useMemo(() => Array.from(new Set([...cities, ...requests.map((req) => req.city)])), [cities, requests]);
  const uniqueRequesters = useMemo(() => [...new Set(requests.map((req) => req.requester))], [requests]);
  const uniqueStatuses = useMemo(() => Object.keys(statusConfig), []);
  const uniqueRequestTypes = useMemo(() => ['restaurant', 'event', 'cuisine'], []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const statusMatch = filters.status === 'all' || req.status === filters.status;
      const cityMatch = filters.city === 'all' || req.city === filters.city;
      const requesterMatch = filters.requester === 'all' || req.requester === filters.requester;
      const requestTypeMatch = filters.requestType === 'all' || req.requestType === filters.requestType;
      const searchMatch =
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && cityMatch && requesterMatch && requestTypeMatch && searchMatch;
    });
  }, [requests, filters, searchTerm]);

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleAddNote = (note: string) => {
    if (!selectedRequest) return;

    const updatedRequests = requests.map((req) =>
      req.id === selectedRequest.id
        ? {
            ...req,
            notes: [...req.notes, { text: note, author: 'You', date: new Date().toISOString() }],
          }
        : req,
    );

    setRequests(updatedRequests);
    const refreshedSelection = updatedRequests.find((req) => req.id === selectedRequest.id) ?? null;
    setSelectedRequest(refreshedSelection);
  };

  const handleCreateRequest = (payload: RequestFormState) => {
    const newRequest: Request = {
      id: Date.now(),
      title: payload.title.trim(),
      requester: payload.requester.trim(),
      requesterTitle: 'Account Manager',
      avatar: '/avatars/placeholder.png',
      city: payload.city,
      date: new Date().toISOString(),
      deadline: payload.deadline,
      status: 'new',
      requestType: (payload.requestType ?? 'restaurant') as RequestType,
      budget: Number(payload.budget),
      priority: payload.priority,
      description: payload.description.trim(),
      notes: [
        {
          text: 'Request logged with intake form. Assignments and notifications should follow.',
          author: 'System',
          date: new Date().toISOString(),
        },
      ],
    };

    setRequests((prev) => [...prev, newRequest]);
    setSelectedRequest(newRequest);
    setCreateDialogOpen(false);
    setDetailDialogOpen(true);
  };

  return (
    <DashboardLayout
      title="Requests"
      actionButton={
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <TooltipProvider>
            <Tooltip>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="border-transparent hover:border-primary rounded-xl">
                  <FilePlus className="h-4 w-4" />
                  <span className="sr-only">New Request</span>
                </Button>
              </DialogTrigger>
              <TooltipContent>
                <p>New Request</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="max-w-3xl">
            <CreateRequestForm onCancel={() => setCreateDialogOpen(false)} onSubmit={handleCreateRequest} cities={uniqueCities} />
          </DialogContent>
        </Dialog>
      }
    >
      <div className="w-full h-full relative">
        <div className="sticky top-0 left-1/2 -translate-x-1/2 z-10 w-full max-w-6xl px-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 backdrop-blur-sm rounded-full flex-wrap">
              <FilterPopover
                triggerLabel="Status"
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
                items={uniqueStatuses}
                placeholder="Filter by status..."
              />
              <FilterPopover
                triggerLabel="City"
                value={filters.city}
                onValueChange={(value) => handleFilterChange('city', value)}
                items={uniqueCities}
                placeholder="Filter by city..."
              />
              <FilterPopover
                triggerLabel="Requester"
                value={filters.requester}
                onValueChange={(value) => handleFilterChange('requester', value)}
                items={uniqueRequesters}
                placeholder="Filter by requester..."
              />
              <FilterPopover
                triggerLabel="Type"
                value={filters.requestType}
                onValueChange={(value) => handleFilterChange('requestType', value)}
                items={uniqueRequestTypes}
                placeholder="Filter by type..."
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search title or description"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-grid mx-auto max-w-6xl h-full overflow-y-auto pt-2">
          {filteredRequests.length === 0 && (
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>No requests found</CardTitle>
                <CardDescription>
                  Adjust filters or submit a new request using the + button. Intake fields mirror the database checklist in docs/ui_checklist.md.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          {filteredRequests.map((req) => (
            <RequestCard key={req.id} request={req} onClick={() => handleRequestClick(req)} />
          ))}
        </div>
      </div>
      <Dialog open={isDetailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="sr-only">Request Details</DialogTitle>
          {selectedRequest && <RequestDetailView request={selectedRequest} onAddNote={handleAddNote} />}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
