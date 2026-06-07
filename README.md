# 4GSR RF Cavity Explorer

## Current baseline

- Current release: **V69**
- Deployment target: **GitHub Pages root**
- Public URL: `https://woosangouk.github.io/4gsr-rf-cavity-explorer/`
- Repository: `woosangouk/4gsr-rf-cavity-explorer`

## Purpose

This project is an educational HTML simulator for the 4GSR N.C. cavity RF system. It is intended to visualize RF power budget, cavity count scenarios, coupling/Q relationships, tuner-detune behavior, HPRF margin, and parameter-to-result cause/effect relationships.

## Deployment structure

The GitHub Pages deployment must use the repository root.

```text
repo root/
├─ index.html
├─ style.css
├─ app.js
├─ assets/
└─ docs/
```

Do not deploy the site inside version-named folders such as `v53` or `v68`. Version folders in the URL caused confusion and 404 errors during deployment. The release version should be shown only in the GUI footer, not in the public URL.

## Main version history, merged

| Version range | Summary | Status |
| --- | --- | --- |
| V1–V16 | Basic RF calculator, cavity visualization, initial RF power budget, early UI iterations | Foundation |
| V17–V36 | Tab-based view, search, parameter folding, compact KPI/summary widgets, inline accordion | UI structure stabilized |
| V41–V44 | Input Parameters scrollbar/gutter refinement | Sidebar improved |
| V45–V53 | Detune panel scroll, Detune gauge iteration, formula tooltip for Calculated Results | V53 stabilized main simulator |
| V54–V56 | Footer WOO creator signature and clipping fix | Branding polish |
| V57–V63 | Scenario/Input highlight experiments, light highlight style, borderless Calculated Results highlight | Visual feedback refined |
| V64–V68 | GitHub Pages path cleanup, layout/spacing attempts, Overview whole-background highlight removed | V68 visual cleanup |
| V69 | Ring & Timing derived calculation: `f0 = c/C`, `fRF = h × f0` | Current baseline |

## V69 Ring & Timing logic

V69 links Ring & Timing values using the design equations:

```text
f0 = c / C
fRF = h × f0
```

where:

- `c = 299792458 m/s`
- `C` is circumference in meters
- `h` is harmonic number
- `f0` and `fRF` are displayed in MHz

Implementation rules:

- `Circumference, C` remains editable.
- `Harmonic Number, h` remains editable.
- `Revolution Frequency, f0` is calculated from `C`.
- `RF Frequency, fRF` is calculated from `h × f0`.
- `RF Frequency` and `Revolution Frequency` are readonly fields.
- Detune calculations use the derived RF frequency.
- RF power budget formulas were not changed in V69.

Important modeling note:

`h` does not automatically change when `C` changes. Harmonic number is an integer design parameter. If the project later needs a fixed target RF frequency mode, a separate mode should be added:

```text
h = round(fRF_target / f0)
```

That mode requires a target RF frequency and a harmonic selection rule.

## V68 cleanup retained in V69

- Removed unintended whole-Overview background highlight.
- Kept local value/card/annotation-level highlight only.
- Removed excessive `CHANGED` badges from visual feedback.
- Kept calculation formulas unchanged.

## Formula verification status

The main RF power budget formulas were verified against the provided Excel baseline `20230409 4GSR RF power calculation NC cavity_lys` during the V53 verification stage.

Verified as aligned for the core baseline calculations:

- Total Energy Loss
- Beam Loss Power
- Over-voltage factor `q`
- `cos(φs)`
- Synchronous phase `φs`
- Voltage per cavity
- `Eacc`
- Dissipated power `Pc`
- Beam power `Pb`
- `Qe`
- `QL`
- `βopt`
- Required coupler power
- SSPA output
- Rated HPRF
- NC-8 to NC-12 reference table values

Known separate/partial models:

- Beam Current Sweep: current GUI uses a simplified educational sweep compared with the Excel full sweep.
- Optimum Detune: GUI tuner-detune model is based on tuner position to estimated `f_cav`, while the Excel optimum detune calculation is a different model.
- Tuner Mapping: provisional CAD/RF-test normalized model; final measurement-based tuner mapping should replace it when network analyzer data is available.

## Recommended next steps

1. Keep GitHub Pages deployment at repository root.
2. Keep GUI footer version updated for each release.
3. Avoid changing layout outside the explicitly requested area.
4. If Ring & Timing needs fixed RF mode, add a dedicated mode instead of changing the current V69 design-input mode.
5. Replace provisional tuner mapping with measured tuner position vs resonant frequency data when available.
