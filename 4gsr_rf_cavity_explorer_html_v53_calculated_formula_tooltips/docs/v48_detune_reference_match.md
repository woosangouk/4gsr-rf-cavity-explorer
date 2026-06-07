# v48 Detune Reference-Match Gauge

## Scope
Only the Detune Estimate gauge was changed.

## Changes
- Replaced the CSS-div gauge with an SVG gauge to match the user's reference image more closely.
- Added 0° vertical reference line.
- Added horizontal dashed angle baseline.
- Added left `- Angle°` and right `+ Angle°` labels.
- Added dynamic red/blue gradient angle bar behind the needle:
  - positive angle: red gradient
  - negative angle: blue gradient
- Reduced needle size relative to v46/v47.
- Removed the large numeric value below the gauge.
