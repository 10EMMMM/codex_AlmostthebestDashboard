'use client';

/**
 * Floating Theme Switcher
 * 
 * A floating button in the bottom-right corner that opens a theme selector.
 * Provides quick access to theme switching from anywhere in the app.
 */

import React, { useState } from 'react';
import { useTheme } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Palette, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingThemeSwitcher() {
    const { currentTheme, allThemes, setTheme, isLoading } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleThemeSelect = async (themeId: string) => {
        await setTheme(themeId);
        setIsOpen(false);
    };

    if (isLoading) {
        return null;
    }

    return (
        <>
            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(true)}
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
                style={{
                    background: `linear-gradient(135deg, ${currentTheme.config.colors.wizard.primary}, ${currentTheme.config.colors.wizard.secondary})`,
                }}
            >
                <Palette className="h-6 w-6 text-white" />
                <span className="sr-only">Change theme</span>
            </Button>

            {/* Theme Selection Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[280px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <Palette className="h-4 w-4" />
                            Theme
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-2 mt-2">
                        {allThemes.map((theme) => {
                            const isActive = theme.id === currentTheme.id;
                            const colors = theme.config.colors;

                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => handleThemeSelect(theme.id)}
                                    className={cn(
                                        "relative p-2 rounded-lg border transition-all duration-200 text-left hover:shadow-sm",
                                        isActive
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute top-2 right-2">
                                            <Check className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    )}

                                    {/* Theme name with inline color indicators */}
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-sm">{theme.name}</h3>
                                        <div className="flex gap-0.5">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: colors.wizard.primary }}
                                            />
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: colors.wizard.secondary }}
                                            />
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: colors.accents.bdr }}
                                            />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
