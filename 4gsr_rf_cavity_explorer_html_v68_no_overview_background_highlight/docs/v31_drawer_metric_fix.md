# v31 Drawer / Metric Fix

## What was wrong
In v30, each field was positioned separately when a parameter folder opened. That made the opened content overlap lower folder rows.

## Fix
All non-title content inside each `.input-group` is wrapped in `.group-body`.
The blue row stays fixed at 42px. When opened, `.group-body` becomes a single right-side drawer.

## Metric fix
Top KPI and bottom summary widgets now render:
`<span class="metric-pair"><span class="metric-value">number</span><span class="metric-unit">unit</span></span>`

The pair is centered as one object. The unit is not centered independently.
