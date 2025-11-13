"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '../lib/placeholder-images';
import { Card } from '../components/ui/card';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { getSupabaseClient } from '../lib/supabaseClient';
import { useToast } from '../hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { SplashScreen } from '../components/ui/splash-screen';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

function LoginForm({ handleSignInWithGoogle }: { handleSignInWithGoogle: () => void }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = getSupabaseClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    
    if (signInError) {
      toast({
        title: "Authentication Error",
        description: signInError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged In",
        description: "You are now logged in. Redirecting...",
      });
      router.push('/dashboard');
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sign in</h1>
        <p className="text-muted-foreground">
          Enter your credentials to log in.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Enter Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" placeholder="Enter Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full !mt-6" variant="secondary" disabled={isLoading}>
            {isLoading ? "Loading..." : 'Login'}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button variant="outline" type="button" disabled={isLoading} onClick={() => handleSignInWithGoogle()} className="flex items-center justify-center font-sans">
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V14.4h6.86c-.22 1.45-1.07 2.73-2.47 3.62v3.1h4.01c2.35-2.17 3.72-5.33 3.72-9.12 0-.8-.07-1.56-.2-2.29H12.24z" fill="#4285F4"/>
                  <path d="M12.24 22c3.24 0 5.95-1.08 7.93-2.93l-4.01-3.1c-1.11.74-2.54 1.18-3.92 1.18-3.02 0-5.58-2.04-6.5-4.77H1.7v3.1C3.66 19.94 7.6 22 12.24 22z" fill="#34A853"/>
                  <path d="M5.74 14.29c-.25-.74-.39-1.53-.39-2.29s.14-1.55.39-2.29V6.6H1.7C.64 8.72.0 10.36.0 12s.64 3.28 1.7 5.4H5.74z" fill="#FBBC05"/>
                  <path d="M12.24 4.77c1.65 0 3.1.57 4.26 1.66l3.56-3.56C18.19 1.18 15.24 0 12.24 0 7.6 0 3.66 2.06 1.7 6.6l4.04 3.1c.92-2.73 3.48-4.77 6.5-4.77z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function Page() {
  const pageBackground = PlaceHolderImages.find(
    (img) => img.id === 'login-background'
  );
  const [animationClass, setAnimationClass] = useState('animate-tada');
  const supabase = getSupabaseClient();
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleTestLogin = async (email: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'password123', // Assuming a default password for test users
    });

    if (error) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged In",
                  description: "You are now logged in. Redirecting...",
                });
                router.push('/dashboard');    }
  }

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

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  if (loading || user) {
    return <SplashScreen loading={loading} />;
  }

  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
        {pageBackground && (
          <Image
            src={pageBackground.imageUrl}
            alt={pageBackground.description}
            fill
            className={cn(
              'object-cover -z-10 brightness-50 transition-all duration-300'
            )}
            data-ai-hint={pageBackground.imageHint}
            priority
          />
        )}
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
              <LoginForm handleSignInWithGoogle={handleSignInWithGoogle} />
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}