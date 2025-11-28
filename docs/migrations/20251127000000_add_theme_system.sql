-- Migration: Add Theme System
-- Description: Creates tables for dynamic theme management with admin UI support
-- Date: 2025-11-27

-- ============================================================================
-- 1. THEMES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  config JSONB NOT NULL,
  is_system_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one system default
  CONSTRAINT only_one_system_default EXCLUDE (is_system_default WITH =) WHERE (is_system_default = true)
);

-- Add comment
COMMENT ON TABLE themes IS 'Stores theme configurations with colors and background images';
COMMENT ON COLUMN themes.config IS 'JSONB containing all theme colors, gradients, and background URLs';
COMMENT ON COLUMN themes.is_system_default IS 'Only one theme can be the system default';

-- ============================================================================
-- 2. USER PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE user_preferences IS 'Stores per-user theme preferences';

-- ============================================================================
-- 3. ORGANIZATION SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  default_theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  allow_user_theme_override BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE organization_settings IS 'Organization-wide theme settings';

-- ============================================================================
-- 4. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_themes_is_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_created_by ON themes(created_by);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme_id ON user_preferences(theme_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- Themes policies
CREATE POLICY "Anyone can view active themes"
  ON themes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admins can manage themes"
  ON themes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'ADMIN'
      AND user_roles.archived_at IS NULL
    )
  );

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- Organization settings policies
CREATE POLICY "Anyone can view org settings"
  ON organization_settings FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage org settings"
  ON organization_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'ADMIN'
      AND user_roles.archived_at IS NULL
    )
  );

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. SEED DATA - 4 Built-in Themes
-- ============================================================================

-- Default Theme
INSERT INTO themes (name, description, config, is_system_default, is_active) VALUES (
  'Default',
  'Purple and pink theme with emerald accents',
  '{
    "colors": {
      "requestTypes": {
        "restaurant": "#10b981",
        "event": "#3b82f6",
        "cuisine": "#a855f7"
      },
      "requestStatuses": {
        "new": ["#a855f7", "#ec4899"],
        "ongoing": ["#3b82f6", "#06b6d4"],
        "onHold": ["#f97316", "#f59e0b"],
        "done": ["#22c55e", "#10b981"],
        "cancelled": "#6b7280",
        "closed": "#64748b"
      },
      "restaurantStatuses": {
        "new": "#3b82f6",
        "onProgress": "#eab308",
        "onHold": "#6b7280",
        "done": "#22c55e"
      },
      "wizard": {
        "primary": "#f97316",
        "secondary": "#fdba74",
        "inactive": "#d1d5db"
      },
      "toasts": {
        "success": {
          "border": "#10b981",
          "bg": "#ecfdf5",
          "text": "#064e3b",
          "action": "#059669"
        },
        "info": {
          "border": "#0ea5e9",
          "bg": "#f0f9ff",
          "text": "#0c4a6e",
          "action": "#0284c7"
        },
        "warning": {
          "border": "#f59e0b",
          "bg": "#fffbeb",
          "text": "#78350f",
          "action": "#d97706"
        }
      },
      "accents": {
        "bdr": "#3b82f6",
        "cuisine": "#a855f7",
        "deadline": "#f97316",
        "overdue": "#ef4444"
      }
    },
    "backgroundImage": {
      "login": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&q=80",
      "dashboard": "https://lh3.googleusercontent.com/aida-public/AB6AXuCD4OxIGLcu8oDyPDHGLxIz1CfmoCJGDX2LWxGYyphZmIPM9HPT4A9BbMp1WPEU4lDtu0AoNkjN2KYS8IJVo5a4XibCGhe42DSb6UNXm6T6FCIYWt_pf9SOP_YpyvBoE6MCakhAMkJv3SfXVMRStn_K9fqzia1japPj3EkkoCx8o2WekGd8_XOcHoN3JuWvQQH-7AgZ_PWYwXtiK5l7wiGDSgl3iOSJbnSPhepox100J65GcACk0yQyLENNSEQwj1hmVkhspmcwEtE"
    }
  }'::jsonb,
  true,
  true
);

-- Ocean Theme
INSERT INTO themes (name, description, config, is_active) VALUES (
  'Ocean',
  'Blue and teal theme inspired by the ocean',
  '{
    "colors": {
      "requestTypes": {
        "restaurant": "#14b8a6",
        "event": "#0284c7",
        "cuisine": "#06b6d4"
      },
      "requestStatuses": {
        "new": ["#0284c7", "#06b6d4"],
        "ongoing": ["#0ea5e9", "#22d3ee"],
        "onHold": ["#0891b2", "#14b8a6"],
        "done": ["#10b981", "#14b8a6"],
        "cancelled": "#64748b",
        "closed": "#475569"
      },
      "restaurantStatuses": {
        "new": "#0284c7",
        "onProgress": "#06b6d4",
        "onHold": "#64748b",
        "done": "#14b8a6"
      },
      "wizard": {
        "primary": "#0891b2",
        "secondary": "#67e8f9",
        "inactive": "#cbd5e1"
      },
      "toasts": {
        "success": {
          "border": "#14b8a6",
          "bg": "#f0fdfa",
          "text": "#134e4a",
          "action": "#0d9488"
        },
        "info": {
          "border": "#0284c7",
          "bg": "#f0f9ff",
          "text": "#0c4a6e",
          "action": "#0369a1"
        },
        "warning": {
          "border": "#0891b2",
          "bg": "#ecfeff",
          "text": "#164e63",
          "action": "#0e7490"
        }
      },
      "accents": {
        "bdr": "#0284c7",
        "cuisine": "#06b6d4",
        "deadline": "#0891b2",
        "overdue": "#dc2626"
      }
    },
    "backgroundImage": {
      "login": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1080&q=80",
      "dashboard": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1080&q=80"
    }
  }'::jsonb,
  true
);

-- Forest Theme
INSERT INTO themes (name, description, config, is_active) VALUES (
  'Forest',
  'Green and lime theme inspired by nature',
  '{
    "colors": {
      "requestTypes": {
        "restaurant": "#16a34a",
        "event": "#65a30d",
        "cuisine": "#84cc16"
      },
      "requestStatuses": {
        "new": ["#65a30d", "#84cc16"],
        "ongoing": ["#16a34a", "#22c55e"],
        "onHold": ["#ca8a04", "#eab308"],
        "done": ["#059669", "#10b981"],
        "cancelled": "#78716c",
        "closed": "#57534e"
      },
      "restaurantStatuses": {
        "new": "#65a30d",
        "onProgress": "#84cc16",
        "onHold": "#78716c",
        "done": "#16a34a"
      },
      "wizard": {
        "primary": "#65a30d",
        "secondary": "#bef264",
        "inactive": "#d6d3d1"
      },
      "toasts": {
        "success": {
          "border": "#16a34a",
          "bg": "#f0fdf4",
          "text": "#14532d",
          "action": "#15803d"
        },
        "info": {
          "border": "#65a30d",
          "bg": "#f7fee7",
          "text": "#365314",
          "action": "#4d7c0f"
        },
        "warning": {
          "border": "#ca8a04",
          "bg": "#fefce8",
          "text": "#713f12",
          "action": "#a16207"
        }
      },
      "accents": {
        "bdr": "#16a34a",
        "cuisine": "#84cc16",
        "deadline": "#ca8a04",
        "overdue": "#dc2626"
      }
    },
    "backgroundImage": {
      "login": "https://images.unsplash.com/photo-1511497584788-876760111969?w=1080&q=80",
      "dashboard": "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1080&q=80"
    }
  }'::jsonb,
  true
);

-- Sunset Theme
INSERT INTO themes (name, description, config, is_active) VALUES (
  'Sunset',
  'Orange and red theme inspired by sunset',
  '{
    "colors": {
      "requestTypes": {
        "restaurant": "#f97316",
        "event": "#f59e0b",
        "cuisine": "#dc2626"
      },
      "requestStatuses": {
        "new": ["#dc2626", "#f97316"],
        "ongoing": ["#f97316", "#f59e0b"],
        "onHold": ["#f59e0b", "#eab308"],
        "done": ["#16a34a", "#22c55e"],
        "cancelled": "#78716c",
        "closed": "#57534e"
      },
      "restaurantStatuses": {
        "new": "#dc2626",
        "onProgress": "#f97316",
        "onHold": "#78716c",
        "done": "#16a34a"
      },
      "wizard": {
        "primary": "#f97316",
        "secondary": "#fdba74",
        "inactive": "#d6d3d1"
      },
      "toasts": {
        "success": {
          "border": "#f97316",
          "bg": "#fff7ed",
          "text": "#7c2d12",
          "action": "#ea580c"
        },
        "info": {
          "border": "#f59e0b",
          "bg": "#fffbeb",
          "text": "#78350f",
          "action": "#d97706"
        },
        "warning": {
          "border": "#dc2626",
          "bg": "#fef2f2",
          "text": "#7f1d1d",
          "action": "#b91c1c"
        }
      },
      "accents": {
        "bdr": "#f97316",
        "cuisine": "#dc2626",
        "deadline": "#f59e0b",
        "overdue": "#b91c1c"
      }
    },
    "backgroundImage": {
      "login": "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1080&q=80",
      "dashboard": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1080&q=80"
    }
  }'::jsonb,
  true
);

-- ============================================================================
-- 8. INITIALIZE ORGANIZATION SETTINGS
-- ============================================================================

-- Set default organization settings (use Default theme)
INSERT INTO organization_settings (default_theme_id, allow_user_theme_override)
SELECT id, true
FROM themes
WHERE is_system_default = true
LIMIT 1;

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's effective theme
CREATE OR REPLACE FUNCTION get_user_theme(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_theme_id UUID;
BEGIN
  -- 1. Check user preference
  SELECT theme_id INTO v_theme_id
  FROM user_preferences
  WHERE user_id = p_user_id;
  
  IF v_theme_id IS NOT NULL THEN
    RETURN v_theme_id;
  END IF;
  
  -- 2. Check org default
  SELECT default_theme_id INTO v_theme_id
  FROM organization_settings
  LIMIT 1;
  
  IF v_theme_id IS NOT NULL THEN
    RETURN v_theme_id;
  END IF;
  
  -- 3. Return system default
  SELECT id INTO v_theme_id
  FROM themes
  WHERE is_system_default = true
  LIMIT 1;
  
  RETURN v_theme_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get theme usage statistics
CREATE OR REPLACE FUNCTION get_theme_usage_stats()
RETURNS TABLE (
  theme_id UUID,
  theme_name TEXT,
  user_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    COUNT(up.user_id) as user_count
  FROM themes t
  LEFT JOIN user_preferences up ON t.id = up.theme_id
  WHERE t.is_active = true
  GROUP BY t.id, t.name
  ORDER BY user_count DESC, t.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
