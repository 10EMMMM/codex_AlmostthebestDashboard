-- ============================================================================
-- MIGRATION: Add Forest Theme
-- Description: Adds DaisyUI Forest dark theme with OKLCH colors
-- Date: 2025-11-28
-- ============================================================================

-- Insert Forest Theme (Dark theme with green/teal accents)
INSERT INTO themes (name, description, config, is_active) VALUES (
  'Forest',
  'Dark forest theme with green and teal accents inspired by DaisyUI',
  '{
    "colors": {
      "requestTypes": {
        "restaurant": "#1eb854",
        "event": "#1fd65f",
        "cuisine": "#02a950"
      },
      "requestStatuses": {
        "new": ["#66c6ff", "#5ec4ff"],
        "ongoing": ["#1eb854", "#1fd65f"],
        "onHold": ["#fbbd23", "#fcd34d"],
        "done": ["#1eb854", "#1fd65f"],
        "cancelled": "#4f5a5f",
        "closed": "#3d4649"
      },
      "restaurantStatuses": {
        "new": "#66c6ff",
        "onProgress": "#1eb854",
        "onHold": "#fbbd23",
        "done": "#1eb854"
      },
      "wizard": {
        "primary": "#1eb854",
        "secondary": "#1fd65f",
        "inactive": "#4f5a5f"
      },
      "toasts": {
        "success": {
          "border": "#1eb854",
          "bg": "#0d2818",
          "text": "#1fd65f",
          "action": "#1eb854"
        },
        "info": {
          "border": "#66c6ff",
          "bg": "#0d1f2e",
          "text": "#5ec4ff",
          "action": "#66c6ff"
        },
        "warning": {
          "border": "#fbbd23",
          "bg": "#2e2410",
          "text": "#fcd34d",
          "action": "#fbbd23"
        }
      },
      "accents": {
        "bdr": "#1eb854",
        "cuisine": "#1fd65f",
        "deadline": "#fbbd23",
        "overdue": "#f87272"
      },
      "ui": {
        "card": {
          "background": "#171e1a",
          "border": "#2a3832",
          "hover": "#1f2923"
        },
        "sidebar": {
          "background": "#171e1a",
          "border": "#2a3832",
          "text": "#d5dbd7",
          "textMuted": "#7a8985",
          "textActive": "#1eb854",
          "icon": "#7a8985",
          "iconActive": "#1eb854",
          "hover": "#1f2923"
        },
        "icons": {
          "primary": "#1eb854",
          "secondary": "#1fd65f",
          "success": "#1eb854",
          "warning": "#fbbd23",
          "danger": "#f87272",
          "muted": "#7a8985"
        }
      }
    },
    "backgroundImage": {
      "login": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&q=80",
      "dashboard": "https://images.unsplash.com/photo-1511497584788-876760111969?w=1080&q=80"
    },
    "daisyui": {
      "base-100": "oklch(20.84% 0.008 17.911)",
      "base-200": "oklch(18.522% 0.007 17.911)",
      "base-300": "oklch(16.203% 0.007 17.911)",
      "base-content": "oklch(83.768% 0.001 17.911)",
      "primary": "oklch(68.628% 0.185 148.958)",
      "primary-content": "oklch(0% 0 0)",
      "secondary": "oklch(69.776% 0.135 168.327)",
      "secondary-content": "oklch(13.955% 0.027 168.327)",
      "accent": "oklch(70.628% 0.119 185.713)",
      "accent-content": "oklch(14.125% 0.023 185.713)",
      "neutral": "oklch(30.698% 0.039 171.364)",
      "neutral-content": "oklch(86.139% 0.007 171.364)",
      "info": "oklch(72.06% 0.191 231.6)",
      "info-content": "oklch(0% 0 0)",
      "success": "oklch(64.8% 0.15 160)",
      "success-content": "oklch(0% 0 0)",
      "warning": "oklch(84.71% 0.199 83.87)",
      "warning-content": "oklch(0% 0 0)",
      "error": "oklch(71.76% 0.221 22.18)",
      "error-content": "oklch(0% 0 0)"
    }
  }'::jsonb,
  true
);
