# v42 External Sidebar Scrollbar Fix

## Scope
Only the left Input Parameters scrollbar behavior was changed.

## Problem
The native scrollbar appeared inside the Input Parameters panel and visually reduced the blue parameter widget width when folders were opened.

## Fix
- Added `.sidebar-content-scroll` wrapper inside `.left-sidebar`.
- The wrapper owns the vertical scroll.
- A dedicated right gutter is reserved for the scrollbar.
- Blue parameter cards use a fixed width and never shrink when the scrollbar appears.
- Desktop grid width includes the scrollbar gutter.
- Mobile behavior is preserved.
