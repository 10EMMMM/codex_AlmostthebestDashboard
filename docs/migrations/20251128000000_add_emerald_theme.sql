-- ============================================================================
-- MIGRATION: Add Emerald Theme
-- Description: Adds DaisyUI Emerald theme with OKLCH-style colors
-- Date: 2025-11-28
-- ============================================================================

-- Insert Emerald Theme
INSERT INTO themes (name, description, config, is_active) VALUES (
  'Emerald',
  'Fresh emerald green theme inspired by DaisyUI',
  '{
    "colors": {
      "requestTypes": {
        "restaurant": "#10b981",
        "event": "#3b82f6",
        "cuisine": "#8b5cf6"
      },
      "requestStatuses": {
        "new": ["#3b82f6", "#60a5fa"],
        "ongoing": ["#10b981", "#34d399"],
        "onHold": ["#f59e0b", "#fbbf24"],
        "done": ["#10b981", "#34d399"],
        "cancelled": "#6b7280",
        "closed": "#4b5563"
      },
      "restaurantStatuses": {
        "new": "#3b82f6",
        "onProgress": "#10b981",
        "onHold": "#f59e0b",
        "done": "#10b981"
      },
      "wizard": {
        "primary": "#10b981",
        "secondary": "#d1fae5",
        "inactive": "#d1d5db"
      },
      "toasts": {
        "success": {
          "border": "#10b981",
          "bg": "#d1fae5",
          "text": "#065f46",
          "action": "#059669"
        },
        "info": {
          "border": "#3b82f6",
          "bg": "#dbeafe",
          "text": "#1e3a8a",
          "action": "#2563eb"
        },
        "warning": {
          "border": "#f59e0b",
          "bg": "#fef3c7",
          "text": "#78350f",
          "action": "#d97706"
        }
      },
      "accents": {
        "bdr": "#10b981",
        "cuisine": "#8b5cf6",
        "deadline": "#f59e0b",
        "overdue": "#ef4444"
      },
      "ui": {
        "card": {
          "background": "#ffffff",
          "border": "#d1d5db",
          "hover": "#f9fafb"
        },
        "sidebar": {
          "background": "#ffffff",
          "border": "#d1d5db",
          "text": "#1f2937",
          "textMuted": "#6b7280",
          "textActive": "#10b981",
          "icon": "#9ca3af",
          "iconActive": "#10b981",
          "hover": "#f3f4f6"
        },
        "icons": {
          "primary": "#10b981",
          "secondary": "#8b5cf6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "danger": "#ef4444",
          "muted": "#9ca3af"
        }
      }
    },
    "backgroundImage": {
      "login": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&q=80",
      "dashboard": "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1080&q=80"
    }
  }'::jsonb,
  true
);
