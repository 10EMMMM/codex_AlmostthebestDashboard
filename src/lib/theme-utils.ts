/**
 * Theme Utility - Inline Style Helpers
 * 
 * Provides utility functions to easily apply theme colors as inline styles.
 * Use these when you need dynamic theme colors in your components.
 */

// Helper to get theme CSS variable
export function themeVar(varName: string): string {
    return `var(--theme-${varName})`;
}

// Helper to create inline style objects with theme colors
export const themeStyles = {
    // Request Types
    requestType: (type: 'restaurant' | 'event' | 'cuisine') => ({
        backgroundColor: themeVar(`request-${type}`),
        color: '#ffffff',
    }),

    // Request Statuses (Gradients)
    statusGradient: (status: 'new' | 'ongoing' | 'onhold' | 'done') => ({
        background: `linear-gradient(135deg, ${themeVar(`status-${status}-from`)}, ${themeVar(`status-${status}-to`)})`,
        color: '#ffffff',
    }),

    // Restaurant Statuses
    restaurantStatus: (status: 'new' | 'progress' | 'hold' | 'done') => ({
        backgroundColor: themeVar(`restaurant-${status}`),
        color: '#ffffff',
    }),

    // Accents
    accent: (type: 'bdr' | 'cuisine' | 'deadline' | 'overdue') => ({
        backgroundColor: themeVar(`accent-${type}`),
        color: '#ffffff',
    }),

    // Wizard
    wizardStep: (active: boolean) => ({
        backgroundColor: themeVar(active ? 'wizard-primary' : 'wizard-inactive'),
        color: active ? '#ffffff' : '#6b7280',
    }),

    // Cards
    card: () => ({
        backgroundColor: themeVar('card-background'),
        borderColor: themeVar('card-border'),
    }),

    cardHover: () => ({
        backgroundColor: themeVar('card-hover'),
    }),

    // Sidebar/Menu
    sidebarItem: (active: boolean) => ({
        backgroundColor: active ? themeVar('sidebar-hover') : 'transparent',
        color: active ? themeVar('sidebar-text-active') : themeVar('sidebar-text'),
    }),

    sidebarIcon: (active: boolean) => ({
        color: active ? themeVar('sidebar-icon-active') : themeVar('sidebar-icon'),
    }),
};

// CSS class names that use theme variables (for Tailwind)
export const themeClasses = {
    requestType: (type: 'restaurant' | 'event' | 'cuisine') =>
        `text-white`,

    accent: (type: 'bdr' | 'cuisine' | 'deadline' | 'overdue') =>
        `text-white`,
};
