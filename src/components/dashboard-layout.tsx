
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
  LayoutGrid,
  Send,
  Store,
  Settings,
  LogOut,
  UserCog,
  UserCheck,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';

export function DashboardLayout({ children, title, actionButton }: { children: React.ReactNode, title: string, actionButton?: React.ReactNode }) {
  const pageBackground = PlaceHolderImages.find(
    (img) => img.id === 'login-background'
  );
  const router = useRouter();
  const pathname = usePathname();
  const { isSuperAdmin, hasAdminAccess, supabase } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <Card className="relative w-[80vw] h-[80vh] rounded-xl bg-surface-dark/50 backdrop-blur-xl shadow-2xl flex flex-col">
        <CardHeader className="p-0 text-center">
        <div className="flex justify-between items-center px-2 py-1 bg-muted/50">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-8 w-8"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "hover:border-primary rounded-xl",
                        pathname === '/dashboard'
                          ? "border-primary bg-primary/10"
                          : "border-transparent"
                      )}
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
                      className={cn(
                        "hover:border-primary rounded-xl",
                        pathname === '/request'
                          ? "border-primary bg-primary/10"
                          : "border-transparent"
                      )}
                      asChild
                    >
                      <Link href="/request">
                        <Send className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Request</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "hover:border-primary rounded-xl",
                        pathname === '/restaurant-onboarding'
                          ? "border-primary bg-primary/10"
                          : "border-transparent"
                      )}
                      asChild
                    >
                      <Link href="/restaurant-onboarding">
                        <Store className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Restaurant Onboarding</p>
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
                {hasAdminAccess && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "hover:border-primary rounded-xl",
                            pathname === '/admin/daisyui'
                              ? "border-primary bg-primary/10"
                              : "border-transparent"
                          )}
                          asChild
                        >
                          <Link href="/admin/daisyui">
                            <Sparkles className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>daisyUI Gallery</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "hover:border-primary rounded-xl",
                            pathname === '/admin/users'
                              ? "border-primary bg-primary/10"
                              : "border-transparent"
                          )}
                          asChild
                        >
                          <Link href="/admin/users">
                            <UserPlus className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create User</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "hover:border-primary rounded-xl",
                            pathname === '/admin'
                              ? "border-primary bg-primary/10"
                              : "border-transparent"
                          )}
                          asChild
                        >
                          <Link href="/admin">
                            <UserCog className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Admin</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "hover:border-primary rounded-xl",
                            pathname === '/bdr'
                              ? "border-primary bg-primary/10"
                              : "border-transparent"
                          )}
                          asChild
                        >
                          <Link href="/bdr">
                            <UserCheck className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>BDR</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </TooltipProvider>
            </div>
            <div className="w-12">
              {actionButton}
            </div>
          </div>
          <div className="pt-4 pb-4">
            {title && <CardTitle>{title}</CardTitle>}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {children}
        </CardContent>
      </Card>
    </main>
  );
}
