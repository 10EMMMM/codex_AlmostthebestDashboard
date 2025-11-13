"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "./button";
import { useRouter } from "next/navigation";

export function SplashScreen({ loading = true }: { loading?: boolean }) {
  const [showStuckMessage, setShowStuckMessage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setShowStuckMessage(true);
      }, 8000); // 8 seconds
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [loading]);

  const handleGoToLogin = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative animate-pulse flex flex-col items-center">
        <div className="text-8xl font-black leading-none transform relative z-10">
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
        <p className="text-4xl font-semibold text-foreground mt-4">LOADING<span className="animate-ellipsis"></span></p>
      </div>
      
      {showStuckMessage && (
        <div className="absolute bottom-10 text-center animate-in fade-in-50">
          <p className="text-muted-foreground mb-4">Still loading? Something might be wrong.</p>
          <Button variant="outline" onClick={handleGoToLogin}>
            Stuck? Go to Login
          </Button>
        </div>
      )}
    </div>
  );
}
