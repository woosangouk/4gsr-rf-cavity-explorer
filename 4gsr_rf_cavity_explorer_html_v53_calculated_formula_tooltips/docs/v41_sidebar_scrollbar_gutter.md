# v41 Sidebar Scrollbar Gutter Fix

## Scope
Only the left Input Parameters scrollbar behavior was changed.

## Problem
When parameter groups were opened, the left sidebar scrollbar appeared inside the Input Parameters area and reduced the visible width of the blue parameter widgets.

## Fix
- Added a reserved scrollbar gutter on the right side of the sidebar.
- Fixed the blue parameter widget width.
- The scrollbar occupies the reserved gutter area, so opening/closing folders does not change widget width.
- Desktop grid width is adjusted to include the gutter.
- Mobile layout is left unchanged.
