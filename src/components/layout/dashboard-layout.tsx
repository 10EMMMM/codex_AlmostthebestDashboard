"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import { LayoutGrid, Send, Store, LogOut, UserPlus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import type { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
};

export function DashboardLayout({ children, title, actionButton }: { children: ReactNode, title: string, actionButton?: ReactNode }) {
  const [dashboardBg, setDashboardBg] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();
  const { supabase, isSuperAdmin } = useAuth();

  useEffect(() => {
    // Get theme background from data attribute set by ThemeProvider
    const bgUrl = document.documentElement.getAttribute('data-theme-bg-dashboard');
    if (bgUrl) {
      setDashboardBg(bgUrl);
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Removed background image - using solid color instead */}
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <header
        className="fixed top-0 left-0 right-0 z-30 flex items-center px-3 py-1 backdrop-blur-2xl gap-3 text-[11px]"
        style={{
          backgroundColor: 'hsl(var(--sidebar-background) / 0.8)',
          borderBottom: '1px solid hsl(var(--sidebar-border))'
        }}
      >
        <div className="flex items-center gap-1">
          <button
            aria-label="Close (Sign out)"
            onClick={handleSignOut}
            className="h-3.5 w-3.5 rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)] hover:opacity-75 transition"
            style={{ backgroundColor: 'var(--theme-window-close)' }}
          />
          <span className="h-3.5 w-3.5 rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--theme-window-minimize)' }} />
          <span className="h-3.5 w-3.5 rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--theme-window-maximize)' }} />
        </div>
        <div className="flex-1 flex justify-center">
          <TooltipProvider>
            <div className="flex items-center gap-1.5 text-foreground/80">
              {[
                { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
                { href: '/request', label: 'Requests', icon: Send },
                { href: '/restaurant-onboarding', label: 'Restaurant Onboarding', icon: Store },
                { href: '/create-user', label: 'Create User', icon: UserPlus, superAdminOnly: true },
              ]
                .filter((item) => !item.superAdminOnly || isSuperAdmin)
                .map((item: NavItem) => {
                  const isActive = pathname === item.href;
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "rounded-full transition h-7 w-7",
                            isActive ? "" : "bg-transparent hover:bg-white/15"
                          )}
                          style={isActive ? {
                            backgroundColor: 'hsl(var(--primary) / 0.15)',
                            color: 'hsl(var(--primary))'
                          } : undefined}
                          asChild
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
            </div>
          </TooltipProvider>
        </div>
        <div className="min-w-[3rem] flex justify-end">
          {actionButton}
        </div>
      </header>

      <Card
        className="relative w-full min-h-screen rounded-none bg-white/5 border border-white/10 shadow-none flex flex-col overflow-hidden pt-[38px]"
        data-layout-card
      >
        <CardContent className="p-4 sm:p-6 flex-grow overflow-y-auto">
          <div className="content-scale-wrapper" data-layout-wrapper>
            <div className="content-scale-inner">
              {title && (
                <div className="flex items-center justify-between mb-6">
                  <CardTitle>{title}</CardTitle>
                </div>
              )}
              {children}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
