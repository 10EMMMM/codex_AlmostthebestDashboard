-- ============================================================================
-- MIGRATION: Add Text/Foreground Colors to Themes
-- Description: Adds foreground and text colors to all themes for complete theming
-- Date: 2025-11-28
-- ============================================================================

-- Update Default Theme with text colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'text', jsonb_build_object(
      'foreground', '#1f2937',
      'cardForeground', '#1f2937',
      'mutedForeground', '#6b7280'
    )
  )
)
WHERE name = 'Default';

-- Update Ocean Theme with text colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'text', jsonb_build_object(
      'foreground', '#0c4a6e',
      'cardForeground', '#0c4a6e',
      'mutedForeground', '#075985'
    )
  )
)
WHERE name = 'Ocean';

-- Update Forest Theme with text colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'text', jsonb_build_object(
      'foreground', '#14532d',
      'cardForeground', '#14532d',
      'mutedForeground', '#166534'
    )
  )
)
WHERE name = 'Forest';

-- Update Sunset Theme with text colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'text', jsonb_build_object(
      'foreground', '#7c2d12',
      'cardForeground', '#7c2d12',
      'mutedForeground', '#9a3412'
    )
  )
)
WHERE name = 'Sunset';

-- Update Emerald Theme with text colors
UPDATE themes
SET config = config || jsonb_build_object(
  'colors', config->'colors' || jsonb_build_object(
    'text', jsonb_build_object(
      'foreground', '#14532d',
      'cardForeground', '#14532d',
      'mutedForeground', '#166534'
    )
  )
)
WHERE name = 'Emerald';
