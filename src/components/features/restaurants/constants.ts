// Restaurant-related constants

// Restaurant statuses (confirmed to exist in database schema)
export const RESTAURANT_STATUSES = ['new', 'on progress', 'on hold', 'done'] as const;

export const RESTAURANT_STATUS_CONFIG = {
    new: {
        label: 'New',
        badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    },
    'on progress': {
        label: 'On Progress',
        badgeClass: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    },
    'on hold': {
        label: 'On Hold',
        badgeClass: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    },
    done: {
        label: 'Done',
        badgeClass: 'bg-green-500/10 text-green-700 dark:text-green-400',
    },
} as const;
