"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  X,
  Calendar,
  CheckCircle,
  PlusCircle,
  RefreshCw,
  PauseCircle,
  FilePlus,
  MapPin,
  Store,
} from 'lucide-react';
import {
  Card,
  CardContent,
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
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const initialRestaurants = [
  {
    id: 1,
    name: 'The Golden Spoon',
    contact: 'Alice Johnson',
    avatar: '/avatars/01.png',
    city: 'New York, NY',
    date: '2024-10-28',
    status: 'done',
    description: 'A fine dining experience with a focus on modern European cuisine. Recently awarded a Michelin star.',
  },
  {
    id: 2,
    name: 'Pizza Palace',
    contact: 'Bob Williams',
    avatar: '/avatars/02.png',
    city: 'San Francisco, CA',
    date: '2024-10-27',
    status: 'on progress',
    description: 'Authentic Neapolitan pizza from a family-owned business with a history stretching back to Naples. They are currently undergoing a complete menu redesign and intensive staff training to prepare for their grand re-opening next month. The owner is very hands-on and passionate about quality.',
  },
  {
    id: 3,
    name: 'Taco Town',
    contact: 'Charlie Brown',
    avatar: '/avatars/03.png',
    city: 'Austin, TX',
    date: '2024-10-26',
    status: 'on hold',
    description: 'Street-style tacos and local craft beer. Onboarding paused pending health inspection certificate.',
  },
  {
    id: 4,
    name: 'Sushi Central',
    contact: 'Diana Miller',
    avatar: '/avatars/04.png',
    city: 'Chicago, IL',
    date: '2024-11-01',
    status: 'new',
    description: 'New sushi bar opening downtown. Initial paperwork submitted, awaiting review.',
  },
  {
    id: 5,
    name: 'Burger Barn',
    contact: 'Ethan Davis',
    avatar: '/avatars/05.png',
    city: 'Seattle, WA',
    date: '2024-10-15',
    status: 'done',
    description: 'Gourmet burgers and milkshakes. Fully onboarded and integrated with our delivery platform.',
  },
  {
    id: 6,
    name: 'The Noodle House',
    contact: 'Fiona Garcia',
    avatar: '/avatars/01.png',
    city: 'Miami, FL',
    date: '2024-10-29',
    status: 'on progress',
    description: 'Authentic ramen and pho, with a secret family recipe for their broth that has been passed down for generations. They are currently in the process of setting up their online menu and professional food photography session. The goal is to launch on our platform by the end of the month.',
  },
  {
    id: 7,
    name: 'Steakhouse Supreme',
    contact: 'George Harris',
    avatar: '/avatars/02.png',
    city: 'Las Vegas, NV',
    date: '2024-10-22',
    status: 'done',
    description: 'High-end steakhouse on the Strip. Onboarding completed last month.',
  },
  {
    id: 8,
    name: 'The Salty Pretzel',
    contact: 'Hannah Clark',
    avatar: '/avatars/03.png',
    city: 'Philadelphia, PA',
    date: '2024-11-05',
    status: 'new',
    description: 'German-style beer garden and pretzel bakery. Application just received.',
  },
];

type Restaurant = (typeof initialRestaurants)[0];

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

const RestaurantCard = ({
  restaurant,
  onClick,
}: {
  restaurant: Restaurant;
  onClick: () => void;
}) => {
  const { badgeVariant, badgeClass } = statusConfig[restaurant.status as keyof typeof statusConfig];
  
  const [randomClampClass, setRandomClampClass] = useState('line-clamp-2'); // Default to line-clamp-2
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const clamps = ['line-clamp-2', 'line-clamp-3', 'line-clamp-none'];
    setRandomClampClass(clamps[Math.floor(Math.random() * clamps.length)]);
  }, []);

  const displayedClampClass = isClient ? randomClampClass : 'line-clamp-2';

  return (
    <div className="widget flex flex-col">
      <Card
        className="flex-grow flex flex-col cursor-pointer hover:border-primary"
        onClick={onClick}
      >
        <CardHeader className="p-4 flex-row items-start justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">{restaurant.name}</CardTitle>
            <div className="flex flex-col text-sm text-muted-foreground">
              <span className='font-medium'>{restaurant.contact}</span>
               <div className="flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                <span>{restaurant.city}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>Onboarding Since: {new Date(restaurant.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Badge
            variant={badgeVariant}
            className={cn('whitespace-nowrap capitalize', badgeClass)}
          >
            {restaurant.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <p className={cn("text-sm text-muted-foreground", randomClampClass)}>
            {restaurant.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
const RestaurantDetailView = ({ restaurant }: { restaurant: Restaurant }) => {
  const { icon: StatusIcon, color, badgeVariant, badgeClass } = statusConfig[restaurant.status as keyof typeof statusConfig];
  
  return (
    <Card className="flex-grow flex flex-col">
      <CardHeader className="p-4 flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">{restaurant.name}</CardTitle>
          <div className="flex flex-col text-sm text-muted-foreground">
            <span className='font-medium'>{restaurant.contact}</span>
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              <span>{restaurant.city}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              <span>Onboarding Since: {new Date(restaurant.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <Badge
          variant={badgeVariant}
          className={cn('whitespace-nowrap capitalize', badgeClass)}
        >
          {restaurant.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground">
          {restaurant.description}
        </p>
      </CardContent>
    </Card>
  )
};

const CreateRestaurantForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>New Restaurant Onboarding</DialogTitle>
      </DialogHeader>
      <div className="p-4 flex-grow space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Restaurant Name</Label>
          <Input id="name" placeholder="Enter restaurant name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Enter city" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Describe the restaurant..." className="min-h-[100px]" />
        </div>
      </div>
      <div className="p-4 border-t-0 flex justify-end gap-2">
        <Button variant="secondary">Submit</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </>
  );
};

export default function RestaurantOnboardingPage() {
  const [isDetailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setDetailDialogOpen(true);
  };

  return (
    <DashboardLayout
      title="Restaurant Onboarding"
      actionButton={
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <TooltipProvider>
            <Tooltip>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="border-transparent hover:border-primary rounded-xl">
                  <FilePlus className="h-4 w-4" />
                  <span className="sr-only">New Onboarding</span>
                </Button>
              </DialogTrigger>
              <TooltipContent>
                <p>New Onboarding</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="sm:max-w-[600px]">
            <CreateRestaurantForm onCancel={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      }
    >
      <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }} className="w-full h-full">
        <div className="dashboard-grid mx-auto max-w-5xl">
            {restaurants.map(res => (
              <RestaurantCard
                key={res.id}
                restaurant={res}
                onClick={() => handleRestaurantClick(res)}
              />
            ))}
        </div>
      </div>
      <Dialog open={isDetailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl scale-80">
          <DialogTitle className="sr-only">Restaurant Details</DialogTitle>
          {selectedRestaurant && <RestaurantDetailView restaurant={selectedRestaurant} />}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
