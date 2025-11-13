"use client";

import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./button";

export function ErrorSplashScreen({ message, actionText, onActionClick }: { message: string, actionText: string, onActionClick: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center text-center p-8">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button variant="destructive" onClick={onActionClick}>
          {actionText}
        </Button>
      </div>
    </div>
  );
}
