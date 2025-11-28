-- ============================================================================
-- MIGRATION: Add Visualization Colors to Themes
-- Description: Adds heatmap and data visualization colors to all themes
-- Date: 2025-11-28
-- ============================================================================

-- Update Default Theme with visualization colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'visualization', jsonb_build_object(
      'heatmap', jsonb_build_array(
        '#f3f4f6',
        '#ddd6fe',
        '#c4b5fd',
        '#a78bfa',
        '#8b5cf6',
        '#7c3aed',
        '#6d28d9'
      ),
      'success', '#10b981',
      'watermark', 'rgba(255, 255, 255, 0.35)'
    )
  )
)
WHERE name = 'Default';

-- Update Ocean Theme with visualization colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'visualization', jsonb_build_object(
      'heatmap', jsonb_build_array(
        '#f0f9ff',
        '#bae6fd',
        '#7dd3fc',
        '#38bdf8',
        '#0ea5e9',
        '#0284c7',
        '#0369a1'
      ),
      'success', '#14b8a6',
      'watermark', 'rgba(14, 165, 233, 0.35)'
    )
  )
)
WHERE name = 'Ocean';

-- Update Forest Theme with visualization colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'visualization', jsonb_build_object(
      'heatmap', jsonb_build_array(
        '#f0fdf4',
        '#bbf7d0',
        '#86efac',
        '#4ade80',
        '#22c55e',
        '#16a34a',
        '#15803d'
      ),
      'success', '#16a34a',
      'watermark', 'rgba(34, 197, 94, 0.35)'
    )
  )
)
WHERE name = 'Forest';

-- Update Sunset Theme with visualization colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'visualization', jsonb_build_object(
      'heatmap', jsonb_build_array(
        '#fff7ed',
        '#fed7aa',
        '#fdba74',
        '#fb923c',
        '#f97316',
        '#ea580c',
        '#c2410c'
      ),
      'success', '#16a34a',
      'watermark', 'rgba(249, 115, 22, 0.35)'
    )
  )
)
WHERE name = 'Sunset';

-- Update Emerald Theme with visualization colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'visualization', jsonb_build_object(
      'heatmap', jsonb_build_array(
        '#f0fdf4',
        '#d1fae5',
        '#a7f3d0',
        '#6ee7b7',
        '#34d399',
        '#10b981',
        '#059669'
      ),
      'success', '#10b981',
      'watermark', 'rgba(16, 185, 129, 0.35)'
    )
  )
)
WHERE name = 'Emerald';
