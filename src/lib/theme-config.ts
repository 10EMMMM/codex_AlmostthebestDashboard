/**
 * Theme Configuration and Utilities
 * 
 * Provides helper functions for working with themes, including
 * fetching themes from the database and applying theme colors.
 */

import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Theme, UserPreference, OrganizationSettings } from './types/theme';

// Wrapper to maintain compatibility with existing code
const createClient = getSupabaseClient;

/**
 * Fetches all active themes from the database
 */
export async function getAllThemes(): Promise<Theme[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        console.error('Error fetching themes:', error);
        return [];
    }

    return data || [];
}

/**
 * Fetches a specific theme by ID
 */
export async function getThemeById(themeId: string): Promise<Theme | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('id', themeId)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching theme:', error);
        return null;
    }

    return data;
}

/**
 * Gets the system default theme
 */
export async function getSystemDefaultTheme(): Promise<Theme | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('is_system_default', true)
        .single();

    if (error) {
        console.error('Error fetching system default theme:', error);
        return null;
    }

    return data;
}

/**
 * Gets the user's theme preference
 */
export async function getUserThemePreference(userId: string): Promise<string | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('user_preferences')
        .select('theme_id')
        .eq('user_id', userId)
        .single();

    if (error) {
        // User doesn't have a preference yet
        return null;
    }

    return data?.theme_id || null;
}

/**
 * Sets the user's theme preference
 */
export async function setUserThemePreference(userId: string, themeId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_preferences')
        .upsert({
            user_id: userId,
            theme_id: themeId,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error setting user theme preference:', error);
        return false;
    }

    return true;
}

/**
 * Gets the organization's default theme
 */
export async function getOrganizationDefaultTheme(): Promise<string | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('organization_settings')
        .select('default_theme_id')
        .single();

    if (error) {
        console.error('Error fetching org default theme:', error);
        return null;
    }

    return data?.default_theme_id || null;
}

/**
 * Gets the effective theme for a user
 * Priority: User preference > Org default > System default
 */
export async function getUserEffectiveTheme(userId: string): Promise<Theme | null> {
    // 1. Check user preference
    const userThemeId = await getUserThemePreference(userId);
    if (userThemeId) {
        const theme = await getThemeById(userThemeId);
        if (theme) return theme;
    }

    // 2. Check org default
    const orgThemeId = await getOrganizationDefaultTheme();
    if (orgThemeId) {
        const theme = await getThemeById(orgThemeId);
        if (theme) return theme;
    }

    // 3. Return system default
    return await getSystemDefaultTheme();
}

/**
 * Creates a new theme (admin only)
 */
export async function createTheme(theme: Omit<Theme, 'id' | 'created_at' | 'updated_at'>): Promise<Theme | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('themes')
        .insert(theme)
        .select()
        .single();

    if (error) {
        console.error('Error creating theme:', error);
        return null;
    }

    return data;
}

/**
 * Updates an existing theme (admin only)
 */
export async function updateTheme(themeId: string, updates: Partial<Theme>): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('themes')
        .update(updates)
        .eq('id', themeId);

    if (error) {
        console.error('Error updating theme:', error);
        return false;
    }

    return true;
}

/**
 * Deletes a theme (admin only)
 * Note: This soft-deletes by setting is_active to false
 */
export async function deleteTheme(themeId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('themes')
        .update({ is_active: false })
        .eq('id', themeId);

    if (error) {
        console.error('Error deleting theme:', error);
        return false;
    }

    return true;
}

/**
 * Gets theme usage statistics (admin only)
 */
export async function getThemeUsageStats(): Promise<Array<{ theme_id: string; theme_name: string; user_count: number }>> {
    const supabase = createClient();

    const { data, error } = await supabase.rpc('get_theme_usage_stats');

    if (error) {
        console.error('Error fetching theme usage stats:', error);
        return [];
    }

    return data || [];
}

/**
 * Converts a hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        }
        : null;
}

/**
 * Generates a lighter shade of a color
 */
export function lightenColor(hex: string, amount: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.min(255, rgb.r + Math.round(255 * amount));
    const g = Math.min(255, rgb.g + Math.round(255 * amount));
    const b = Math.min(255, rgb.b + Math.round(255 * amount));

    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Generates a darker shade of a color
 */
export function darkenColor(hex: string, amount: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.max(0, rgb.r - Math.round(255 * amount));
    const g = Math.max(0, rgb.g - Math.round(255 * amount));
    const b = Math.max(0, rgb.b - Math.round(255 * amount));

    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
