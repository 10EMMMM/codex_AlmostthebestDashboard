-- ============================================================================
-- MIGRATION: Add Coffee Theme
-- Description: Adds DaisyUI Coffee dark theme with OKLCH colors
-- Date: 2025-11-28
-- ============================================================================

-- Insert Coffee Theme (Dark theme with warm brown/beige accents)
INSERT INTO themes (name, description, config, is_active) VALUES (
  'Coffee',
  'Dark coffee theme with warm brown and beige accents inspired by DaisyUI',
  '{
    "colors": {
      "requestTypes": {
        "restaurant": "#d4a574",
        "event": "#e0b88b",
        "cuisine": "#c89663"
      },
      "requestStatuses": {
        "new": ["oklch(79.49% 0.063 184.558)", "oklch(75% 0.07 190)"],
        "ongoing": ["oklch(71.996% 0.123 62.756)", "oklch(75% 0.13 65)"],
        "onHold": ["oklch(88.15% 0.14 87.722)", "oklch(85% 0.15 90)"],
        "done": ["oklch(74.722% 0.072 131.116)", "oklch(72% 0.08 135)"],
        "cancelled": "oklch(40% 0.02 330)",
        "closed": "oklch(35% 0.015 330)"
      },
      "restaurantStatuses": {
        "new": "oklch(79.49% 0.063 184.558)",
        "onProgress": "oklch(71.996% 0.123 62.756)",
        "onHold": "oklch(88.15% 0.14 87.722)",
        "done": "oklch(74.722% 0.072 131.116)"
      },
      "wizard": {
        "primary": "oklch(71.996% 0.123 62.756)",
        "secondary": "oklch(42.621% 0.074 224.389)",
        "inactive": "oklch(40% 0.02 330)"
      },
      "toasts": {
        "success": {
          "border": "oklch(74.722% 0.072 131.116)",
          "bg": "oklch(20% 0.02 131)",
          "text": "oklch(74.722% 0.072 131.116)",
          "action": "oklch(74.722% 0.072 131.116)"
        },
        "info": {
          "border": "oklch(79.49% 0.063 184.558)",
          "bg": "oklch(20% 0.02 185)",
          "text": "oklch(79.49% 0.063 184.558)",
          "action": "oklch(79.49% 0.063 184.558)"
        },
        "warning": {
          "border": "oklch(88.15% 0.14 87.722)",
          "bg": "oklch(20% 0.03 88)",
          "text": "oklch(88.15% 0.14 87.722)",
          "action": "oklch(88.15% 0.14 87.722)"
        }
      },
      "accents": {
        "bdr": "oklch(71.996% 0.123 62.756)",
        "cuisine": "oklch(42.621% 0.074 224.389)",
        "deadline": "oklch(88.15% 0.14 87.722)",
        "overdue": "oklch(77.318% 0.128 31.871)"
      },
      "ui": {
        "card": {
          "background": "oklch(21% 0.021 329.708)",
          "border": "oklch(30% 0.025 329.708)",
          "hover": "oklch(24% 0.023 329.708)"
        },
        "sidebar": {
          "background": "oklch(21% 0.021 329.708)",
          "border": "oklch(30% 0.025 329.708)",
          "text": "oklch(72.354% 0.092 79.129)",
          "textMuted": "oklch(50% 0.05 79.129)",
          "textActive": "oklch(71.996% 0.123 62.756)",
          "icon": "oklch(50% 0.05 79.129)",
          "iconActive": "oklch(71.996% 0.123 62.756)",
          "hover": "oklch(24% 0.023 329.708)"
        },
        "icons": {
          "primary": "oklch(71.996% 0.123 62.756)",
          "secondary": "oklch(42.621% 0.074 224.389)",
          "success": "oklch(74.722% 0.072 131.116)",
          "warning": "oklch(88.15% 0.14 87.722)",
          "danger": "oklch(77.318% 0.128 31.871)",
          "muted": "oklch(50% 0.05 79.129)"
        }
      },
      "visualization": {
        "heatmap": [
          "oklch(24% 0.023 329.708)",
          "oklch(35% 0.04 62.756)",
          "oklch(45% 0.06 62.756)",
          "oklch(55% 0.08 62.756)",
          "oklch(65% 0.10 62.756)",
          "oklch(71.996% 0.123 62.756)",
          "oklch(80% 0.14 62.756)"
        ],
        "success": "oklch(74.722% 0.072 131.116)",
        "watermark": "oklch(30% 0.02 329.708)"
      },
      "text": {
        "foreground": "oklch(72.354% 0.092 79.129)",
        "cardForeground": "oklch(72.354% 0.092 79.129)",
        "mutedForeground": "oklch(50% 0.05 79.129)"
      },
      "windowControls": {
        "close": "oklch(77.318% 0.128 31.871)",
        "minimize": "oklch(88.15% 0.14 87.722)",
        "maximize": "oklch(74.722% 0.072 131.116)"
      }
    },
    "backgroundImage": {
      "login": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1080&q=80",
      "dashboard": "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1080&q=80"
    },
    "daisyui": {
      "base-100": "oklch(24% 0.023 329.708)",
      "base-200": "oklch(21% 0.021 329.708)",
      "base-300": "oklch(16% 0.019 329.708)",
      "base-content": "oklch(72.354% 0.092 79.129)",
      "primary": "oklch(71.996% 0.123 62.756)",
      "primary-content": "oklch(14.399% 0.024 62.756)",
      "secondary": "oklch(34.465% 0.029 199.194)",
      "secondary-content": "oklch(86.893% 0.005 199.194)",
      "accent": "oklch(42.621% 0.074 224.389)",
      "accent-content": "oklch(88.524% 0.014 224.389)",
      "neutral": "oklch(16.51% 0.015 326.261)",
      "neutral-content": "oklch(83.302% 0.003 326.261)",
      "info": "oklch(79.49% 0.063 184.558)",
      "info-content": "oklch(15.898% 0.012 184.558)",
      "success": "oklch(74.722% 0.072 131.116)",
      "success-content": "oklch(14.944% 0.014 131.116)",
      "warning": "oklch(88.15% 0.14 87.722)",
      "warning-content": "oklch(17.63% 0.028 87.722)",
      "error": "oklch(77.318% 0.128 31.871)",
      "error-content": "oklch(15.463% 0.025 31.871)"
    }
  }'::jsonb,
  false
);
