# Formula-only correction report

## Scope
- GUI layout, HTML structure, and CSS visual frame were not changed.
- Only `app.js` formula logic was corrected.
- `index.html` and `style.css` were copied unchanged for a complete runnable package.

## Corrected formulas
1. Forward power before HOM:
   `Pg = ((1 + beta) * Pc + Pb)^2 / (4 * beta * Pc)`

2. Reflected power:
   `Pr = Pg - Pb - Pc`

3. Required coupler / GUI Forward Power display:
   `Required Coupler = Pg + HOM Loss`

4. Required SSPA:
   `Required SSPA = Required Coupler + Transmission Line Loss`

5. Rated HPRF:
   `Rated HPRF = Required SSPA / (Operation Point / 100)`

6. Beam Current Sweep:
   now uses the same Excel Pg formula for every current point.

7. Ring & Timing display:
   Beam/Ring RF check now uses the full derived `rfFreq` value instead of multiplying the rounded readonly `revFreq` field.

## Intentionally unchanged
- GUI layout and visual styling.
- Tuner mapping frequency estimate `f_cav(x)`.
- Detune Estimate model based on `atan(2 * QL * Δf / f_cav)`, because this is a tuner-frequency detune estimate and is not the same physical quantity as Excel's beam-loading optimum detune table.
- Default beta remains `4.5`, matching the detailed calculation tables.
