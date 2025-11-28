'use client';

/**
 * Theme Provider
 * 
 * Provides theme context to the entire application with support for:
 * - User theme preferences
 * - Organization default themes
 * - Real-time theme switching
 * - Persistence to database
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    getAllThemes,
    getUserEffectiveTheme,
    setUserThemePreference,
} from '@/lib/theme-config';
import type { Theme, ThemeContextValue } from '@/lib/types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
    const [allThemes, setAllThemes] = useState<Theme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Convert hex to HSL for Tailwind CSS variables
    const hexToHSL = useCallback((hex: string): string => {
        // Remove # if present
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    }, []);

    // Apply theme colors to DOM (CSS variables)
    const applyThemeToDOM = useCallback((theme: Theme) => {
        console.log('[ThemeProvider] Applying theme to DOM:', theme.name);
        const root = document.documentElement;
        const { colors } = theme.config;

        // PRIMARY COLOR - This is critical for text-primary, bg-primary, etc.
        // The wizard.primary color is used as the main theme accent
        root.style.setProperty('--primary', hexToHSL(colors.wizard.primary));

        // Update Tailwind CSS variables for cards
        root.style.setProperty('--card', hexToHSL(colors.ui.card.background));
        root.style.setProperty('--border', hexToHSL(colors.ui.card.border));

        // Update Talwind sidebar variables
        root.style.setProperty('--sidebar-background', hexToHSL(colors.ui.sidebar.background));
        root.style.setProperty('--sidebar-border', hexToHSL(colors.ui.sidebar.border));

        // Request types
        root.style.setProperty('--theme-request-restaurant', colors.requestTypes.restaurant);
        root.style.setProperty('--theme-request-event', colors.requestTypes.event);
        root.style.setProperty('--theme-request-cuisine', colors.requestTypes.cuisine);

        // Request statuses (gradients)
        root.style.setProperty('--theme-status-new-from', colors.requestStatuses.new[0]);
        root.style.setProperty('--theme-status-new-to', colors.requestStatuses.new[1]);
        root.style.setProperty('--theme-status-ongoing-from', colors.requestStatuses.ongoing[0]);
        root.style.setProperty('--theme-status-ongoing-to', colors.requestStatuses.ongoing[1]);
        root.style.setProperty('--theme-status-onhold-from', colors.requestStatuses.onHold[0]);
        root.style.setProperty('--theme-status-onhold-to', colors.requestStatuses.onHold[1]);
        root.style.setProperty('--theme-status-done-from', colors.requestStatuses.done[0]);
        root.style.setProperty('--theme-status-done-to', colors.requestStatuses.done[1]);
        root.style.setProperty('--theme-status-cancelled', colors.requestStatuses.cancelled);
        root.style.setProperty('--theme-status-closed', colors.requestStatuses.closed);

        // Restaurant statuses
        root.style.setProperty('--theme-restaurant-new', colors.restaurantStatuses.new);
        root.style.setProperty('--theme-restaurant-progress', colors.restaurantStatuses.onProgress);
        root.style.setProperty('--theme-restaurant-hold', colors.restaurantStatuses.onHold);
        root.style.setProperty('--theme-restaurant-done', colors.restaurantStatuses.done);

        // Wizard
        root.style.setProperty('--theme-wizard-primary', colors.wizard.primary);
        root.style.setProperty('--theme-wizard-secondary', colors.wizard.secondary);
        root.style.setProperty('--theme-wizard-inactive', colors.wizard.inactive);

        // Toasts
        root.style.setProperty('--theme-toast-success-border', colors.toasts.success.border);
        root.style.setProperty('--theme-toast-success-bg', colors.toasts.success.bg);
        root.style.setProperty('--theme-toast-success-text', colors.toasts.success.text);
        root.style.setProperty('--theme-toast-success-action', colors.toasts.success.action);

        root.style.setProperty('--theme-toast-info-border', colors.toasts.info.border);
        root.style.setProperty('--theme-toast-info-bg', colors.toasts.info.bg);
        root.style.setProperty('--theme-toast-info-text', colors.toasts.info.text);
        root.style.setProperty('--theme-toast-info-action', colors.toasts.info.action);

        root.style.setProperty('--theme-toast-warning-border', colors.toasts.warning.border);
        root.style.setProperty('--theme-toast-warning-bg', colors.toasts.warning.bg);
        root.style.setProperty('--theme-toast-warning-text', colors.toasts.warning.text);
        root.style.setProperty('--theme-toast-warning-action', colors.toasts.warning.action);

        // Accents
        root.style.setProperty('--theme-accent-bdr', colors.accents.bdr);
        root.style.setProperty('--theme-accent-cuisine', colors.accents.cuisine);
        root.style.setProperty('--theme-accent-deadline', colors.accents.deadline);
        root.style.setProperty('--theme-accent-overdue', colors.accents.overdue);

        // UI Components - Also set as --theme-* for direct access
        root.style.setProperty('--theme-card-background', colors.ui.card.background);
        root.style.setProperty('--theme-card-border', colors.ui.card.border);
        root.style.setProperty('--theme-card-hover', colors.ui.card.hover);

        root.style.setProperty('--theme-sidebar-text', colors.ui.sidebar.text);
        root.style.setProperty('--theme-sidebar-text-muted', colors.ui.sidebar.textMuted);
        root.style.setProperty('--theme-sidebar-text-active', colors.ui.sidebar.textActive);
        root.style.setProperty('--theme-sidebar-icon', colors.ui.sidebar.icon);
        root.style.setProperty('--theme-sidebar-icon-active', colors.ui.sidebar.iconActive);
        root.style.setProperty('--theme-sidebar-hover', colors.ui.sidebar.hover);

        // UI Components - Icons
        root.style.setProperty('--theme-icon-primary', colors.ui.icons.primary);
        root.style.setProperty('--theme-icon-secondary', colors.ui.icons.secondary);
        root.style.setProperty('--theme-icon-success', colors.ui.icons.success);
        root.style.setProperty('--theme-icon-warning', colors.ui.icons.warning);
        root.style.setProperty('--theme-icon-danger', colors.ui.icons.danger);
        root.style.setProperty('--theme-icon-muted', colors.ui.icons.muted);

        // Visualization Colors (optional)
        if (colors.visualization?.heatmap) {
            colors.visualization.heatmap.forEach((color, index) => {
                root.style.setProperty(`--theme-heatmap-${index}`, color);
            });
        }
        if (colors.visualization?.success) {
            root.style.setProperty('--theme-viz-success', colors.visualization.success);
        }
        if (colors.visualization?.watermark) {
            root.style.setProperty('--theme-viz-watermark', colors.visualization.watermark);
        }

        // Text/Foreground Colors - Update Tailwind variables (optional)
        if (colors.text?.foreground) {
            root.style.setProperty('--foreground', hexToHSL(colors.text.foreground));
        }
        if (colors.text?.cardForeground) {
            root.style.setProperty('--card-foreground', hexToHSL(colors.text.cardForeground));
        }
        if (colors.text?.mutedForeground) {
            root.style.setProperty('--muted-foreground', hexToHSL(colors.text.mutedForeground));
        }

        // Window Controls (optional)
        if (colors.windowControls?.close) {
            root.style.setProperty('--theme-window-close', colors.windowControls.close);
        }
        if (colors.windowControls?.minimize) {
            root.style.setProperty('--theme-window-minimize', colors.windowControls.minimize);
        }
        if (colors.windowControls?.maximize) {
            root.style.setProperty('--theme-window-maximize', colors.windowControls.maximize);
        }
    }, [hexToHSL]);

    // Load themes on mount and when user changes
    useEffect(() => {
        async function loadThemes() {
            try {
                console.log('[ThemeProvider] Loading themes..., user:', user?.id);
                setIsLoading(true);
                setError(null);

                // Load all available themes
                const themes = await getAllThemes();
                console.log('[ThemeProvider] Loaded', themes.length, 'themes');
                setAllThemes(themes);

                // Load user's effective theme
                if (user?.id) {
                    const effectiveTheme = await getUserEffectiveTheme(user.id);
                    if (effectiveTheme) {
                        console.log('[ThemeProvider] Setting user effective theme:', effectiveTheme.name);
                        setCurrentTheme(effectiveTheme);
                        applyThemeToDOM(effectiveTheme);
                    } else {
                        // Fallback to first theme if no effective theme found
                        if (themes.length > 0) {
                            console.log('[ThemeProvider] No effective theme, using first theme:', themes[0].name);
                            setCurrentTheme(themes[0]);
                            applyThemeToDOM(themes[0]);
                        }
                    }
                } else {
                    console.log('[ThemeProvider] No user logged in, using system default');
                    // User not logged in, use system default
                    const systemDefault = themes.find(t => t.is_system_default);
                    if (systemDefault) {
                        console.log('[ThemeProvider] Using system default:', systemDefault.name);
                        setCurrentTheme(systemDefault);
                        applyThemeToDOM(systemDefault);
                    } else if (themes.length > 0) {
                        console.log('[ThemeProvider] No system default, using first theme:', themes[0].name);
                        setCurrentTheme(themes[0]);
                        applyThemeToDOM(themes[0]);
                    }
                }
            } catch (err) {
                console.error('Error loading themes:', err);
                setError(err instanceof Error ? err : new Error('Failed to load themes'));
            } finally {
                setIsLoading(false);
            }
        }

        loadThemes();
    }, [user?.id, applyThemeToDOM]);

    // Set theme and persist to database
    const setTheme = useCallback(async (themeId: string) => {
        try {
            console.log('[ThemeProvider] setTheme called with ID:', themeId);
            const theme = allThemes.find(t => t.id === themeId);
            if (!theme) {
                throw new Error(`Theme with ID ${themeId} not found`);
            }

            // Update current theme immediately for instant UI update
            setCurrentTheme(theme);
            applyThemeToDOM(theme);

            // Persist to database if user is logged in
            if (user?.id) {
                const success = await setUserThemePreference(user.id, themeId);
                if (!success) {
                    console.error('Failed to persist theme preference');
                }
            }
        } catch (err) {
            console.error('Error setting theme:', err);
            setError(err instanceof Error ? err : new Error('Failed to set theme'));
        }
    }, [allThemes, user?.id, applyThemeToDOM]);

    // Don't render children until we have a theme
    if (isLoading || !currentTheme) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const value: ThemeContextValue = {
        currentTheme,
        allThemes,
        setTheme,
        isLoading,
        error,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

/**
 * Hook to get current theme colors
 */
export function useThemeColors() {
    const { currentTheme } = useTheme();
    return currentTheme.config.colors;
}

/**
 * Hook to get current theme background images
 */
export function useThemeBackgrounds() {
    const { currentTheme } = useTheme();
    return currentTheme.config.backgroundImage;
}
