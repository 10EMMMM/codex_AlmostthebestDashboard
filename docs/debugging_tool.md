# Debugging Tool Controls

## Dashboard Layout Debugging

- [ ] Live Container Size Overlay (temporarily disabled)
  - Description: Previously rendered a floating box (bottom-right) showing card/content/grid dimensions. Can be re-enabled by reintroducing the state + ResizeObserver overlay from src/app/dashboard/page.tsx.

- [ ] Interchangeable View Modes (Full vs Compact)
  - Description: Toggle existed on the dashboard header; hides secondary widgets in compact mode. Removed in favor of scrollable grid; re-add if window height constraints need quick switching.

- [x] Widget Grid Internal Scroll (current)
  - Description: Grid now sits inside a h-full overflow-y-auto wrapper inside the scaled container so the dashboard stays scrollable independently. Toggle this off if we revert back to global scaling or full-height card behavior.

- [ ] Inner Shell Scaling Control
  - Description: content-scale-inner currently set to scale(1) to avoid shrinking; add a toggle if you want to switch between 0.8 and 1.0 dynamically for demos.

To use: check/uncheck items as debugging features are turned on/off. Update descriptions as implementations change.
