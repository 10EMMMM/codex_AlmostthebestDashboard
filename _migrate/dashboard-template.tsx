
"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Settings,
  User,
  LayoutGrid,
  Mail,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


export default function DashboardTemplate() {
  const pageBackground = PlaceHolderImages.find(
    (img) => img.id === 'login-background'
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 lg:p-8">
      {pageBackground && (
        <Image
          src={pageBackground.imageUrl}
          alt={pageBackground.description}
          fill
          className="object-cover"
          data-ai-hint={pageBackground.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <Card className="relative w-[80vw] h-[80vh] rounded-lg bg-surface-dark/50 backdrop-blur-xl shadow-2xl flex flex-col">
        <CardHeader className="p-0 text-center">
        <div className="flex justify-center items-center gap-1 bg-muted/50">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="border border-primary bg-primary/10 hover:border-primary rounded-xl"
                    asChild
                  >
                    <Link href="/dashboard">
                      <LayoutGrid className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="border border-transparent hover:border-primary rounded-xl"
                    asChild
                  >
                    <Link href="/user-view">
                      <User className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Profile</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="border border-transparent hover:border-primary rounded-xl"
                     asChild
                  >
                    <Link href="/messages">
                      <Mail className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Messages</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="border border-transparent hover:border-primary rounded-xl"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="pt-4 pb-4">
            <CardTitle>Dashboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {/* Your page content goes here */}
        </CardContent>
      </Card>
    </main>
  );
}
