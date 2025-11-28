---
description: Maintain current UI design system (olddude workflow)
---

# olddude - Current Design System Maintenance

This workflow is for maintaining and working within the **existing design system** of the AlmostTheBest Dashboard.

## Current Design System Overview

### Technology Stack
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **Theming**: CSS Custom Properties (HSL-based color system)
- **Typography**: Montserrat (primary), Sora (display), Lora (quotes)

### Color Palette

**Light Mode:**
- Primary: `#570DF8` (Purple)
- Secondary: `#F000B8` (Pink)
- Accent: `#1CD4B0` (Teal)
- Background: `#FFFFFF`
- Card: `#FFFFFF`

**Dark Mode:**
- Primary: `#ACBD87` (Sage Green)
- Background: `#1C1C1E` (Dark Gray)
- Card: `#2C2C2E` (Slightly lighter gray)
- Text: `#E5E5E5`

### Design Patterns

#### 1. Cards
```tsx
<Card className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-0">
  {/* Content */}
</Card>
```

#### 2. Badges
- Request Type: Colored pills with `bg-{color}-500 text-white`
- Status: Rounded-full badges with icon + text
- BDR Assignments: `bg-blue-500/10 text-blue-700 dark:text-blue-400`

#### 3. Icons
- Using `lucide-react` icon library
- Standard size: `h-4 w-4` for inline, `h-3.5 w-3.5` for badges

#### 4. Animations
- Hover: `hover:shadow-xl transition-all`
- Slide-in: `animate-slide-in-from-right` (0.3s ease-out)
- Tada: `animate-tada` (1s ease-in-out)
- Pulse: `animate-pulse-no-fade` (1.5s infinite)

#### 5. Layout
- Masonry grid: `dashboard-grid` utility (responsive column-count)
- Spacing: Consistent use of `gap-2`, `gap-3`, `space-y-3`
- Border radius: `0.75rem` (12px) standard

### Component Structure

**Key Components:**
- `RequestCard` - Card-based display for requests
- `LoginForm` - Authentication UI
- `SplashScreen` - Loading state
- UI primitives in `src/components/ui/`

### Styling Guidelines

1. **Always use HSL color variables**: `hsl(var(--primary))` instead of hardcoded colors
2. **Maintain consistent spacing**: Use Tailwind's spacing scale (1-6 for most cases)
3. **Dark mode support**: Use `dark:` prefix for dark mode variants
4. **Responsive design**: Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
5. **Accessibility**: Include proper ARIA labels and semantic HTML

## When to Use This Workflow

Use `/olddude` when you need to:
- Fix bugs in existing UI components
- Make minor adjustments to current designs
- Add new features that match the existing style
- Update content without changing the design system
- Maintain consistency with the current look and feel

## Rules

1. **DO NOT** introduce new color schemes or design patterns
2. **DO NOT** change the fundamental layout structure
3. **DO** maintain the current Tailwind + DaisyUI approach
4. **DO** use existing component patterns as templates
5. **DO** test in both light and dark modes
6. **DO** ensure responsive behavior matches existing patterns

## Example Tasks

✅ "Update the RequestCard to show a new field"
✅ "Fix the hover state on the login button"
✅ "Add a loading spinner to the dashboard"
✅ "Adjust spacing in the restaurant form"

❌ "Redesign the entire dashboard with a new look"
❌ "Change the color scheme to use blue instead of purple"
❌ "Implement a completely new layout system"

## Testing Checklist

Before completing work:
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test on mobile (responsive)
- [ ] Verify hover/focus states
- [ ] Check accessibility (keyboard navigation, screen readers)
- [ ] Ensure consistency with existing components
