"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabaseClient";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type Mode = "signup" | "signin";

type LoginFormProps = {
  mode?: Mode;
  onOAuthSignIn?: () => Promise<void>;
  oauthLabel?: string;
  showModeHint?: boolean;
};

export function LoginForm({
  mode = "signin",
  onOAuthSignIn,
  oauthLabel = "Sign in with Google",
  showModeHint = false,
}: LoginFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const authResponse =
      mode === "signup"
        ? await supabase.auth.signUp({
            email: values.email,
            password: values.password,
          })
        : await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });

    const { error } = authResponse;

    if (error) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: mode === "signup" ? "Account Created" : "Logged In",
        description:
          mode === "signup"
            ? "We've created your account. You will be redirected shortly."
            : "You are now logged in. Redirecting...",
        variant: "success",
      });
      router.push("/dashboard");
    }
    setIsLoading(false);
  }

  const isSignUp = mode === "signup";

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{isSignUp ? "Sign up" : "Sign in"}</h1>
        <p className="text-muted-foreground">
          {isSignUp ? "Create an account to get started." : "Enter your credentials to log in."}
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
                  <Input type="password" placeholder={isSignUp ? "Create Password" : "Enter Password"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full !mt-6" variant="secondary" disabled={isLoading}>
            {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Login"}
          </Button>
          {onOAuthSignIn && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => onOAuthSignIn()}
                className="flex items-center justify-center font-sans"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12.24 10.285V14.4h6.86c-.22 1.45-1.07 2.73-2.47 3.62v3.1h4.01c2.35-2.17 3.72-5.33 3.72-9.12 0-.8-.07-1.56-.2-2.29H12.24z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12.24 22c3.24 0 5.95-1.08 7.93-2.93l-4.01-3.1c-1.11.74-2.54 1.18-3.92 1.18-3.02 0-5.58-2.04-6.5-4.77H1.7v3.1C3.66 19.94 7.6 22 12.24 22z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.74 14.29c-.25-.74-.39-1.53-.39-2.29s.14-1.55.39-2.29V6.6H1.7C.64 8.72.0 10.36.0 12s.64 3.28 1.7 5.4H5.74z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.24 4.77c1.65 0 3.1.57 4.26 1.66l3.56-3.56C18.19 1.18 15.24 0 12.24 0 7.6 0 3.66 2.06 1.7 6.6l4.04 3.1c.92-2.73 3.48-4.77 6.5-4.77z"
                    fill="#EA4335"
                  />
                </svg>
                {oauthLabel}
              </Button>
            </>
          )}
        </form>
      </Form>
      {showModeHint && (
        <div className="mt-8 text-center text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <a href="#" className="font-semibold text-primary hover:underline">
            {isSignUp ? "Login" : "Sign Up"}
          </a>
        </div>
      )}
    </div>
  );
}
