"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

const greetings = [
    "Hello, human!",
    "What's up, doc?",
    "Welcome to the matrix.",
    "Greetings, earthling.",
    "Keep up the great work!",
    "You're doing awesome!",
    "Remember to stay hydrated.",
    "Have a fantastic day!",
    "Let's get this bread.",
    "Someone's looking productive today!",
];

export const GreetingWidget = ({ user }: { user: any }) => {
    const [greeting, setGreeting] = useState('');
    const tone = useMemo(() => {
        const palette = [
            {
                container: "bg-gradient-to-br from-indigo-500/80 via-purple-500/60 to-pink-500/50 text-white border-indigo-400/40",
                heading: "text-white",
                accent: "text-white/80",
            },
            {
                container: "bg-gradient-to-br from-emerald-500/80 via-cyan-500/60 to-blue-500/50 text-white border-emerald-400/50",
                heading: "text-white",
                accent: "text-white/85",
            },
            {
                container: "bg-gradient-to-br from-amber-400/80 via-orange-400/70 to-rose-400/60 text-white border-amber-300/50",
                heading: "text-white",
                accent: "text-white/80",
            },
        ];
        return palette[Math.floor(Math.random() * palette.length)];
    }, []);

    useEffect(() => {
        setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    }, []);

    return (
        <div
            className={cn(
                "widget rounded-xl p-6 flex flex-col border shadow-lg col-span-full",
                tone.container
            )}
        >
            <div className="flex justify-between items-center w-full mb-4">
                <h3
                    className={cn(
                        "text-base font-semibold uppercase tracking-wider flex items-center space-x-2",
                        tone.heading
                    )}
                >
                    <User className="w-5 h-5" />
                    <span>WELCOME</span>
                </h3>
                <div className={cn("text-sm font-medium", tone.accent)}>
                    {user?.user_metadata?.display_name ||
                        user?.user_metadata?.full_name ||
                        (user?.email?.split("@")[0] || "Welcome")}
                </div>
            </div>
            <div className="flex flex-col justify-center flex-grow text-center">
                <p className="text-base font-semibold truncate">
                    “{greeting}”
                </p>
            </div>
        </div>
    );
};
