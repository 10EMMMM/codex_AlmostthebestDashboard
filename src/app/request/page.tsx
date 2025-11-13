"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  X,
  Calendar,
  CheckCircle,
  PlusCircle,
  RefreshCw,
  PauseCircle,
  FileEdit,
  MapPin,
  ChevronsUpDown,
  Search,
  FilePlus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/dashboard-layout';
import { getSupabaseClient } from '@/lib/supabaseClient';

const initialRequests = [
  {
    id: 1,
    title: 'New Marketing Campaign',
    requester: 'Alice Johnson',
    avatar: '/avatars/01.png',
    city: 'New York, NY',
    date: '2024-10-28',
    deadline: '2024-11-15',
    status: 'done',
    description: 'Request to launch a new marketing campaign for the Q4 product release. Includes social media push, email marketing, and influencer collaborations. Budget approval needed.',
    notes: [],
  },
  // ... other initial requests
];

type Note = {
  text: string;
  author: string;
  date: string;
};

type Request = (typeof initialRequests)[0] & { notes: Note[] };

const statusConfig = {
  new: {
    icon: PlusCircle,
    color: 'text-blue-500',
    badgeVariant: 'outline',
    badgeClass: 'border-blue-500/50 text-blue-500',
  },
  'on progress': {
    icon: RefreshCw,
    color: 'text-yellow-500',
    badgeVariant: 'outline',
    badgeClass: 'border-yellow-500/50 text-yellow-500',
  },
  done: {
    icon: CheckCircle,
    color: 'text-green-500',
    badgeVariant: 'outline',
    badgeClass: 'border-green-500/50 text-green-500',
  },
  'on hold': {
    icon: PauseCircle,
    color: 'text-gray-500',
    badgeVariant: 'outline',
    badgeClass: 'border-gray-500/50 text-gray-500',
  },
} as const;

type Status = keyof typeof statusConfig;

const RequestCard = ({
  request,
  onClick,
}: { 
  request: Request;
  onClick: () => void;
}) => {
  const { badgeVariant, badgeClass } = statusConfig[request.status as keyof typeof statusConfig];

  return (
    <div className="widget flex flex-col">
      <Card
        className="flex-grow flex flex-col cursor-pointer hover:border-primary"
        onClick={onClick}
      >
        <CardHeader className="p-4 flex-row items-start justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <div className="flex flex-col text-sm text-muted-foreground">
              <span className='font-medium'>{request.requester}</span>
               <div className="flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                <span>{request.city}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>Req. Date: {new Date(request.date).toLocaleDateString()}</span>
              </div>
               <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3 text-destructive" />
                <span>Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Badge
            variant={badgeVariant}
            className={cn('whitespace-nowrap capitalize', badgeClass)}
          >
            {request.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {request.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const RequestDetailView = ({ request }: { request: Request }) => {
  const { icon: StatusIcon, color, badgeVariant, badgeClass } = statusConfig[request.status as keyof typeof statusConfig];
  
  return (
    <Card className="flex-grow flex flex-col">
      <CardHeader className="p-4 flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">{request.title}</CardTitle>
          <div className="flex flex-col text-sm text-muted-foreground">
            <span className='font-medium'>{request.requester}</span>
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              <span>{request.city}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              <span>Req. Date: {new Date(request.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3 text-destructive" />
              <span>Deadline: {new Date(request.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <Badge
          variant={badgeVariant}
          className={cn('whitespace-nowrap capitalize', badgeClass)}
        >
          {request.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground">
          {request.description}
        </p>
      </CardContent>
    </Card>
  )
};

const CreateRequestForm = ({ onCancel }: { onCancel: () => void }) => {
  const [requestType, setRequestType] = useState('');

  return (
    <>
      <DialogHeader>
        <DialogTitle>New Request</DialogTitle>
      </DialogHeader>
      <div className="p-4 flex-grow space-y-4">
        <div className="space-y-2">
          <Label htmlFor="requestType">Request Type</Label>
          <Select onValueChange={setRequestType}>
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

        {requestType === 'restaurant' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input id="restaurantName" placeholder="Enter restaurant name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Enter city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the restaurant..." className="min-h-[100px]" />
            </div>
          </>
        )}

        {requestType === 'event' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input id="eventName" placeholder="Enter event name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input id="eventDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Enter event location" />
            </div>
          </>
        )}

        {requestType === 'cuisine' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="cuisineType">Cuisine Type</Label>
              <Input id="cuisineType" placeholder="e.g., Italian, Mexican, etc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Input id="dietaryRestrictions" placeholder="e.g., Gluten-free, Vegan, etc." />
            </div>
          </>
        )}
      </div>
      <div className="p-4 border-t-0 flex justify-end gap-2">
        <Button variant="secondary">Submit</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </>
  );
};

const FilterPopover = ({
  triggerLabel,
  value,
  onValueChange,
  items,
  placeholder
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
          <span className='truncate'>{currentItem}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => { onValueChange('all'); setOpen(false); }}>All</CommandItem>
              {items.map((item) => (
                <CommandItem key={item} onSelect={() => { onValueChange(item); setOpen(false); }} className="capitalize">
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

export default function RequestPage() {
  const [isDetailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [requests, setRequests] = useState<Request[]>(initialRequests as Request[]);
  const [cities, setCities] = useState<string[]>([]);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('name, state_code');

      if (data) {
        setCities(data.map(city => `${city.name}, ${city.state_code}`));
      }
      if (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, [supabase]);
  const [filters, setFilters] = useState({
    status: 'all',
    city: 'all',
    requester: 'all',
  });

  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const uniqueCities = useMemo(() => [...cities], [cities]);
  const uniqueRequesters = useMemo(() => [...new Set(requests.map(req => req.requester))], [requests]);
  const uniqueStatuses = useMemo(() => Object.keys(statusConfig), []);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const statusMatch = filters.status === 'all' || req.status === filters.status;
      const cityMatch = filters.city === 'all' || req.city === filters.city;
      const requesterMatch = filters.requester === 'all' || req.requester === filters.requester;
      return statusMatch && cityMatch && requesterMatch;
    });
  }, [requests, filters]);

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({...prev, [filterType]: value}));
  }

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
          <DialogContent className="scale-80">
            <CreateRequestForm onCancel={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      }
    >
      <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }} className="w-full h-full relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-full max-w-5xl px-4">
          <div className="flex justify-center items-center mb-4">
            <div className="flex gap-2 p-2 backdrop-blur-sm rounded-full">
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
            </div>
          </div>
        </div>
        <div className="dashboard-grid mx-auto max-w-5xl h-full overflow-y-auto pt-20">
            {filteredRequests.map(req => (
              <RequestCard
                key={req.id}
                request={req}
                onClick={() => handleRequestClick(req)}
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
