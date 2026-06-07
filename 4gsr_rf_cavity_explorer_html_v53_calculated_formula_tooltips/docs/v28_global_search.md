# v28 Global Search

## Search scope
The top parameter search now applies to:

1. Left parameter settings
2. Main view widgets
3. Right Calculated Results
4. 3D View labels

## Behavior
Example: searching `tuner`

- Opens the Detune tab
- Expands related left parameter groups:
  - Coupling / Tuner
  - Tuner Mapping
- Highlights related inputs:
  - Tuner Position
  - Reference Position
  - Reference Frequency
  - Spec Window
- Highlights related calculated results:
  - Estimated f_cav
  - Frequency Error Δf
  - Local df/dx
  - CAD Q0 Trend
  - Detune Estimate
  - Frequency Spec
- Highlights related 3D View labels:
  - Tuner Assembly
  - Input Coupler
  - Main Cavity Body

## Viewing the HTML elsewhere
The project is static HTML/CSS/JS. It can be viewed:
- locally by opening `index.html`
- with VS Code Live Server
- on another PC by copying the folder
- on an intranet static server
- via GitHub Pages / Netlify / Vercel if public access is acceptable
