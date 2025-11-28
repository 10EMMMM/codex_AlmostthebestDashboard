"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { LoginForm } from '@/components/features/auth/login-form';
import { useAuth } from '@/hooks/useAuth';
import { SplashScreen } from '@/components/ui/splash-screen';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function Page() {
  const [animationClass, setAnimationClass] = useState('animate-tada');
  const [loginBg, setLoginBg] = useState<string>('');
  const supabase = getSupabaseClient();
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useAuth();

  async function handleSignInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }

    const timer = setTimeout(() => {
      setAnimationClass('animate-pulse-no-fade');
    }, 1000); // Switch to pulse after 1s (tada animation duration)

    // Get theme background from data attribute set by ThemeProvider
    const bgUrl = document.documentElement.getAttribute('data-theme-bg-login');
    if (bgUrl) {
      setLoginBg(bgUrl);
    }

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  if (loading || user) {
    return <SplashScreen loading={loading} />;
  }

  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center justify-center p-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
        {/* Removed background image - using solid color instead */}
        <Card
          className={cn(
            'w-[65vw] h-[60vh] overflow-hidden shadow-2xl bg-card border-0 transition-all duration-300 relative'
          )}
        >
          <div
            className={cn(
              'absolute top-0 h-full w-[60%] bg-card left-[40%]'
            )}
          >
            <div className="hidden md:flex items-end h-full px-24 py-32">
              <div className="relative -left-24 transform md:scale-50 lg:scale-100">
                <div
                  className={`text-8xl font-black leading-none transform rotate-4 relative z-10 ${animationClass}`}
                >
                  <span
                    style={{
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      padding: '0 0.25rem',
                    }}
                    className="transform scale-x-75 scale-y-75 inline-block"
                  >
                    ALMOST
                  </span>
                  <span
                    style={{ color: 'hsl(var(--primary))' }}
                    className="absolute right-5 -top-6 text-6xl"
                  >
                    *
                  </span>
                </div>
                <div
                  className={`text-8xl font-black leading-none transform absolute top-12 left-0`}
                >
                  <span
                    style={{ color: 'hsl(var(--primary))', padding: '0 0.25rem' }}
                    className="transform scale-x-75 scale-y-75 inline-block whitespace-nowrap"
                  >
                    THE BEST
                  </span>
                </div>
                <div
                  className={`text-8xl font-black leading-none transform absolute top-[104px] -left-2`}
                >
                  <span
                    style={{ color: 'hsl(var(--primary))', padding: '0 0.25rem' }}
                    className="transform scale-x-75 scale-y-75 inline-block whitespace-nowrap uppercase"
                  >
                    dashboard
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            className={cn(
              'absolute top-0 h-full w-[40%] bg-background/80 left-0'
            )}
          >
            <div className="p-8 md:p-12 h-full">
              <LoginForm mode="signin" onOAuthSignIn={handleSignInWithGoogle} />
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}
