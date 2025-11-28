'use client';

/**
 * Theme Switcher Component
 * 
 * Dropdown UI for users to select and preview themes.
 * Shows all available themes with color previews.
 */

import React, { useState } from 'react';
import { useTheme } from '@/components/providers/theme-provider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';

export function ThemeSwitcher() {
    const { currentTheme, allThemes, setTheme, isLoading } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleThemeSelect = async (themeId: string) => {
        await setTheme(themeId);
        setIsOpen(false);
    };

    if (isLoading) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Palette className="h-5 w-5 animate-pulse" />
            </Button>
        );
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Palette className="h-5 w-5" />
                    <span className="sr-only">Select theme</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {allThemes.map((theme) => {
                    const isActive = theme.id === currentTheme.id;
                    const colors = theme.config.colors;

                    return (
                        <DropdownMenuItem
                            key={theme.id}
                            onClick={() => handleThemeSelect(theme.id)}
                            className="cursor-pointer py-1.5"
                        >
                            <div className="flex items-center justify-between w-full gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {/* Single color indicator */}
                                    <div
                                        className="w-3 h-3 rounded-full border border-gray-300/50 flex-shrink-0"
                                        style={{ backgroundColor: colors.wizard.primary }}
                                        title={theme.name}
                                    />

                                    {/* Theme name */}
                                    <span className="text-sm font-medium truncate">{theme.name}</span>
                                </div>

                                {/* Active indicator */}
                                {isActive && (
                                    <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                )}
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
