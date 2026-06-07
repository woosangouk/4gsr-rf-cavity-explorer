# v61 Actual Changed Output Highlight

## Scope
Only Input Parameter change visualization was refined.

## Problem
Some inputs highlighted only a conceptual Overview component, so it was unclear which actual KPI, Calculated Results, or Summary values changed.

## Fix
- Removed confusing `CHANGED` text from Overview labels.
- Added actual output comparison using before/after text snapshots.
- Highlights changed outputs in:
  - Overview annotations when their values really change
  - Calculated Results rows
  - Top KPI cards
  - Bottom Summary widgets
  - Current tab values such as Power, HPRF, Detune, and Cavity panels
- Added a temporary note listing changed output groups.
- Inputs that only affect RF check/spec now show only the actually affected check/spec outputs.

## Calculation
No formula or calculation logic was changed.
