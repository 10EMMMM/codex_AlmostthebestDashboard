---
description: macOS-style UI redesign proposals (newdude workflow)
---

# newdude - macOS Style UI Redesign

This workflow is for creating and implementing **macOS-inspired UI designs** for the AlmostTheBest Dashboard.

## macOS Design System Rules

These are **HARD RULES** that must be followed for all newdude work:

### 1. Visual Hierarchy & Spacing

- **Window Chrome**: All main views should have macOS-style window chrome with traffic lights (close, minimize, maximize)
- **Toolbar**: Top toolbar with subtle gradient background (`#f5f5f7` light, `#1e1e1e` dark)
- **Sidebar**: Left sidebar with translucent background (vibrancy effect)
- **Content Area**: Clean white/dark background with generous padding (24px minimum)

### 2. Typography

**System Fonts (Required):**
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
```

**Type Scale:**
- Large Title: 34px / 41px line-height, weight 700
- Title 1: 28px / 34px, weight 700
- Title 2: 22px / 28px, weight 600
- Title 3: 20px / 25px, weight 600
- Headline: 17px / 22px, weight 600
- Body: 17px / 22px, weight 400
- Callout: 16px / 21px, weight 400
- Subheadline: 15px / 20px, weight 400
- Footnote: 13px / 18px, weight 400
- Caption: 12px / 16px, weight 400

### 3. Color Palette

**Light Mode:**
- System Background: `#ffffff`
- Secondary Background: `#f5f5f7`
- Tertiary Background: `#e8e8ed`
- Label (Primary): `#000000`
- Secondary Label: `rgba(60, 60, 67, 0.6)`
- Tertiary Label: `rgba(60, 60, 67, 0.3)`
- Separator: `rgba(60, 60, 67, 0.29)`
- Accent Blue: `#007AFF`
- Accent Green: `#34C759`
- Accent Red: `#FF3B30`

**Dark Mode:**
- System Background: `#1c1c1e`
- Secondary Background: `#2c2c2e`
- Tertiary Background: `#3a3a3c`
- Label (Primary): `#ffffff`
- Secondary Label: `rgba(235, 235, 245, 0.6)`
- Tertiary Label: `rgba(235, 235, 245, 0.3)`
- Separator: `rgba(84, 84, 88, 0.65)`
- Accent Blue: `#0A84FF`
- Accent Green: `#30D158`
- Accent Red: `#FF453A`

### 4. Border Radius

- Small: 4px (buttons, badges)
- Medium: 8px (cards, inputs)
- Large: 12px (modals, panels)
- Extra Large: 16px (main windows)

### 5. Shadows & Elevation

**Light Mode:**
```css
/* Level 1 - Subtle */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Level 2 - Cards */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

/* Level 3 - Modals */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

/* Level 4 - Popovers */
box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
```

**Dark Mode:**
```css
/* Level 1 */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

/* Level 2 */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

/* Level 3 */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);

/* Level 4 */
box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
```

### 6. Buttons

**Primary Button:**
- Background: Accent Blue
- Padding: 8px 20px
- Border Radius: 8px
- Font: 15px, weight 600
- Hover: Slightly darker shade
- Active: Even darker + scale(0.98)

**Secondary Button:**
- Background: `rgba(120, 120, 128, 0.16)` light, `rgba(120, 120, 128, 0.32)` dark
- Text: Label color
- Same padding and radius as primary

**Tertiary Button:**
- No background
- Text: Accent Blue
- Hover: Background `rgba(0, 122, 255, 0.1)`

### 7. Lists & Tables

- Row height: 44px minimum (touch-friendly)
- Separator: 1px solid separator color
- Hover: Background `rgba(0, 0, 0, 0.04)` light, `rgba(255, 255, 255, 0.04)` dark
- Selection: Accent Blue background with white text
- Disclosure indicators: Chevron right, 13px, secondary label color

### 8. Sidebar

- Width: 240px (collapsed: 64px)
- Background: Translucent with blur effect
- Item height: 32px
- Icon size: 18px
- Active state: Rounded rectangle with accent color background
- Hover: Subtle background change

### 9. Animations & Transitions

**Timing Functions:**
- Standard: `cubic-bezier(0.4, 0.0, 0.2, 1)` - 200ms
- Deceleration: `cubic-bezier(0.0, 0.0, 0.2, 1)` - 250ms
- Acceleration: `cubic-bezier(0.4, 0.0, 1, 1)` - 200ms
- Sharp: `cubic-bezier(0.4, 0.0, 0.6, 1)` - 150ms

**Common Animations:**
- Fade in/out: opacity transition
- Slide in: transform translateY + opacity
- Scale: transform scale(0.95) to scale(1)
- Spring: Use CSS spring animations for interactive elements

### 10. Icons

- Use SF Symbols style icons (lucide-react works well)
- Size: 16px (small), 20px (medium), 24px (large)
- Weight: Regular (400) or Medium (500)
- Color: Match text label colors

### 11. Forms & Inputs

**Text Input:**
- Height: 36px
- Padding: 8px 12px
- Border: 1px solid separator
- Border Radius: 8px
- Focus: 2px solid Accent Blue, no shadow
- Background: Secondary background

**Dropdown/Select:**
- Same as text input
- Chevron down icon on right
- Padding right: 32px

**Checkbox:**
- Size: 18px
- Border Radius: 4px
- Checked: Accent Blue background with white checkmark
- Indeterminate: Accent Blue with white dash

### 12. Modals & Sheets

- Background: System background
- Border Radius: 16px
- Padding: 24px
- Header: Title 2 typography
- Footer: Right-aligned buttons with 12px gap
- Backdrop: `rgba(0, 0, 0, 0.4)` with blur

## When to Use This Workflow

Use `/newdude` when you need to:
- Create new UI designs for features
- Redesign existing components with macOS style
- Propose visual improvements
- Create design mockups and prototypes
- Implement the approved macOS redesign

## Workflow Process

1. **Analyze Current Flow**: Understand the feature/page functionality
2. **Create Design Proposal**: Generate mockup images showing macOS-style design
3. **Document Changes**: List all components and styles that will change
4. **Get Approval**: Present to user for review
5. **Implement**: Code the approved design following macOS rules
6. **Verify**: Test in both light/dark modes, ensure consistency

## Example Tasks

✅ "Design a macOS-style request detail modal"
✅ "Create a sidebar navigation with macOS vibrancy"
✅ "Redesign the dashboard with macOS window chrome"
✅ "Propose a macOS-style table view for restaurants"

❌ "Just add a button to the existing page" (use olddude)
❌ "Fix a bug in the current UI" (use olddude)

## Deliverables

For each newdude task, provide:

1. **Design Mockups**: Generated images showing the proposed design
2. **Design Spec Document**: Detailed breakdown of:
   - Colors used (with exact values)
   - Typography (sizes, weights, line-heights)
   - Spacing (padding, margins, gaps)
   - Components needed
   - Animations/transitions
3. **Implementation Plan**: Step-by-step code changes
4. **Comparison**: Before/after screenshots

## Testing Checklist

Before completing work:
- [ ] Follows all macOS design rules above
- [ ] Works in light mode with macOS light colors
- [ ] Works in dark mode with macOS dark colors
- [ ] Typography uses SF Pro or system fonts
- [ ] Animations use macOS timing functions
- [ ] Spacing follows 8px grid system
- [ ] Icons are consistent size and style
- [ ] Hover/focus states match macOS patterns
- [ ] Responsive behavior is elegant
- [ ] Feels native to macOS

## Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [macOS Design Patterns](https://developer.apple.com/design/human-interface-guidelines/macos)
