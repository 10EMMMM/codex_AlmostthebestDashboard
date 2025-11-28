-- ============================================================================
-- MIGRATION: Extend Theme System with UI Component Colors
-- Description: Adds card, menu/sidebar, and icon colors to theme configuration
-- Date: 2025-11-27
-- ============================================================================

-- This migration extends the existing theme system to include:
-- 1. Card styling (background, border, hover states)
-- 2. Sidebar/menu colors (background, text, icons, active states)
-- 3. Icon colors for consistent theming

-- Update Default Theme
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'ui', jsonb_build_object(
      'card', jsonb_build_object(
        'background', '#ffffff',
        'border', '#e5e7eb',
        'hover', '#f9fafb'
      ),
      'sidebar', jsonb_build_object(
        'background', '#ffffff',
        'border', '#e5e7eb',
        'text', '#374151',
        'textMuted', '#6b7280',
        'textActive', '#a855f7',
        'icon', '#9ca3af',
        'iconActive', '#a855f7',
        'hover', '#f3f4f6'
      ),
      'icons', jsonb_build_object(
        'primary', '#a855f7',
        'secondary', '#6b7280',
        'success', '#10b981',
        'warning', '#f59e0b',
        'danger', '#ef4444',
        'muted', '#9ca3af'
      )
    )
  )
)
WHERE name = 'Default';

-- Update Ocean Theme
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'ui', jsonb_build_object(
      'card', jsonb_build_object(
        'background', '#f0f9ff',
        'border', '#bae6fd',
        'hover', '#e0f2fe'
      ),
      'sidebar', jsonb_build_object(
        'background', '#f0f9ff',
        'border', '#bae6fd',
        'text', '#0c4a6e',
        'textMuted', '#075985',
        'textActive', '#0284c7',
        'icon', '#0891b2',
        'iconActive', '#0284c7',
        'hover', '#e0f2fe'
      ),
      'icons', jsonb_build_object(
        'primary', '#0284c7',
        'secondary', '#0891b2',
        'success', '#14b8a6',
        'warning', '#0891b2',
        'danger', '#dc2626',
        'muted', '#64748b'
      )
    )
  )
)
WHERE name = 'Ocean';

-- Update Forest Theme
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'ui', jsonb_build_object(
      'card', jsonb_build_object(
        'background', '#f0fdf4',
        'border', '#bbf7d0',
        'hover', '#dcfce7'
      ),
      'sidebar', jsonb_build_object(
        'background', '#f0fdf4',
        'border', '#bbf7d0',
        'text', '#14532d',
        'textMuted', '#166534',
        'textActive', '#16a34a',
        'icon', '#22c55e',
        'iconActive', '#16a34a',
        'hover', '#dcfce7'
      ),
      'icons', jsonb_build_object(
        'primary', '#16a34a',
        'secondary', '#65a30d',
        'success', '#059669',
        'warning', '#ca8a04',
        'danger', '#dc2626',
        'muted', '#78716c'
      )
    )
  )
)
WHERE name = 'Forest';

-- Update Sunset Theme  
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'ui', jsonb_build_object(
      'card', jsonb_build_object(
        'background', '#fff7ed',
        'border', '#fed7aa',
        'hover', '#ffedd5'
      ),
      'sidebar', jsonb_build_object(
        'background', '#fff7ed',
        'border', '#fed7aa',
        'text', '#7c2d12',
        'textMuted', '#9a3412',
        'textActive', '#ea580c',
        'icon', '#fb923c',
        'iconActive', '#ea580c',
        'hover', '#ffedd5'
      ),
      'icons', jsonb_build_object(
        'primary', '#ea580c',
        'secondary', '#f97316',
        'success', '#16a34a',
        'warning', '#f59e0b',
        'danger', '#dc2626',
        'muted', '#78716c'
      )
    )
  )
)
WHERE name = 'Sunset';
