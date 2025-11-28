/**
 * Theme System Type Definitions
 * 
 * Defines the structure for the dynamic theme system with database-driven themes.
 */

export interface ThemeColors {
    // Request Management
    requestTypes: {
        restaurant: string;
        event: string;
        cuisine: string;
    };

    requestStatuses: {
        new: [string, string]; // Gradient: [from, to]
        ongoing: [string, string];
        onHold: [string, string];
        done: [string, string];
        cancelled: string;
        closed: string;
    };

    // Restaurant Management
    restaurantStatuses: {
        new: string;
        onProgress: string;
        onHold: string;
        done: string;
    };

    // Wizard Components
    wizard: {
        primary: string;
        secondary: string;
        inactive: string;
    };

    // Toast Notifications
    toasts: {
        success: {
            border: string;
            bg: string;
            text: string;
            action: string;
        };
        info: {
            border: string;
            bg: string;
            text: string;
            action: string;
        };
        warning: {
            border: string;
            bg: string;
            text: string;
            action: string;
        };
    };

    // UI Components
    ui: {
        // Cards
        card: {
            background: string;
            border: string;
            hover: string;
        };
        // Sidebar/Menu
        sidebar: {
            background: string;
            border: string;
            text: string;
            textMuted: string;
            textActive: string;
            icon: string;
            iconActive: string;
            hover: string;
        };
        // Icons
        icons: {
            primary: string;
            secondary: string;
            success: string;
            warning: string;
            danger: string;
            muted: string;
        };
    };

    // Data Visualization
    visualization: {
        heatmap: string[]; // Array of 7 colors for heatmap gradient
        success: string;   // Success indicator color
        watermark: string; // Watermark text color
    };

    // Text/Foreground Colors
    text: {
        foreground: string;       // Main text color
        cardForeground: string;   // Card text color  
        mutedForeground: string;  // Muted/secondary text color
    };

    // Window Controls (macOS-style)
    windowControls: {
        close: string;      // Close button color
        minimize: string;   // Minimize button color
        maximize: string;   // Maximize button color
    };

    // Accent Colors
    accents: {
        bdr: string;         // BDR assignment badges
        cuisine: string;     // Cuisine badges
        deadline: string;    // Deadline badges
        overdue: string;     // Overdue badges
    };
}

export interface ThemeBackgroundImage {
    login: string;
    config: ThemeConfig;
    is_system_default: boolean;
    is_active: boolean;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface UserPreference {
    user_id: string;
    theme_id: string | null;
    updated_at: string;
}

export interface OrganizationSettings {
    id: string;
    default_theme_id: string | null;
    allow_user_theme_override: boolean;
    updated_at: string;
}

// Helper type for theme context
export interface ThemeContextValue {
    currentTheme: Theme;
    allThemes: Theme[];
    setTheme: (themeId: string) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
}

// Database row types
export type ThemeRow = Theme;
export type UserPreferenceRow = UserPreference;
export type OrganizationSettingsRow = OrganizationSettings;
