-- ============================================================================
-- MIGRATION: Add Window Controls Colors to Themes
-- Description: Adds macOS-style window control colors to all themes
-- Date: 2025-11-28
-- ============================================================================

-- Update Default Theme with window control colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'windowControls', jsonb_build_object(
      'close', '#ff5f56',
      'minimize', '#ffbd2e',
      'maximize', '#27c93f'
    )
  )
)
WHERE name = 'Default';

-- Update Ocean Theme with window control colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'windowControls', jsonb_build_object(
      'close', '#f87171',
      'minimize', '#fbbf24',
      'maximize', '#34d399'
    )
  )
)
WHERE name = 'Ocean';

-- Update Forest Theme with window control colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'windowControls', jsonb_build_object(
      'close', '#f87171',
      'minimize', '#fbbf24',
      'maximize', '#22c55e'
    )
  )
)
WHERE name = 'Forest';

-- Update Sunset Theme with window control colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'windowControls', jsonb_build_object(
      'close', '#ef4444',
      'minimize', '#fb923c',
      'maximize', '#f59e0b'
    )
  )
)
WHERE name = 'Sunset';

-- Update Emerald Theme with window control colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'windowControls', jsonb_build_object(
      'close', '#f87171',
      'minimize', '#fbbf24',
      'maximize', '#10b981'
    )
  )
)
WHERE name = 'Emerald';
