"use client";

import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';

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

    useEffect(() => {
        setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    }, []);

    // Convert greeting string to words array for typewriter effect
    const words = greeting.split(' ').map(word => ({
        text: word,
        className: 'text-white dark:text-white'
    }));

    return (
        <div
            className="widget rounded-xl p-6 flex flex-col border shadow-lg col-span-full relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.8) 0%, hsl(var(--primary) / 0.6) 50%, hsl(var(--primary) / 0.4) 100%)',
                borderColor: 'hsl(var(--primary) / 0.5)',
                color: 'white'
            }}
        >
            <div className="flex justify-between items-center w-full mb-4">
                <h3 className="text-base font-semibold uppercase tracking-wider flex items-center space-x-2 text-white">
                    <User className="w-5 h-5" />
                    <span>WELCOME</span>
                </h3>
                <div className="text-sm font-medium text-white/85">
                    {user?.user_metadata?.display_name ||
                        user?.user_metadata?.full_name ||
                        (user?.email?.split("@")[0] || "Welcome")}
                </div>
            </div>
            <div className="flex flex-col justify-center flex-grow text-center">
                {words.length > 0 && (
                    <TypewriterEffectSmooth
                        words={words}
                        className="text-base font-semibold"
                        cursorClassName="bg-white"
                    />
                )}
            </div>
        </div>
    );
};

