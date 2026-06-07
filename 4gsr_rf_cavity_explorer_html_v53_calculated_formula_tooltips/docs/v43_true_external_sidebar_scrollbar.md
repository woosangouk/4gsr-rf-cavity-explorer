# v43 True External Sidebar Scrollbar

## Scope
Only the left Input Parameters scrollbar placement was changed.

## Problem
The scrollbar was still visually inside the blue Input Parameters UI area.

## Fix
- Added a separate `.sidebar-scrollbar` element outside the fixed blue UI card area.
- Hid the native scrollbar of `.sidebar-content-scroll` on desktop.
- Synced the custom external scrollbar thumb with the real scroll position.
- Blue parameter cards keep a fixed width and do not resize when folders open/close.
- Mobile keeps native scrolling for usability.
