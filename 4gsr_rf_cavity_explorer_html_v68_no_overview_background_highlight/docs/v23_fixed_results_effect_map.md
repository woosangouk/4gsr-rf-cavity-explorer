# v23 Fixed Calculated Results / Effect Map Placement

## Problem
In v22, the Effect Map panel was accidentally placed outside the main view-area section.
When the Effect Map tab was clicked, it could occupy the position where the right-side Calculated Results rail should remain.

## Fix
- Moved `panel-effect` inside the main `view-area`.
- Kept `.right-rail` as a separate grid column.
- Forced desktop layout:
  - left: selected view panel
  - right: fixed Calculated Results
- Effect Map now scrolls internally if content is large.

## Result
Calculated Results stays at its default right-side position for every top tab.
