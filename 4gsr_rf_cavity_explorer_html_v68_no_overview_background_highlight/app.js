window.addEventListener("error", (event) => {
  console.error("Runtime Error:", event.message);
});

const $ = (id) => document.getElementById(id);

const inputs = [
  "energy", "current", "circumference", "harmonic", "rfFreq", "revFreq",
  "lossBending", "lossID", "lossOther", "vTotal", "nCav",
  "rq", "q0", "rsh", "cavLength", "beta",
  "tunerPos", "tunerRefPosition", "tunerRefFreq", "tunerSpecWindow",
  "homLoss", "lineLoss", "opPoint"
];

const baseline = {
  energy: 4.0,
  current: 400,
  circumference: 799.29698,
  harmonic: 1332,
  rfFreq: 499.593469,
  revFreq: 0.375070,
  lossBending: 1097.65,
  lossID: 720,
  lossOther: 60,
  vTotal: 3.5,
  nCav: 10,
  rq: 117.24,
  q0: 29000,
  rsh: 3.4,
  cavLength: 0.3000364062,
  beta: 4.5,
  tunerPos: 10,
  tunerRefPosition: 10,
  tunerRefFreq: 499.59,
  tunerSpecWindow: 0.25,
  homLoss: 5,
  lineLoss: 10,
  opPoint: 73
};

const referenceByCav = {
  8:  { pc: 28.15, pb: 93.88, hom: 5.00, coupler: 127.07, hprf: 137.07, reflected: 0.042, rated: 187.8 },
  9:  { pc: 22.24, pb: 83.45, hom: 5.00, coupler: 110.77, hprf: 120.77, reflected: 0.079, rated: 165.4 },
  10: { pc: 18.01, pb: 75.11, hom: 5.00, coupler: 98.57,  hprf: 108.57, reflected: 0.448, rated: 148.7 },
  11: { pc: 14.89, pb: 68.28, hom: 5.00, coupler: 89.14,  hprf: 99.14,  reflected: 0.976, rated: 135.8 },
  12: { pc: 12.51, pb: 62.59, hom: 5.00, coupler: 80.73,  hprf: 90.73,  reflected: 0.629, rated: 124.3 }
};

const tunerCadTrend = [
  { x: -24, f: 499.36, q0: 32050 },
  { x: -20, f: 499.38, q0: 31950 },
  { x: -15, f: 499.45, q0: 32000 },
  { x: -10, f: 499.53, q0: 31850 },
  { x: -5,  f: 499.65, q0: 31800 },
  { x: 0,   f: 499.78, q0: 31550 },
  { x: 5,   f: 499.95, q0: 31500 },
  { x: 10,  f: 500.17, q0: 31350 },
  { x: 15,  f: 500.40, q0: 31100 },
  { x: 20,  f: 500.70, q0: 30950 },
  { x: 25,  f: 501.00, q0: 30650 },
  { x: 30,  f: 501.28, q0: 30250 },
  { x: 35,  f: 501.58, q0: 30150 },
  { x: 40,  f: 501.90, q0: 29850 },
  { x: 42,  f: 501.95, q0: 29850 }
];

let latest = {};
let suppressChangeFlash = true;

const outputIdsToWatch = [
  "sideTotalLoss", "sideQe", "sideRfCheck", "sideFcav", "sideDeltaF",
  "kpiTotalLoss", "kpiBeamLoss", "kpiPhase", "kpiVc", "kpiEacc", "kpiPg", "kpiPr",
  "resQ", "resCos", "resPhase", "resRQ", "resRsh", "resQ0", "resQL", "resBeta", "resBetaOpt",
  "resEacc", "resPc", "resPb", "resPg", "resPr", "resFcav", "resDeltaF", "resTuneSlope",
  "resCadQ0", "resDetuneEstimate", "resFreqSpec", "resGain",
  "marginCoupler", "marginSSPA", "marginRated", "marginAvailable",
  "flowSSPA", "flowLine", "flowCoupler", "flowCavity", "flowBeam", "flowPc", "flowPr",
  "detuneValue", "widgetEnergy", "widgetBeam", "widgetVc", "widgetPc", "widgetPg", "widgetDetune", "widgetMargin"
];

const inputImpactTargets = {
  energy: ["resGain"],
  current: ["kpiBeamLoss", "resPb", "resPg", "marginCoupler", "marginSSPA", "marginAvailable"],
  lossBending: ["sideTotalLoss", "kpiTotalLoss", "kpiBeamLoss", "kpiPhase", "resPhase", "resPb", "resPg"],
  lossID: ["sideTotalLoss", "kpiTotalLoss", "kpiBeamLoss", "kpiPhase", "resPhase", "resPb", "resPg"],
  lossOther: ["sideTotalLoss", "kpiTotalLoss", "kpiBeamLoss", "kpiPhase", "resPhase", "resPb", "resPg"],
  vTotal: ["kpiVc", "kpiEacc", "kpiPhase", "resQ", "resPhase", "resEacc", "resPc", "resBetaOpt", "resPg"],
  nCav: ["kpiVc", "kpiEacc", "kpiPg", "kpiPr", "resEacc", "resPc", "resPb", "resPg", "resPr"],
  rq: ["resRQ", "annoRQ"],
  q0: ["resQ0", "resQL", "sideQe", "annoQe"],
  rsh: ["resRsh", "annoRsh", "resPc", "resBetaOpt", "resPg"],
  cavLength: ["kpiEacc", "resEacc"],
  beta: ["resBeta", "resQL", "sideQe", "annoQe"],
  tunerPos: ["resFcav", "resDeltaF", "resTuneSlope", "resCadQ0", "resDetuneEstimate", "resFreqSpec", "annoFcav", "annoDetune"],
  tunerRefPosition: ["resFcav", "resDeltaF", "resDetuneEstimate", "resFreqSpec", "annoFcav"],
  tunerRefFreq: ["resFcav", "resDeltaF", "resDetuneEstimate", "resFreqSpec", "annoFcav"],
  tunerSpecWindow: ["resFreqSpec"],
  homLoss: ["resPg", "marginCoupler", "marginSSPA", "marginAvailable"],
  lineLoss: ["marginSSPA", "marginAvailable"],
  opPoint: ["marginRated", "marginAvailable"]
};

const inputLabelImpactTargets = {
  current: ["coupler", "body"],
  lossBending: ["body", "coupler"],
  lossID: ["body", "coupler"],
  lossOther: ["body", "coupler"],
  vTotal: ["body", "coupler"],
  nCav: ["body", "coupler", "frame"],
  rq: ["branch"],
  q0: ["tuner", "coupler"],
  rsh: ["body"],
  cavLength: ["body"],
  beta: ["tuner", "coupler"],
  tunerPos: ["tuner", "coupler", "body"],
  tunerRefPosition: ["tuner", "coupler", "body"],
  tunerRefFreq: ["tuner", "coupler", "body"],
  tunerSpecWindow: ["tuner"],
  homLoss: ["coupler"],
  lineLoss: ["coupler"],
  opPoint: ["coupler"],
  harmonic: ["branch"],
  rfFreq: ["branch"],
  revFreq: ["branch"]
};

function getNumber(id) {
  const el = $(id);
  if (!el) return 0;
  const value = Number(el.value);
  return Number.isFinite(value) ? value : 0;
}

function setValue(id, value) {
  const el = $(id);
  if (el) el.value = value;
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}


function fmtMetricHTML(value, digits = 2, unit = "") {
  if (!Number.isFinite(value)) return '<span class="metric-pair"><span class="metric-value">-</span></span>';
  return `<span class="metric-pair"><span class="metric-value">${value.toFixed(digits)}</span>${unit ? `<span class="metric-unit">${unit}</span>` : ""}</span>`;
}

function fmtValueUnit(value, digits = 2, unit = "") {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(digits)}${unit ? `<span class="inline-unit">${unit}</span>` : ""}`;
}

function setHTML(id, html) {
  const el = $(id);
  if (el) el.innerHTML = html;
}

function fmt(value, digits = 2, unit = "") {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(digits)}${unit ? " " + unit : ""}`;
}

function fmtSci(value) {
  if (!Number.isFinite(value)) return "-";
  return value.toExponential(2);
}

function nearestReference(nCav) {
  const rounded = Math.round(nCav);
  return referenceByCav[rounded] || null;
}

function interpolateTrend(table, x, key) {
  if (!table.length) return NaN;
  if (x <= table[0].x) return table[0][key];
  if (x >= table[table.length - 1].x) return table[table.length - 1][key];

  for (let i = 0; i < table.length - 1; i += 1) {
    const a = table[i];
    const b = table[i + 1];
    if (x >= a.x && x <= b.x) {
      const t = (x - a.x) / (b.x - a.x);
      return a[key] + t * (b[key] - a[key]);
    }
  }
  return NaN;
}

function localTrendSlope(table, x, key) {
  if (table.length < 2) return NaN;
  if (x <= table[0].x) return (table[1][key] - table[0][key]) / (table[1].x - table[0].x);
  if (x >= table[table.length - 1].x) {
    const n = table.length;
    return (table[n - 1][key] - table[n - 2][key]) / (table[n - 1].x - table[n - 2].x);
  }
  for (let i = 0; i < table.length - 1; i += 1) {
    const a = table[i];
    const b = table[i + 1];
    if (x >= a.x && x <= b.x) return (b[key] - a[key]) / (b.x - a.x);
  }
  return NaN;
}

function estimateTunerFrequency(position, refPosition, refFrequency) {
  const rawAtPosition = interpolateTrend(tunerCadTrend, position, "f");
  const rawAtRef = interpolateTrend(tunerCadTrend, refPosition, "f");
  return refFrequency + (rawAtPosition - rawAtRef);
}

function snapshotOutputs() {
  const snapshot = {};
  outputIdsToWatch.forEach((id) => {
    const el = $(id);
    if (el) snapshot[id] = el.textContent;
  });
  return snapshot;
}

function flashChangedOutputs(beforeSnapshot) {
  if (suppressChangeFlash) return;
  outputIdsToWatch.forEach((id) => {
    const el = $(id);
    if (!el) return;
    const before = beforeSnapshot[id];
    const after = el.textContent;
    if (before !== undefined && before !== after) {
      el.classList.remove("value-changed");
      void el.offsetWidth;
      el.classList.add("value-changed");
      const panel = el.closest(".card, .kpi-card, .derived-pill, .mini-widget");
      if (panel) {
        panel.classList.remove("changed-panel");
        void panel.offsetWidth;
        panel.classList.add("changed-panel");
      }
    }
  });
}

function flashExpectedImpact(inputId) {
  const ids = inputImpactTargets[inputId] || [];
  ids.forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.classList.remove("value-changed");
    void el.offsetWidth;
    el.classList.add("value-changed");
  });
}

function flashLabelImpacts(inputId) {
  const targets = [...new Set(inputLabelImpactTargets[inputId] || [])];

  document.querySelectorAll(".annotation.label-impact").forEach((el) => el.classList.remove("label-impact"));

  targets.forEach((area) => {
    const label = document.querySelector(`[data-label-area="${area}"]`);
    if (label) {
      void label.offsetWidth;
      label.classList.add("label-impact");
    }
  });
}

function setPendingState(isPending) {
  const badge = $("pendingBadge");
  if (badge) badge.classList.toggle("visible", isPending);
  const apply = $("applyBtn");
  if (apply) apply.classList.toggle("attention", isPending);
}

function updateAutoModeText() {
  const auto = $("autoUpdate");
  const text = $("autoModeText");
  if (!auto || !text) return;
  text.textContent = auto.checked ? "Auto Update ON" : "Manual Apply";
}

function calculateWithHighlight() {
  const before = snapshotOutputs();
  calculate();
  flashChangedOutputs(before);
}

function calculate() {
  const energy = getNumber("energy");
  const current = getNumber("current");
  const harmonic = getNumber("harmonic");
  const rfFreq = getNumber("rfFreq");
  const lossBending = getNumber("lossBending");
  const lossID = getNumber("lossID");
  const lossOther = getNumber("lossOther");
  const vTotal = getNumber("vTotal");
  const nCav = getNumber("nCav");
  const rq = getNumber("rq");
  const q0 = getNumber("q0");
  const rsh = getNumber("rsh");
  const cavLength = getNumber("cavLength");
  const beta = getNumber("beta");
  const tunerPos = getNumber("tunerPos");
  const tunerRefPosition = getNumber("tunerRefPosition");
  const tunerRefFreq = getNumber("tunerRefFreq");
  const tunerSpecWindow = getNumber("tunerSpecWindow");
  const homLoss = getNumber("homLoss");
  const lineLoss = getNumber("lineLoss");
  const opPoint = getNumber("opPoint");

  const totalLossKeV = lossBending + lossID + lossOther;
  const totalLossMeV = totalLossKeV / 1000;
  const beamLossPower = totalLossMeV * current;

  const vPerCav = nCav > 0 ? vTotal / nCav : NaN;
  const eacc = cavLength > 0 ? vPerCav / cavLength : NaN;
  const pcCalc = rsh > 0 ? (vPerCav * vPerCav) / (2 * rsh) * 1000 : NaN;
  const pbCalc = nCav > 0 ? beamLossPower / nCav : NaN;

  const ref = nearestReference(nCav);
  const reflectedPower = ref ? ref.reflected : Math.max(0, Math.abs(beta - 5) * 0.2);
  const couplerPower = pcCalc + pbCalc + homLoss + reflectedPower;
  const sspaPower = couplerPower + lineLoss;
  const ratedPower = opPoint > 0 ? sspaPower / (opPoint / 100) : NaN;
  const margin = ratedPower - sspaPower;
  const marginPct = ratedPower > 0 ? (margin / ratedPower) * 100 : NaN;

  const overVoltage = totalLossMeV > 0 ? vTotal / totalLossMeV : NaN;
  const cosPhi = vTotal > 0 ? totalLossMeV / vTotal : NaN;
  const phaseDeg = Number.isFinite(cosPhi) ? Math.acos(Math.max(-1, Math.min(1, cosPhi))) * 180 / Math.PI : NaN;
  const ql = beta >= 0 ? q0 / (1 + beta) : NaN;
  const qe = beta > 0 ? q0 / beta : NaN;
  const betaOpt = pcCalc > 0 ? 1 + pbCalc / pcCalc : NaN;
  const energyGainRatio = energy > 0 ? vTotal / energy : NaN;
  const pPerCav = nCav > 0 ? couplerPower / nCav : NaN;

  const estimatedFcav = estimateTunerFrequency(tunerPos, tunerRefPosition, tunerRefFreq);
  const deltaF = rfFreq - estimatedFcav;
  const tuneSlope = localTrendSlope(tunerCadTrend, tunerPos, "f");
  const cadQ0Trend = interpolateTrend(tunerCadTrend, tunerPos, "q0");
  const detuneEstimateDeg = Number.isFinite(deltaF) && estimatedFcav > 0 && Number.isFinite(ql)
    ? Math.atan(2 * ql * deltaF / estimatedFcav) * 180 / Math.PI
    : NaN;
  const freqSpecAbsError = Math.abs(estimatedFcav - tunerRefFreq);
  const freqSpecStatus = Number.isFinite(freqSpecAbsError) && freqSpecAbsError <= tunerSpecWindow ? "PASS" : "WARNING";

  latest = {
    energy, current, harmonic, rfFreq, totalLossKeV, totalLossMeV, beamLossPower,
    vPerCav, eacc, pcCalc, pbCalc, reflectedPower, couplerPower, sspaPower, ratedPower,
    margin, marginPct, overVoltage, cosPhi, phaseDeg, rq, rsh, q0, ql, qe, beta, betaOpt,
    energyGainRatio, pPerCav, lineLoss, homLoss, nCav, cavLength,
    tunerPos, tunerRefPosition, tunerRefFreq, tunerSpecWindow, estimatedFcav, deltaF,
    tuneSlope, cadQ0Trend, detuneEstimateDeg, freqSpecAbsError, freqSpecStatus
  };

  updateText();
  updateStatus();
  updateSelectedBudgetRow();
  drawCharts();
}


function updateDetuneCurrentAngleLabel(valueDeg) {
  const label = $("detuneCurrentAngleLabel");
  const group = $("detuneNeedleGroup");
  const needle = $("detuneNeedle");

  if (needle) {
    needle.removeAttribute("style");
    needle.setAttribute("fill", "#000000");
    needle.setAttribute("stroke", "none");
    needle.setAttribute("opacity", "1");
  }

  if (!Number.isFinite(valueDeg)) {
    if (label) label.textContent = "-";
    if (group) group.setAttribute("transform", "rotate(0 500 470)");
    return;
  }

  const clamped = Math.max(-90, Math.min(90, valueDeg));

  if (group) {
    group.setAttribute("transform", `rotate(${clamped} 500 470)`);
    group.removeAttribute("style");
  }

  if (label) {
    const sign = clamped > 0 ? "+" : "";
    label.textContent = `${sign}${valueDeg.toFixed(1)}°`;
    label.classList.toggle("negative", clamped < 0);
    label.classList.toggle("positive", clamped >= 0);
  }
}

function updateText() {
  const v = latest;

  setText("sideTotalLoss", fmt(v.totalLossKeV, 2, "keV"));
  setText("sideQe", fmtSci(v.qe));
  setText("sideRfCheck", fmt(v.harmonic * getNumber("revFreq"), 6, "MHz"));
  setText("sideFcav", fmt(v.estimatedFcav, 6, "MHz"));
  setText("sideDeltaF", fmt(v.deltaF, 6, "MHz"));

  setHTML("kpiTotalLoss", fmtMetricHTML(v.totalLossMeV, 4, "MeV / turn"));
  setHTML("kpiBeamLoss", fmtMetricHTML(v.beamLossPower, 1, "kW"));
  setHTML("kpiPhase", fmtMetricHTML(v.phaseDeg, 2, "°"));
  setHTML("kpiVc", fmtMetricHTML(v.vPerCav, 3, "MV"));
  setHTML("kpiEacc", fmtMetricHTML(v.eacc, 3, "MV/m"));
  setHTML("kpiPg", fmtMetricHTML(v.couplerPower, 2, "kW"));
  setHTML("kpiPr", fmtMetricHTML(v.reflectedPower, 3, "kW"));

  setText("resQ", fmt(v.overVoltage, 3));
  setText("resCos", fmt(v.cosPhi, 4));
  setText("resPhase", fmt(v.phaseDeg, 2, "°"));
  setText("resRQ", fmt(v.rq, 2, "Ω"));
  setText("resRsh", fmt(v.rsh, 2, "MΩ"));
  setText("resQ0", fmt(v.q0, 0));
  setText("resQL", fmtSci(v.ql));
  setText("resBeta", fmt(v.beta, 2));
  setText("resBetaOpt", fmt(v.betaOpt, 2));
  setText("resEacc", fmt(v.eacc, 3, "MV/m"));
  setText("resPc", fmt(v.pcCalc, 2, "kW"));
  setText("resPb", fmt(v.pbCalc, 2, "kW"));
  setText("resPg", fmt(v.couplerPower, 2, "kW"));
  setText("resPr", fmt(v.reflectedPower, 3, "kW"));
  setText("resFcav", fmt(v.estimatedFcav, 6, "MHz"));
  setText("resDeltaF", fmt(v.deltaF, 6, "MHz"));
  setText("resTuneSlope", fmt(v.tuneSlope, 4, "MHz/mm"));
  setText("resCadQ0", fmt(v.cadQ0Trend, 0));
  setText("resDetuneEstimate", fmt(v.detuneEstimateDeg, 2, "°"));
  setText("resFreqSpec", `${v.freqSpecStatus} (${fmt(v.freqSpecAbsError, 4, "MHz")})`);
  setText("resGain", fmt(v.energyGainRatio, 3));

  const specEl = $("resFreqSpec");
  if (specEl) {
    specEl.classList.remove("spec-pass", "spec-warning", "spec-fail");
    specEl.classList.add(v.freqSpecStatus === "PASS" ? "spec-pass" : "spec-warning");
  }

  setText("annoFcav", fmt(v.estimatedFcav, 6, "MHz"));
  setText("annoDetune", fmt(v.detuneEstimateDeg, 2, "°"));
  setText("annoRQ", fmt(v.rq, 2, "Ω"));
  setText("annoRsh", fmt(v.rsh, 2, "MΩ"));
  setText("annoQe", fmtSci(v.qe));

  setText("marginCoupler", fmt(v.couplerPower, 2, "kW"));
  setText("marginSSPA", fmt(v.sspaPower, 2, "kW"));
  setText("marginRated", fmt(v.ratedPower, 2, "kW"));
  setText("marginAvailable", `${fmt(v.margin, 2, "kW")} (${fmt(v.marginPct, 1, "%")})`);

  setText("flowSSPA", fmt(v.sspaPower, 1, "kW"));
  setText("flowLine", fmt(v.lineLoss, 1, "kW"));
  setText("flowCoupler", fmt(v.couplerPower, 1, "kW"));
  setText("flowCavity", fmt(v.couplerPower - v.homLoss, 1, "kW"));
  setText("flowBeam", fmt(v.pbCalc, 1, "kW"));
  setText("flowPc", fmt(v.pcCalc, 1, "kW"));
  setText("flowPr", fmt(v.reflectedPower, 3, "kW"));

  setText("beamRfCheck", fmt(v.harmonic * getNumber("revFreq"), 6, "MHz"));
  setText("beamLossPanel", fmt(v.beamLossPower, 2, "kW"));
  setText("panelVc", fmt(v.vPerCav, 3, "MV"));
  setText("panelEacc", fmt(v.eacc, 3, "MV/m"));
  setText("panelPc", fmt(v.pcCalc, 2, "kW"));
  setText("panelQe", fmt(v.qe, 2));
  setText("panelQL", fmt(v.ql, 2));
  setText("panelBetaOpt", fmt(v.betaOpt, 2));
  setText("panelFcav", fmt(v.estimatedFcav, 6, "MHz"));
  setText("panelDeltaF", fmt(v.deltaF, 6, "MHz"));
  setText("panelSlope", fmt(v.tuneSlope, 4, "MHz/mm"));
  setText("panelCadQ0", fmt(v.cadQ0Trend, 0));

  setText("detuneValue", fmt(v.detuneEstimateDeg, 2, "°"));
  updateDetuneCurrentAngleLabel(v.detuneEstimateDeg);
setHTML("widgetEnergy", fmtMetricHTML(v.totalLossMeV, 4, "MeV"));
  setHTML("widgetBeam", fmtMetricHTML(v.beamLossPower, 1, "kW"));
  setHTML("widgetVc", fmtMetricHTML(v.vPerCav, 3, "MV"));
  setHTML("widgetPc", fmtMetricHTML(v.pcCalc, 1, "kW"));
  setHTML("widgetPg", fmtMetricHTML(v.couplerPower, 1, "kW"));
  setHTML("widgetDetune", fmtMetricHTML(v.detuneEstimateDeg, 1, "°"));
  setHTML("widgetMargin", fmtMetricHTML(v.margin, 1, "kW"));

  setText("footerTime", new Date().toLocaleString());
}

function updateStatus() {
  const marginEl = $("marginAvailable");
  if (!marginEl) return;
  if (latest.couplerPower > 120 || latest.margin < 0) {
    marginEl.style.color = "#ef4444";
  } else if (latest.marginPct < 10) {
    marginEl.style.color = "#f97316";
  } else {
    marginEl.style.color = "#16a34a";
  }
}

function updateSelectedBudgetRow() {
  const selectedCav = String(Math.round(getNumber("nCav")));
  document.querySelectorAll(".budget-table tbody tr").forEach((row) => {
    row.classList.toggle("selected-row", String(row.dataset.cav) === selectedCav);
  });
  document.querySelectorAll(".scenario-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.cav === selectedCav);
  });
  const select = $("scenarioSelect");
  if (select && referenceByCav[Number(selectedCav)]) select.value = selectedCav;
}

function loadBaseline() {
  Object.entries(baseline).forEach(([key, value]) => setValue(key, value));
  calculate();
}

function selectScenario(cav) {
  if (!referenceByCav[cav]) return;
  setValue("nCav", cav);
  calculate();
}

function drawCharts() {
  try {
    drawCavitySweepChart();
    drawBeamSweepChart();
  } catch (error) {
    console.warn("Chart update skipped:", error);
  }
}

function drawCavitySweepChart() {
  const svg = $("cavitySweepChart");
  if (!svg) return;
  const metric = $("chartMetric") ? $("chartMetric").value : "coupler";
  const metricMap = {
    coupler: { key: "coupler", label: "Required Coupler Power [kW]", color: "#2563eb" },
    hprf: { key: "hprf", label: "HPRF Output [kW]", color: "#ef4444" },
    rated: { key: "rated", label: "Rated HPRF [kW]", color: "#f97316" },
    pc: { key: "pc", label: "Dissipated Power [kW]", color: "#16a34a" },
    pb: { key: "pb", label: "Beam Power [kW]", color: "#7c3aed" }
  };
  const config = metricMap[metric] || metricMap.coupler;
  const xs = Object.keys(referenceByCav).map(Number);
  const ys = xs.map((x) => referenceByCav[x][config.key]);
  drawLineChart(svg, xs, ys, config.label, config.color, Math.round(latest.nCav));
}

function drawBeamSweepChart() {
  const svg = $("beamSweepChart");
  if (!svg) return;
  const currents = [0, 50, 100, 150, 200, 250, 300, 350, 400];
  const nCav = Math.max(1, latest.nCav || 10);
  const totalLossMeV = latest.totalLossMeV || 1.87765;
  const ys = currents.map((i) => (totalLossMeV * i) / nCav + latest.pcCalc + latest.homLoss);
  drawLineChart(svg, currents, ys, "Beam Current Sweep: Pg estimate [kW]", "#2563eb", latest.current);
}

function drawLineChart(svg, xs, ys, label, color, selectedX) {
  const width = 520;
  const height = 260;
  const pad = { left: 58, right: 24, top: 34, bottom: 56 };
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = 0;
  const yMax = Math.max(...ys) * 1.18 || 1;

  const sx = (x) => pad.left + ((x - xMin) / (xMax - xMin || 1)) * (width - pad.left - pad.right);
  const sy = (y) => height - pad.bottom - ((y - yMin) / (yMax - yMin || 1)) * (height - pad.top - pad.bottom);

  const points = xs.map((x, i) => `${sx(x)},${sy(ys[i])}`).join(" ");
  const isBeamSweep = label.toLowerCase().includes("beam current");
  const xAxisTitle = isBeamSweep ? "Beam Current [mA]" : "Number of Cavities";
  const yAxisTitle = label.includes("[") ? label.replace(/^.*:\s*/, "") : "Power [kW]";

  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const y = pad.top + t * (height - pad.top - pad.bottom);
    const val = yMax - t * (yMax - yMin);
    return `<line class="grid-line" x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}"></line>
            <text class="axis-label" x="${pad.left - 8}" y="${y + 4}" text-anchor="end">${val.toFixed(0)}</text>`;
  }).join("");

  const dots = xs.map((x, i) => {
    const selected = Math.round(x) === Math.round(selectedX);
    const px = sx(x);
    const py = sy(ys[i]);
    const labelY = Math.max(16, py - 10);
    return `<circle class="chart-dot" cx="${px}" cy="${py}" r="${selected ? 6 : 4}" fill="${selected ? "#f97316" : color}"></circle>
            <text class="point-value-label" x="${px}" y="${labelY}" text-anchor="middle">${ys[i].toFixed(1)}</text>
            <text class="axis-label" x="${px}" y="${height - 28}" text-anchor="middle">${x}</text>`;
  }).join("");

  svg.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" rx="14" fill="#f8fafc"></rect>
    ${grid}
    <line class="axis" x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}"></line>
    <line class="axis" x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${height - pad.bottom}"></line>
    <polyline class="chart-line" points="${points}" stroke="${color}"></polyline>
    ${dots}
    <text class="legend-item" x="${pad.left}" y="20">${label}</text>
    <text class="x-axis-title" x="${width / 2}" y="${height - 8}" text-anchor="middle">${xAxisTitle}</text>
    <text class="y-axis-title" x="16" y="${height / 2}" transform="rotate(-90 16 ${height / 2})" text-anchor="middle">${yAxisTitle}</text>
  `;
}

function setActiveTopTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.remove("active");
  });
  const panel = $(`panel-${tabName}`);
  if (panel) panel.classList.add("active");

  const titles = {
    overview: ["Overview", "3D View와 핵심 원인-결과 흐름을 한 화면에서 확인합니다."],
    beam: ["Beam & Ring", "Beam energy loss, RF timing, beam current sweep을 확인합니다."],
    cavity: ["Cavity", "Cavity 수, Vc, Eacc, Pc 변화를 확인합니다."],
    coupling: ["Coupling & Q", "Qe, QL, β, βopt 관계를 확인합니다."],
    power: ["Power", "SSPA → Line → Coupler → Cavity → Beam power flow를 한 줄 구조로 확인합니다."],
    detune: ["Detune", "Tuner position, f_cav, Δf, detune estimate를 확인합니다."],
    hprf: ["HPRF & Margin", "Required power와 rated HPRF margin을 확인합니다."],
    diagnostics: ["NC Power Table", "NC-8~NC-12 reference power budget 표를 확인합니다."],
    effect: ["Effect Map", "입력 파라미터와 결과값의 영향 흐름을 표와 맵으로 확인합니다."]
  };
  const [title, subtitle] = titles[tabName] || titles.overview;
  setText("viewTitle", title);
  setText("viewSubtitle", subtitle);
}

function bindInputImpactTooltips() {
  const tooltip = $("inputImpactTooltip");
  if (!tooltip) return;
  let timer = null;
  document.querySelectorAll("[data-impact]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      timer = window.setTimeout(() => {
        tooltip.textContent = el.dataset.impact || "";
        const rect = el.getBoundingClientRect();
        tooltip.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - 380))}px`;
        tooltip.style.top = `${Math.min(rect.bottom + 10, window.innerHeight - 130)}px`;
        tooltip.classList.add("visible");
      }, 1000);
    });
    el.addEventListener("mouseleave", () => {
      if (timer) window.clearTimeout(timer);
      timer = null;
      tooltip.classList.remove("visible");
    });
    el.addEventListener("focus", () => {
      tooltip.textContent = el.dataset.impact || "";
      const rect = el.getBoundingClientRect();
      tooltip.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - 380))}px`;
      tooltip.style.top = `${Math.min(rect.bottom + 10, window.innerHeight - 130)}px`;
      tooltip.classList.add("visible");
    });
    el.addEventListener("blur", () => tooltip.classList.remove("visible"));
  });
}



const searchIndex = [
  { label: "Beam Energy", id: "energy", tab: "beam", type: "Input" },
  { label: "Beam Current", id: "current", tab: "beam", type: "Input" },
  { label: "Circumference", id: "circumference", tab: "beam", type: "Input" },
  { label: "Harmonic Number", id: "harmonic", tab: "beam", type: "Input" },
  { label: "RF Frequency", id: "rfFreq", tab: "beam", type: "Input" },
  { label: "Revolution Frequency", id: "revFreq", tab: "beam", type: "Input" },
  { label: "Bending Loss", id: "lossBending", tab: "beam", type: "Input" },
  { label: "ID Loss", id: "lossID", tab: "beam", type: "Input" },
  { label: "Other Loss", id: "lossOther", tab: "beam", type: "Input" },
  { label: "Total Voltage", id: "vTotal", tab: "cavity", type: "Input" },
  { label: "Number of Cavities", id: "nCav", tab: "cavity", type: "Input" },
  { label: "R over Q", id: "rq", tab: "cavity", type: "Input" },
  { label: "Q0", id: "q0", tab: "coupling", type: "Input" },
  { label: "Rsh", id: "rsh", tab: "cavity", type: "Input" },
  { label: "Cavity Length", id: "cavLength", tab: "cavity", type: "Input" },
  { label: "Coupling Beta", id: "beta", tab: "coupling", type: "Input" },
  { label: "Tuner Position", id: "tunerPos", tab: "detune", type: "Input" },
  { label: "Reference Position", id: "tunerRefPosition", tab: "detune", type: "Input" },
  { label: "Reference Frequency", id: "tunerRefFreq", tab: "detune", type: "Input" },
  { label: "Spec Window", id: "tunerSpecWindow", tab: "detune", type: "Input" },
  { label: "Transmission Line Loss", id: "lineLoss", tab: "hprf", type: "Input" },
  { label: "HOM Absorber Loss", id: "homLoss", tab: "hprf", type: "Input" },
  { label: "SSPA Operation Point", id: "opPoint", tab: "hprf", type: "Input" },
  { label: "Forward Power", id: "resPg", tab: "power", type: "Result" },
  { label: "Reflected Power", id: "resPr", tab: "power", type: "Result" },
  { label: "Estimated fcav", id: "resFcav", tab: "detune", type: "Result" },
  { label: "Frequency Error Δf", id: "resDeltaF", tab: "detune", type: "Result" },
  { label: "Detune Estimate", id: "resDetuneEstimate", tab: "detune", type: "Result" },
  { label: "NC Power Table", id: "panel-diagnostics", tab: "diagnostics", type: "View" },
  { label: "Effect Map", id: "panel-effect", tab: "effect", type: "View" },
  { label: "HPRF Margin", id: "marginAvailable", tab: "hprf", type: "Result" }
];

function highlightSearchTarget(id) {
  const el = $(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  el.classList.remove("search-target-highlight");
  void el.offsetWidth;
  el.classList.add("search-target-highlight");
  if (typeof el.focus === "function" && ["INPUT", "SELECT", "BUTTON"].includes(el.tagName)) {
    el.focus();
  }
}

function runParameterSearch(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return;
  const found = searchIndex.find((item) => item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q));
  if (!found) return;

  setActiveTopTab(found.tab);
  window.setTimeout(() => highlightSearchTarget(found.id), 120);
  hideSearchSuggestions();
}

function showSearchSuggestions(query) {
  const box = $("searchSuggestions");
  if (!box) return;
  const q = String(query || "").trim().toLowerCase();
  if (!q) {
    hideSearchSuggestions();
    return;
  }

  const matches = searchIndex
    .filter((item) => item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q))
    .slice(0, 8);

  if (!matches.length) {
    box.innerHTML = `<div class="search-suggestion"><span>No match</span><small>-</small></div>`;
    box.classList.add("visible");
    return;
  }

  box.innerHTML = matches.map((item) => `
    <div class="search-suggestion" data-id="${item.id}" data-tab="${item.tab}">
      <span>${item.label}</span>
      <small>${item.type} · ${item.tab}</small>
    </div>
  `).join("");

  box.querySelectorAll(".search-suggestion").forEach((el) => {
    el.addEventListener("click", () => {
      setActiveTopTab(el.dataset.tab);
      window.setTimeout(() => highlightSearchTarget(el.dataset.id), 120);
      hideSearchSuggestions();
    });
  });

  box.classList.add("visible");
}

function hideSearchSuggestions() {
  const box = $("searchSuggestions");
  if (box) box.classList.remove("visible");
}

function bindParameterSearch() {
  const input = $("parameterSearch");
  const button = $("parameterSearchBtn");
  if (!input || !button) return;

  input.addEventListener("input", () => showSearchSuggestions(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") runParameterSearch(input.value);
    if (event.key === "Escape") hideSearchSuggestions();
  });
  button.addEventListener("click", () => runParameterSearch(input.value));
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".parameter-search")) hideSearchSuggestions();
  });
}

function initializeApp() {
  inputs.forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("input", () => {
      const auto = $("autoUpdate");
      flashLabelImpacts(id);
      if (auto && auto.checked) {
        suppressChangeFlash = false;
        calculateWithHighlight();
      } else {
        setPendingState(true);
        flashExpectedImpact(id);
      }
    });
  });

  const auto = $("autoUpdate");
  if (auto) {
    auto.addEventListener("change", () => {
      updateAutoModeText();
      if (auto.checked) {
        setPendingState(false);
        suppressChangeFlash = false;
        calculateWithHighlight();
      } else {
        setPendingState(true);
      }
    });
  }

  $("resetBtn").addEventListener("click", () => {
    suppressChangeFlash = false;
    loadBaseline();
    setPendingState(false);
  });

  $("applyBtn").addEventListener("click", () => {
    suppressChangeFlash = false;
    calculateWithHighlight();
    setPendingState(false);
  });

  document.querySelectorAll(".scenario-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.cav;
      if (value === "custom") {
        button.classList.add("active");
        return;
      }
      suppressChangeFlash = false;
      flashLabelImpacts("nCav");
      selectScenario(Number(value));
      setPendingState(false);
    });
  });

  $("scenarioSelect").addEventListener("change", (event) => {
    suppressChangeFlash = false;
    flashLabelImpacts("nCav");
    selectScenario(Number(event.target.value));
    setPendingState(false);
  });

  const chartMetric = $("chartMetric");
  if (chartMetric) chartMetric.addEventListener("change", drawCavitySweepChart);

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setActiveTopTab(tab.dataset.tab));
  });

  calculate();
  updateAutoModeText();
  setPendingState(false);
  bindInputImpactTooltips();
  bindParameterSearch();
}

initializeApp();


function bindSearchShortcut() {
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const input = $("parameterSearch");
      if (input) input.focus();
    }
  });
}

bindSearchShortcut();

function bindMobileParameterPanel() {
  const button = $("mobileParamToggle");
  const sidebar = document.querySelector(".left-sidebar");
  if (!button || !sidebar) return;

  button.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-collapsed");
    button.textContent = sidebar.classList.contains("mobile-collapsed") ? "Parameters" : "Hide Parameters";
  });

  if (window.innerWidth <= 820) {
    sidebar.classList.add("mobile-collapsed");
  }
}

bindMobileParameterPanel();


function bindHoverGuideTooltips() {
  const tooltip = $("hoverGuideTooltip");
  if (!tooltip) return;

  let timer = null;

  function showTooltip(el) {
    const text = el.dataset.guide || el.closest(".input-group")?.dataset.guide || "";
    if (!text) return;

    tooltip.textContent = text;
    const rect = el.getBoundingClientRect();
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - 410));
    const top = Math.min(rect.bottom + 10, window.innerHeight - 120);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add("visible");
  }

  function hideTooltip() {
    if (timer) window.clearTimeout(timer);
    timer = null;
    tooltip.classList.remove("visible");
  }

  document.querySelectorAll(".tab[data-guide], .input-group[data-guide]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      timer = window.setTimeout(() => showTooltip(el), 1000);
    });

    el.addEventListener("mouseleave", hideTooltip);

    el.addEventListener("focusin", () => {
      timer = window.setTimeout(() => showTooltip(el), 1000);
    });

    el.addEventListener("focusout", hideTooltip);
  });
}

bindHoverGuideTooltips();


const globalSearchIndexV28 = [
  { label: "Beam Energy", tab: "beam", ids: ["energy", "resGain"], groups: ["beam energy"] },
  { label: "Beam Current", tab: "beam", ids: ["current", "kpiBeamLoss", "resPb", "resPg", "widgetBeam"], groups: ["beam current"] },
  { label: "Ring RF Frequency", tab: "beam", ids: ["rfFreq", "sideRfCheck", "beamRfCheck"], groups: ["rf frequency"] },
  { label: "Energy Loss", tab: "beam", ids: ["lossBending", "lossID", "lossOther", "sideTotalLoss", "kpiTotalLoss", "widgetEnergy"], groups: ["energy loss"] },
  { label: "Total Voltage", tab: "cavity", ids: ["vTotal", "kpiVc", "panelVc"], groups: ["rf voltage"] },
  { label: "Cavity Count", tab: "cavity", ids: ["nCav", "kpiVc", "kpiEacc", "panelVc", "panelEacc"], groups: ["cavity configuration", "scenario"] },
  { label: "R/Q", tab: "cavity", ids: ["rq", "resRQ", "annoRQ"], groups: ["cavity configuration"] },
  { label: "Q0", tab: "coupling", ids: ["q0", "resQ0", "resQL", "panelQL"], groups: ["cavity configuration", "coupling"] },
  { label: "Rsh", tab: "cavity", ids: ["rsh", "resRsh", "annoRsh", "resPc", "widgetPc"], groups: ["cavity configuration"] },
  { label: "Coupling Beta", tab: "coupling", ids: ["beta", "resBeta", "panelQe", "panelQL", "panelBetaOpt"], groups: ["coupling"] },
  { label: "Tuner", tab: "detune", ids: ["tunerPos", "tunerRefPosition", "tunerRefFreq", "tunerSpecWindow", "sideFcav", "sideDeltaF", "resFcav", "resDeltaF", "resTuneSlope", "resCadQ0", "resDetuneEstimate", "resFreqSpec", "panelFcav", "panelDeltaF", "panelSlope", "panelCadQ0", "detuneValue", "annoFcav", "annoDetune"], groups: ["tuner mapping", "coupling tuner"], labels: ["tuner", "coupler", "body"] },
  { label: "Detune", tab: "detune", ids: ["tunerPos", "resDetuneEstimate", "detuneValue", "widgetDetune", "annoDetune"], groups: ["tuner mapping"], labels: ["tuner"] },
  { label: "Forward Power", tab: "power", ids: ["resPg", "kpiPg", "flowCoupler", "flowCavity", "widgetPg"], groups: ["hprf", "scenario"], labels: ["coupler"] },
  { label: "Reflected Power", tab: "power", ids: ["resPr", "kpiPr", "flowPr"], groups: ["hprf"], labels: ["coupler"] },
  { label: "HPRF Margin", tab: "hprf", ids: ["lineLoss", "homLoss", "opPoint", "marginCoupler", "marginSSPA", "marginRated", "marginAvailable", "widgetMargin"], groups: ["hprf"], labels: ["coupler"] },
  { label: "NC Power Table", tab: "diagnostics", ids: ["panel-diagnostics"], groups: ["scenario"] },
  { label: "Effect Map", tab: "effect", ids: ["panel-effect"], groups: [] }
];

function normalizeSearchTextV28(text) {
  return String(text || "").toLowerCase().replace(/[_/()βφΔ\-]/g, " ").replace(/\s+/g, " ").trim();
}

function getSearchMatchesV28(query) {
  const q = normalizeSearchTextV28(query);
  if (!q) return [];
  const tokens = q.split(" ");
  return globalSearchIndexV28.filter((item) => {
    const hay = normalizeSearchTextV28([item.label, item.tab, ...(item.ids || []), ...(item.groups || [])].join(" "));
    return tokens.every((t) => hay.includes(t));
  });
}

function openGroupsForSearchV28(matches) {
  const groupHints = new Set();
  matches.forEach((m) => (m.groups || []).forEach((g) => groupHints.add(normalizeSearchTextV28(g))));

  document.querySelectorAll(".input-group").forEach((group) => {
    const title = normalizeSearchTextV28(group.querySelector("h3")?.textContent || "");
    const data = normalizeSearchTextV28(group.dataset.searchGroup || "");
    const shouldOpen = [...groupHints].some((hint) => title.includes(hint) || data.includes(hint) || hint.includes(title));
    if (shouldOpen) {
      group.classList.remove("collapsed");
      group.classList.add("search-opened-group");
      window.setTimeout(() => group.classList.remove("search-opened-group"), 2400);
    }
  });
}

function highlightSearchIdsV28(ids) {
  ids.forEach((id) => {
    const el = $(id);
    if (!el) return;

    const target = el.closest(".result-card div") || el.closest(".kpi-card") || el.closest(".mini-widget") || el.closest(".info-card") || el;
    target.classList.remove("global-search-hit");
    void target.offsetWidth;
    target.classList.add("global-search-hit");
  });
}

function highlightSearchLabelsV28(labels) {
  (labels || []).forEach((area) => {
    const el = document.querySelector(`[data-label-area="${area}"]`);
    if (!el) return;
    el.classList.remove("global-search-hit", "label-impact");
    void el.offsetWidth;
    el.classList.add("global-search-hit", "label-impact");
  });
}

function runParameterSearch(query) {
  const matches = getSearchMatchesV28(query);
  const status = $("searchStatus");

  if (!matches.length) {
    if (status) {
      status.textContent = "No matching parameter/result";
      status.classList.add("visible");
      window.setTimeout(() => status.classList.remove("visible"), 1800);
    }
    hideSearchSuggestions();
    return;
  }

  const preferred = matches.find((m) => m.tab === "detune") || matches[0];
  setActiveTopTab(preferred.tab);

  window.setTimeout(() => {
    openGroupsForSearchV28(matches);
    const allIds = [...new Set(matches.flatMap((m) => m.ids || []))];
    highlightSearchIdsV28(allIds);
    matches.forEach((m) => highlightSearchLabelsV28(m.labels));

    const firstEl = $(preferred.ids?.[0]) || $(`panel-${preferred.tab}`);
    if (firstEl && typeof firstEl.scrollIntoView === "function") {
      firstEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }

    if (status) {
      status.textContent = `${matches.length} matched · ${preferred.label}`;
      status.classList.add("visible");
      window.setTimeout(() => status.classList.remove("visible"), 2200);
    }
  }, 130);

  hideSearchSuggestions();
}

function showSearchSuggestions(query) {
  const box = $("searchSuggestions");
  if (!box) return;

  const matches = getSearchMatchesV28(query).slice(0, 10);
  if (!String(query || "").trim()) {
    hideSearchSuggestions();
    return;
  }

  if (!matches.length) {
    box.innerHTML = `<div class="search-suggestion"><span>No match</span><small>-</small></div>`;
    box.classList.add("visible");
    return;
  }

  box.innerHTML = matches.map((item) => `
    <div class="search-suggestion" data-query="${item.label}">
      <span>${item.label}</span>
      <small>${item.tab}</small>
    </div>
  `).join("");

  box.querySelectorAll(".search-suggestion").forEach((el) => {
    el.addEventListener("click", () => {
      const input = $("parameterSearch");
      if (input) input.value = el.dataset.query || "";
      runParameterSearch(el.dataset.query || "");
    });
  });

  box.classList.add("visible");
}

function bindGlobalSearchV28() {
  const input = $("parameterSearch");
  const button = $("parameterSearchBtn");
  if (!input || !button) return;

  input.addEventListener("input", () => showSearchSuggestions(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") runParameterSearch(input.value);
    if (event.key === "Escape") hideSearchSuggestions();
  });
  button.addEventListener("click", () => runParameterSearch(input.value));
}

bindGlobalSearchV28();




/* v36: final inline-only accordion. No side drawer. */
function inlineCloseAllParameterGroups() {
  document.querySelectorAll(".input-group.open-inline").forEach((group) => {
    group.classList.remove("open-inline", "drawer-open", "search-opened-group");
    group.classList.add("collapsed");
    const body = group.querySelector(".group-body");
    if (body) {
      body.removeAttribute("style");
    }
  });
}

function inlineOpenParameterGroup(group, forceOpen = false) {
  if (!group) return;
  const wasOpen = group.classList.contains("open-inline") || group.classList.contains("drawer-open");

  inlineCloseAllParameterGroups();

  if (forceOpen || !wasOpen) {
    group.classList.remove("collapsed");
    group.classList.add("open-inline");
    const body = group.querySelector(".group-body");
    if (body) body.removeAttribute("style");
  }
}

function inlineFindGroupBySearchMatch(match) {
  const ids = match?.ids || [];
  for (const id of ids) {
    const el = document.getElementById(id);
    const group = el?.closest?.(".input-group");
    if (group) return group;
  }

  const hints = (match?.groups || []).map((g) => normalizeSearchTextV28(g));
  const groups = Array.from(document.querySelectorAll(".input-group"));
  return groups.find((group) => {
    const title = normalizeSearchTextV28(group.querySelector("h3")?.textContent || "");
    const data = normalizeSearchTextV28(group.dataset.searchGroup || "");
    return hints.some((hint) => title.includes(hint) || data.includes(hint) || hint.includes(title));
  }) || null;
}

function openGroupsForSearchV28(matches) {
  const preferred = (matches || []).find((m) => m.tab === "detune") || (matches || [])[0];
  let group = inlineFindGroupBySearchMatch(preferred);

  if (!group) {
    for (const match of matches || []) {
      group = inlineFindGroupBySearchMatch(match);
      if (group) break;
    }
  }

  if (group) {
    inlineOpenParameterGroup(group, true);
    group.classList.add("search-opened-group");
    group.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => group.classList.remove("search-opened-group"), 2200);
  }
}

function bindInlineAccordionFinal() {
  const groups = Array.from(document.querySelectorAll(".input-group"));
  groups.forEach((group) => {
    group.classList.add("collapsed");
    group.classList.remove("drawer-open", "open-inline", "search-opened-group");

    const header = group.querySelector("h3");
    if (!header) return;

    header.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      inlineOpenParameterGroup(group, false);
    }, true);

    group.addEventListener("click", (event) => {
      if (event.target.closest(".group-body")) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      inlineOpenParameterGroup(group, false);
    }, true);
  });

  const settings = document.getElementById("toggleAllGroups");
  if (settings) {
    settings.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const open = document.querySelector(".input-group.open-inline");
      if (open) inlineCloseAllParameterGroups();
      else inlineOpenParameterGroup(document.querySelector(".input-group"), true);
    }, true);
  }
}

bindInlineAccordionFinal();


/* v43: sync custom external sidebar scrollbar */
function syncSidebarExternalScrollbarV43() {
  const scroller = document.querySelector(".sidebar-content-scroll");
  const track = document.querySelector(".sidebar-scrollbar");
  const thumb = document.querySelector(".sidebar-scrollbar-thumb");
  if (!scroller || !track || !thumb) return;

  const scrollHeight = scroller.scrollHeight;
  const clientHeight = scroller.clientHeight;

  if (scrollHeight <= clientHeight + 1) {
    track.style.display = "none";
    return;
  }

  track.style.display = "block";

  const trackHeight = track.clientHeight;
  const thumbHeight = Math.max(28, Math.round((clientHeight / scrollHeight) * trackHeight));
  const maxTop = Math.max(0, trackHeight - thumbHeight);
  const scrollMax = Math.max(1, scrollHeight - clientHeight);
  const top = Math.round((scroller.scrollTop / scrollMax) * maxTop);

  thumb.style.height = `${thumbHeight}px`;
  thumb.style.transform = `translateY(${top}px)`;
}

function bindSidebarExternalScrollbarV43() {
  const scroller = document.querySelector(".sidebar-content-scroll");
  if (!scroller) return;

  scroller.addEventListener("scroll", syncSidebarExternalScrollbarV43, { passive: true });
  window.addEventListener("resize", syncSidebarExternalScrollbarV43);

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(syncSidebarExternalScrollbarV43);
  });
  observer.observe(scroller, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });

  window.requestAnimationFrame(syncSidebarExternalScrollbarV43);
}

bindSidebarExternalScrollbarV43();


/* v44: sync custom external sidebar scrollbar */
function syncSidebarExternalScrollbarV44() {
  const scroller = document.querySelector(".sidebar-content-scroll");
  const track = document.querySelector(".sidebar-scrollbar");
  const thumb = document.querySelector(".sidebar-scrollbar-thumb");
  if (!scroller || !track || !thumb) return;

  const scrollHeight = scroller.scrollHeight;
  const clientHeight = scroller.clientHeight;

  if (scrollHeight <= clientHeight + 1 || window.innerWidth <= 820) {
    track.style.display = "none";
    return;
  }

  track.style.display = "block";

  const trackHeight = track.clientHeight;
  const thumbHeight = Math.max(28, Math.round((clientHeight / scrollHeight) * trackHeight));
  const maxTop = Math.max(0, trackHeight - thumbHeight);
  const scrollMax = Math.max(1, scrollHeight - clientHeight);
  const top = Math.round((scroller.scrollTop / scrollMax) * maxTop);

  thumb.style.height = `${thumbHeight}px`;
  thumb.style.transform = `translateY(${top}px)`;
}

function bindSidebarExternalScrollbarV44() {
  const scroller = document.querySelector(".sidebar-content-scroll");
  if (!scroller) return;
  scroller.addEventListener("scroll", syncSidebarExternalScrollbarV44, { passive: true });
  window.addEventListener("resize", syncSidebarExternalScrollbarV44);

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(syncSidebarExternalScrollbarV44);
  });
  observer.observe(scroller, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });

  window.requestAnimationFrame(syncSidebarExternalScrollbarV44);
}

bindSidebarExternalScrollbarV44();


/* v53: Calculated Results formula tooltip */
const calculatedFormulaTooltips = {
  resQ: {
    title: "Over-voltage Factor (q)",
    formula: "q = V_RF / U0",
    detail: "Total RF Voltage를 turn당 energy loss로 나눈 값입니다. synchronous phase 계산의 기준이 됩니다."
  },
  resCos: {
    title: "cos(φs)",
    formula: "cos(φs) = U0 / V_RF = 1 / q",
    detail: "beam energy loss를 RF voltage가 보상하기 위한 synchronous phase의 cosine 값입니다."
  },
  resPhase: {
    title: "Synchronous Phase (φs)",
    formula: "φs = acos(U0 / V_RF)",
    detail: "U0는 MeV/turn, V_RF는 MV 기준으로 계산합니다."
  },
  resRQ: {
    title: "R / Q",
    formula: "R/Q = input reference value",
    detail: "cavity geometry로 정해지는 RF parameter입니다. 현재 HTML에서는 입력 기준값을 표시합니다."
  },
  resRsh: {
    title: "Rsh",
    formula: "Rsh = input reference value",
    detail: "shunt impedance입니다. dissipated power 계산에 사용됩니다."
  },
  resQ0: {
    title: "Q0",
    formula: "Q0 = input reference value",
    detail: "unloaded Q factor입니다. Qe, QL 계산에 사용됩니다."
  },
  resQL: {
    title: "Loaded Q (QL)",
    formula: "QL = Q0 / (1 + β)",
    detail: "coupling beta가 커질수록 loaded Q는 낮아집니다."
  },
  resBeta: {
    title: "Coupling Beta (β)",
    formula: "β = input value",
    detail: "external coupling 정도를 나타냅니다. Qe와 QL 계산에 연결됩니다."
  },
  resBetaOpt: {
    title: "Optimum Beta (βopt)",
    formula: "βopt = 1 + Pb / Pc",
    detail: "beam loading과 cavity wall loss 기준의 최적 coupling beta 근사값입니다."
  },
  resEacc: {
    title: "Eacc / cavity",
    formula: "Eacc = Vc / Lcavity",
    detail: "cavity당 voltage를 cavity length로 나눈 평균 가속 전계입니다."
  },
  resPc: {
    title: "Dissipated Power (Pc)",
    formula: "Pc = Vc² / (2 × Rsh) × 1000",
    detail: "Vc[MV], Rsh[MΩ] 기준이며 결과는 kW로 변환합니다."
  },
  resPb: {
    title: "Beam Power (Pb)",
    formula: "Pb = Pbeam,total / Ncav",
    detail: "전체 beam loss power를 cavity 개수로 나눈 cavity당 beam power입니다."
  },
  resPg: {
    title: "Forward Power (Pg)",
    formula: "Pg ≈ Pc + Pb + HOM loss + Pr",
    detail: "교육용 power budget 근사식입니다. 실제 RF 운전에서는 coupling/detune/reflection 조건이 추가됩니다."
  },
  resPr: {
    title: "Reflected Power (Pr)",
    formula: "Pr = simplified reflection estimate",
    detail: "현재 HTML에서는 coupling/detune 상태를 반영한 교육용 근사값으로 표시합니다."
  },
  resFcav: {
    title: "Estimated f_cav",
    formula: "f_cav(x) = f_ref + [f_CAD(x) − f_CAD(x_ref)]",
    detail: "CAD trend를 RF Test reference point에 정규화한 provisional tuner mapping입니다."
  },
  resDeltaF: {
    title: "Frequency Error Δf",
    formula: "Δf = f_RF − f_cav",
    detail: "RF frequency와 estimated cavity resonant frequency의 차이입니다."
  },
  resTuneSlope: {
    title: "Local df/dx",
    formula: "df/dx = local slope of f_CAD(x)",
    detail: "현재 tuner position 주변에서 plunger 1 mm 변화당 주파수 변화량입니다."
  },
  resCadQ0: {
    title: "CAD Q0 Trend",
    formula: "Q0(x) = CAD trend interpolation",
    detail: "plunger penetration에 따른 unloaded Q trend를 보간한 값입니다."
  },
  resDetuneEstimate: {
    title: "Detune Estimate",
    formula: "ψ = atan(2 × QL × Δf / f_cav)",
    detail: "frequency error와 loaded Q로 추정한 detune angle입니다."
  },
  resFreqSpec: {
    title: "Frequency Spec",
    formula: "|f_cav − f_ref| ≤ Spec Window",
    detail: "RF Test 기준 operating frequency spec window 통과 여부입니다."
  },
  resGain: {
    title: "Energy Gain Ratio",
    formula: "Energy Gain Ratio = U0 / V_RF",
    detail: "RF voltage 대비 turn당 energy loss 보상 비율입니다."
  }
};

function bindCalculatedFormulaTooltips() {
  const tooltip = $("formulaTooltip");
  if (!tooltip) return;

  let timer = null;

  function hideTooltip() {
    if (timer) window.clearTimeout(timer);
    timer = null;
    tooltip.classList.remove("visible");
  }

  function showTooltip(el) {
    const info = calculatedFormulaTooltips[el.id];
    if (!info) return;

    tooltip.innerHTML = `<strong>${info.title}</strong>${info.detail}<code>${info.formula}</code>`;

    const rect = el.getBoundingClientRect();
    const left = Math.max(12, Math.min(rect.left - 160, window.innerWidth - 440));
    const top = Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - 150));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add("visible");
  }

  Object.keys(calculatedFormulaTooltips).forEach((id) => {
    const el = $(id);
    if (!el) return;

    el.addEventListener("mouseenter", () => {
      timer = window.setTimeout(() => showTooltip(el), 1000);
    });
    el.addEventListener("mouseleave", hideTooltip);
    el.addEventListener("focus", () => {
      timer = window.setTimeout(() => showTooltip(el), 1000);
    });
    el.addEventListener("blur", hideTooltip);
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `${calculatedFormulaTooltips[id].title} formula`);
  });
}

bindCalculatedFormulaTooltips();


/* v57: visualize Calculated Results changed by Scenario selection */
const scenarioChangedResultIdsV57 = [
  "resEacc",
  "resPc",
  "resPb",
  "resBetaOpt",
  "resPg",
  "resPr",
  "resGain"
];

let lastScenarioValueV57 = null;

function getCalculatedResultContainerV57(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  return el.closest(".result-row") || el.closest(".result") || el.closest("li") || el.parentElement;
}

function clearScenarioResultHighlightsV57() {
  scenarioChangedResultIdsV57.forEach((id) => {
    const row = getCalculatedResultContainerV57(id);
    if (!row) return;
    row.classList.remove("scenario-changed", "scenario-flash");
  });

  const notice = document.getElementById("scenarioChangeNotice");
  if (notice) notice.classList.remove("visible");
}

function applyScenarioResultHighlightsV57(forceFlash = false) {
  const nCavEl = document.getElementById("nCav");
  if (!nCavEl) return;

  const nCav = Number(nCavEl.value);
  const isScenario = Number.isFinite(nCav) && nCav !== 10;

  clearScenarioResultHighlightsV57();

  if (!isScenario && !forceFlash) {
    lastScenarioValueV57 = nCav;
    return;
  }

  scenarioChangedResultIdsV57.forEach((id) => {
    const row = getCalculatedResultContainerV57(id);
    if (!row) return;
    row.classList.add("scenario-changed");

    if (forceFlash || lastScenarioValueV57 !== nCav) {
      row.classList.remove("scenario-flash");
      void row.offsetWidth;
      row.classList.add("scenario-flash");
    }
  });

  const notice = document.getElementById("scenarioChangeNotice");
  if (notice) {
    notice.textContent = `Scenario NC-${nCav}: cavity-count dependent results are highlighted.`;
    notice.classList.add("visible");
  }

  lastScenarioValueV57 = nCav;
}

function bindScenarioHighlightV57() {
  const scenarioSelect = document.getElementById("scenarioSelect");
  if (scenarioSelect) {
    scenarioSelect.addEventListener("change", () => {
      window.setTimeout(() => applyScenarioResultHighlightsV57(true), 30);
    }, true);
  }

  document.querySelectorAll(".scenario-btn").forEach((button) => {
    button.addEventListener("click", () => {
      window.setTimeout(() => applyScenarioResultHighlightsV57(true), 30);
    }, true);
  });

  const nCavEl = document.getElementById("nCav");
  if (nCavEl) {
    nCavEl.addEventListener("input", () => {
      window.setTimeout(() => applyScenarioResultHighlightsV57(true), 30);
    });
  }

  window.setTimeout(() => applyScenarioResultHighlightsV57(false), 100);
}

bindScenarioHighlightV57();


/* v58: Scenario global changed-value visualization */
const scenarioBaselineSnapshotV58 = new Map();
let lastScenarioValueV58 = null;
let scenarioSnapshotReadyV58 = false;

const scenarioValueIdsV58 = [
  // Top KPI values
  "kpiTotalLoss", "kpiBeamLossPower", "kpiPhase", "kpiVc", "kpiEacc", "kpiPg", "kpiPr",
  // Calculated Results
  "resQ", "resCos", "resPhase", "resRQ", "resRsh", "resQ0", "resQL", "resBeta",
  "resBetaOpt", "resEacc", "resPc", "resPb", "resPg", "resPr", "resFcav", "resDeltaF",
  "resTuneSlope", "resCadQ0", "resDetuneEstimate", "resFreqSpec", "resGain",
  // Bottom summary widgets
  "miniEnergyLoss", "miniBeamPower", "miniCavityVoltage", "miniDissipated", "miniForward",
  "miniDetune", "miniHprfMargin",
  // 3D annotation dynamic values
  "annoFcav", "annoDetune", "annoRQ", "annoRsh", "annoQe",
  // Detune / HPRF / Power panel values if present
  "panelFcav", "panelDeltaF", "panelSlope", "panelCadQ0",
  "detuneValue", "hprfCoupler", "hprfLine", "hprfHom", "hprfSspa", "hprfRated", "hprfMargin",
  "flowSspa", "flowLine", "flowCoupler", "flowCavity", "flowBeam", "flowDissipated", "flowReflected"
];

const scenarioSemanticSelectorsV58 = [
  ".kpi-card",
  ".mini-widget",
  ".annotation",
  ".budget-table tbody tr.selected-row",
  "#panel-power .power-flow-wide",
  "#panel-hprf .info-card",
  "#panel-detune .info-card",
  "#panel-cavity .info-card",
  "#panel-beam .chart-card",
  "#panel-cavity .chart-card",
  "#panel-effect .effect-flow-card",
  "#panel-effect .effect-table-card"
];

function getScenarioContainerV58(el) {
  if (!el) return null;
  return el.closest(".kpi-card")
      || el.closest(".mini-widget")
      || el.closest(".result-row")
      || el.closest(".result")
      || el.closest(".annotation")
      || el.closest(".info-card")
      || el.closest(".chart-card")
      || el.closest(".chart-box")
      || el.closest(".power-flow-wide")
      || el.closest(".effect-flow-card")
      || el.closest(".effect-table-card")
      || el.closest("tr")
      || el.parentElement;
}

function clearScenarioGlobalHighlightsV58() {
  document.querySelectorAll(".scenario-affected, .scenario-affected-flash").forEach((el) => {
    el.classList.remove("scenario-affected", "scenario-affected-flash");
  });

  const globalNotice = document.getElementById("scenarioGlobalNotice");
  if (globalNotice) globalNotice.classList.remove("visible");

  if (typeof clearScenarioResultHighlightsV57 === "function") {
    clearScenarioResultHighlightsV57();
  }
}

function takeScenarioSnapshotV58() {
  scenarioBaselineSnapshotV58.clear();
  scenarioValueIdsV58.forEach((id) => {
    const el = document.getElementById(id);
    if (el) scenarioBaselineSnapshotV58.set(id, (el.textContent || "").trim());
  });
  scenarioSnapshotReadyV58 = true;
}

function markScenarioTargetV58(target, flash = false) {
  if (!target) return;
  target.classList.add("scenario-affected");
  if (flash) {
    target.classList.remove("scenario-affected-flash");
    void target.offsetWidth;
    target.classList.add("scenario-affected-flash");
  }
}

function applyScenarioGlobalHighlightsV58(forceFlash = false) {
  const nCavEl = document.getElementById("nCav");
  const nCav = nCavEl ? Number(nCavEl.value) : 10;

  if (!scenarioSnapshotReadyV58) {
    takeScenarioSnapshotV58();
  }

  clearScenarioGlobalHighlightsV58();

  const isBaseline = Number.isFinite(nCav) && nCav === 10;
  if (isBaseline && !forceFlash) {
    lastScenarioValueV58 = nCav;
    return;
  }

  const shouldFlash = forceFlash || lastScenarioValueV58 !== nCav;

  // Actual value-change based highlighting against NC-10 baseline snapshot.
  scenarioValueIdsV58.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const before = scenarioBaselineSnapshotV58.get(id);
    const now = (el.textContent || "").trim();

    if (before !== undefined && before !== now) {
      markScenarioTargetV58(getScenarioContainerV58(el), shouldFlash);
    }
  });

  // Semantic view-level highlighting for panels whose data is scenario-linked.
  scenarioSemanticSelectorsV58.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      const text = (el.textContent || "").toLowerCase();
      const likelyScenarioLinked =
        text.includes("cavity") ||
        text.includes("power") ||
        text.includes("eacc") ||
        text.includes("pc") ||
        text.includes("pb") ||
        text.includes("pg") ||
        text.includes("hprf") ||
        text.includes("margin") ||
        text.includes("coupler") ||
        text.includes("voltage") ||
        text.includes("detune") ||
        text.includes("q") ||
        el.matches(".budget-table tbody tr.selected-row");

      if (likelyScenarioLinked) {
        markScenarioTargetV58(el, shouldFlash);
      }
    });
  });

  const globalNotice = document.getElementById("scenarioGlobalNotice");
  if (globalNotice) {
    globalNotice.textContent = `Scenario NC-${nCav}: changed values are highlighted across the screen.`;
    globalNotice.classList.add("visible");
  }

  const localNotice = document.getElementById("scenarioChangeNotice");
  if (localNotice) {
    localNotice.textContent = `Scenario NC-${nCav}: all scenario-linked changed values are highlighted.`;
    localNotice.classList.add("visible");
  }

  lastScenarioValueV58 = nCav;
}

function bindScenarioGlobalHighlightV58() {
  window.setTimeout(() => takeScenarioSnapshotV58(), 250);

  const scenarioSelect = document.getElementById("scenarioSelect");
  if (scenarioSelect) {
    scenarioSelect.addEventListener("change", () => {
      window.setTimeout(() => applyScenarioGlobalHighlightsV58(true), 80);
    }, true);
  }

  document.querySelectorAll(".scenario-btn").forEach((button) => {
    button.addEventListener("click", () => {
      window.setTimeout(() => applyScenarioGlobalHighlightsV58(true), 80);
    }, true);
  });

  const nCavEl = document.getElementById("nCav");
  if (nCavEl) {
    nCavEl.addEventListener("input", () => {
      window.setTimeout(() => applyScenarioGlobalHighlightsV58(true), 80);
    });
  }

  // Re-apply after chart/view redraws.
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      window.setTimeout(() => applyScenarioGlobalHighlightsV58(false), 160);
    });
  });
}

bindScenarioGlobalHighlightV58();


/* v59: Scenario visualization should be temporary, not persistent */
let scenarioTempClearTimerV59 = null;

function clearScenarioGlobalHighlightsV59() {
  document.querySelectorAll(".scenario-affected, .scenario-affected-flash, .scenario-changed, .scenario-flash").forEach((el) => {
    el.classList.remove("scenario-affected", "scenario-affected-flash", "scenario-changed", "scenario-flash");
  });

  const globalNotice = document.getElementById("scenarioGlobalNotice");
  if (globalNotice) {
    globalNotice.classList.remove("visible");
    globalNotice.textContent = "";
  }

  const localNotice = document.getElementById("scenarioChangeNotice");
  if (localNotice) {
    localNotice.classList.remove("visible");
  }
}

function scheduleScenarioHighlightClearV59() {
  if (scenarioTempClearTimerV59) {
    window.clearTimeout(scenarioTempClearTimerV59);
  }
  scenarioTempClearTimerV59 = window.setTimeout(() => {
    clearScenarioGlobalHighlightsV59();
  }, 1700);
}

if (typeof applyScenarioGlobalHighlightsV58 === "function") {
  const originalApplyScenarioGlobalHighlightsV58 = applyScenarioGlobalHighlightsV58;
  applyScenarioGlobalHighlightsV58 = function(forceFlash = false) {
    originalApplyScenarioGlobalHighlightsV58(forceFlash);

    const globalNotice = document.getElementById("scenarioGlobalNotice");
    if (globalNotice) {
      globalNotice.classList.remove("visible");
      globalNotice.textContent = "";
    }

    scheduleScenarioHighlightClearV59();
  };
}

if (typeof applyScenarioResultHighlightsV57 === "function") {
  const originalApplyScenarioResultHighlightsV57 = applyScenarioResultHighlightsV57;
  applyScenarioResultHighlightsV57 = function(forceFlash = false) {
    originalApplyScenarioResultHighlightsV57(forceFlash);
    scheduleScenarioHighlightClearV59();
  };
}


/* v60: Scenario highlight actual changed values only; no permanent badges */
let scenarioTempClearTimerV60 = null;

function clearScenarioGlobalHighlightsV60() {
  document.querySelectorAll(".scenario-affected, .scenario-affected-flash, .scenario-changed, .scenario-flash").forEach((el) => {
    el.classList.remove("scenario-affected", "scenario-affected-flash", "scenario-changed", "scenario-flash");
  });

  ["scenarioGlobalNotice", "scenarioChangeNotice"].forEach((id) => {
    const notice = document.getElementById(id);
    if (notice) {
      notice.classList.remove("visible");
      notice.textContent = "";
    }
  });
}

function scheduleScenarioHighlightClearV60() {
  if (scenarioTempClearTimerV60) {
    window.clearTimeout(scenarioTempClearTimerV60);
  }
  scenarioTempClearTimerV60 = window.setTimeout(() => {
    clearScenarioGlobalHighlightsV60();
  }, 1500);
}

function getScenarioContainerV60(el) {
  if (!el) return null;
  return el.closest(".kpi-card")
      || el.closest(".mini-widget")
      || el.closest(".result-row")
      || el.closest(".result")
      || el.closest(".annotation")
      || el.closest(".info-card")
      || el.closest(".power-flow-wide")
      || el.closest("tr")
      || el.parentElement;
}

function markScenarioTargetV60(target, flash = true) {
  if (!target) return;
  target.classList.add("scenario-affected");
  if (flash) {
    target.classList.remove("scenario-affected-flash");
    void target.offsetWidth;
    target.classList.add("scenario-affected-flash");
  }
}

function applyScenarioSoftHighlightsV60(forceFlash = true) {
  const nCavEl = document.getElementById("nCav");
  const nCav = nCavEl ? Number(nCavEl.value) : 10;

  if (typeof scenarioBaselineSnapshotV58 !== "undefined" && typeof scenarioSnapshotReadyV58 !== "undefined" && !scenarioSnapshotReadyV58) {
    takeScenarioSnapshotV58();
  }

  clearScenarioGlobalHighlightsV60();

  // NC-10 is the baseline. Show no scenario highlight after returning to baseline.
  if (Number.isFinite(nCav) && nCav === 10) {
    return;
  }

  const ids = (typeof scenarioValueIdsV58 !== "undefined") ? scenarioValueIdsV58 : [];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    let before;
    if (typeof scenarioBaselineSnapshotV58 !== "undefined") {
      before = scenarioBaselineSnapshotV58.get(id);
    }
    const now = (el.textContent || "").trim();

    if (before !== undefined && before !== now) {
      markScenarioTargetV60(getScenarioContainerV60(el), forceFlash);
    }
  });

  // The NC Power Table selected row is a scenario context indicator, but still soft and temporary.
  document.querySelectorAll(".budget-table tbody tr.selected-row").forEach((row) => {
    markScenarioTargetV60(row, forceFlash);
  });

  scheduleScenarioHighlightClearV60();
}

// Override previous v57/v58 persistent behavior.
applyScenarioGlobalHighlightsV58 = function(forceFlash = true) {
  applyScenarioSoftHighlightsV60(forceFlash);
};

if (typeof applyScenarioResultHighlightsV57 === "function") {
  applyScenarioResultHighlightsV57 = function(forceFlash = true) {
    applyScenarioSoftHighlightsV60(forceFlash);
  };
}

function bindScenarioSoftHighlightV60() {
  const run = () => window.setTimeout(() => applyScenarioSoftHighlightsV60(true), 80);

  const scenarioSelect = document.getElementById("scenarioSelect");
  if (scenarioSelect) scenarioSelect.addEventListener("change", run, true);

  document.querySelectorAll(".scenario-btn").forEach((button) => {
    button.addEventListener("click", run, true);
  });

  const nCavEl = document.getElementById("nCav");
  if (nCavEl) nCavEl.addEventListener("input", run);

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      window.setTimeout(() => applyScenarioSoftHighlightsV60(false), 140);
    });
  });
}

bindScenarioSoftHighlightV60();


/* v61: highlight actual changed outputs for each input, not only component labels */
const outputIdsToWatchV61 = [
  "sideTotalLoss", "sideQe", "sideRfCheck", "sideFcav", "sideDeltaF",
  "kpiTotalLoss", "kpiBeamLoss", "kpiPhase", "kpiVc", "kpiEacc", "kpiPg", "kpiPr",
  "resQ", "resCos", "resPhase", "resRQ", "resRsh", "resQ0", "resQL", "resBeta", "resBetaOpt",
  "resEacc", "resPc", "resPb", "resPg", "resPr", "resFcav", "resDeltaF", "resTuneSlope",
  "resCadQ0", "resDetuneEstimate", "resFreqSpec", "resGain",
  "marginCoupler", "marginSSPA", "marginRated", "marginAvailable",
  "flowSSPA", "flowLine", "flowCoupler", "flowCavity", "flowBeam", "flowPc", "flowPr",
  "detuneValue", "panelFcav", "panelDeltaF", "panelSlope", "panelCadQ0",
  "panelVc", "panelEacc", "panelPc", "panelQe", "panelQL", "panelBetaOpt",
  "beamRfCheck", "beamLossPanel",
  "widgetEnergy", "widgetBeam", "widgetVc", "widgetPc", "widgetPg", "widgetDetune", "widgetMargin",
  "annoFcav", "annoDetune", "annoRQ", "annoRsh", "annoQe"
];

const inputImpactTargetsV61 = {
  energy: ["resGain"],
  current: ["kpiBeamLoss", "resPb", "resBetaOpt", "resPg", "widgetBeam", "widgetPg", "marginCoupler", "marginSSPA", "marginAvailable", "flowBeam", "flowCoupler", "flowSSPA", "beamLossPanel"],
  circumference: ["sideRfCheck", "beamRfCheck"],
  harmonic: ["sideRfCheck", "beamRfCheck"],
  revFreq: ["sideRfCheck", "beamRfCheck"],
  rfFreq: ["resDeltaF", "resDetuneEstimate", "resFreqSpec", "widgetDetune", "annoDetune", "sideDeltaF", "panelDeltaF", "detuneValue"],
  lossBending: ["sideTotalLoss", "kpiTotalLoss", "kpiBeamLoss", "kpiPhase", "resQ", "resCos", "resPhase", "resPb", "resBetaOpt", "resPg", "widgetEnergy", "widgetBeam", "widgetPg", "marginCoupler", "marginSSPA", "marginAvailable", "flowBeam", "flowCoupler", "flowSSPA", "beamLossPanel"],
  lossID: ["sideTotalLoss", "kpiTotalLoss", "kpiBeamLoss", "kpiPhase", "resQ", "resCos", "resPhase", "resPb", "resBetaOpt", "resPg", "widgetEnergy", "widgetBeam", "widgetPg", "marginCoupler", "marginSSPA", "marginAvailable", "flowBeam", "flowCoupler", "flowSSPA", "beamLossPanel"],
  lossOther: ["sideTotalLoss", "kpiTotalLoss", "kpiBeamLoss", "kpiPhase", "resQ", "resCos", "resPhase", "resPb", "resBetaOpt", "resPg", "widgetEnergy", "widgetBeam", "widgetPg", "marginCoupler", "marginSSPA", "marginAvailable", "flowBeam", "flowCoupler", "flowSSPA", "beamLossPanel"],
  vTotal: ["kpiVc", "kpiEacc", "kpiPhase", "resQ", "resCos", "resPhase", "resEacc", "resPc", "resBetaOpt", "resPg", "widgetVc", "widgetPc", "widgetPg", "panelVc", "panelEacc", "panelPc", "flowCavity", "flowPc"],
  nCav: ["kpiVc", "kpiEacc", "kpiPg", "kpiPr", "resEacc", "resPc", "resPb", "resBetaOpt", "resPg", "resPr", "widgetVc", "widgetPc", "widgetPg", "widgetBeam", "widgetMargin", "panelVc", "panelEacc", "panelPc", "flowCavity", "flowBeam", "flowPc", "flowPr", "marginCoupler", "marginSSPA", "marginAvailable"],
  rq: ["resRQ", "annoRQ"],
  q0: ["resQ0", "resQL", "sideQe", "annoQe", "panelQe", "panelQL"],
  rsh: ["resRsh", "annoRsh", "resPc", "resBetaOpt", "resPg", "widgetPc", "widgetPg", "panelPc", "flowPc", "flowCoupler", "marginCoupler"],
  cavLength: ["kpiEacc", "resEacc", "widgetVc", "panelEacc"],
  beta: ["resBeta", "resQL", "sideQe", "annoQe", "panelQe", "panelQL"],
  tunerPos: ["resFcav", "resDeltaF", "resTuneSlope", "resCadQ0", "resDetuneEstimate", "resFreqSpec", "widgetDetune", "annoFcav", "annoDetune", "sideFcav", "sideDeltaF", "panelFcav", "panelDeltaF", "panelSlope", "panelCadQ0", "detuneValue"],
  tunerRefPosition: ["resFcav", "resDeltaF", "resDetuneEstimate", "resFreqSpec", "widgetDetune", "annoFcav", "annoDetune", "sideFcav", "sideDeltaF", "panelFcav", "panelDeltaF", "detuneValue"],
  tunerRefFreq: ["resFcav", "resDeltaF", "resDetuneEstimate", "resFreqSpec", "widgetDetune", "annoFcav", "annoDetune", "sideFcav", "sideDeltaF", "panelFcav", "panelDeltaF", "detuneValue"],
  tunerSpecWindow: ["resFreqSpec"],
  homLoss: ["kpiPg", "resPg", "widgetPg", "widgetMargin", "marginCoupler", "marginSSPA", "marginAvailable", "flowCoupler", "flowSSPA"],
  lineLoss: ["marginSSPA", "marginAvailable", "widgetMargin", "flowLine", "flowSSPA"],
  opPoint: ["marginRated", "marginAvailable", "widgetMargin"]
};

const inputLabelImpactTargetsV61 = {
  current: [],
  lossBending: [],
  lossID: [],
  lossOther: [],
  vTotal: ["body"],
  nCav: ["body", "frame"],
  rq: ["branch"],
  q0: ["coupler"],
  rsh: ["body"],
  cavLength: ["body"],
  beta: ["coupler"],
  tunerPos: ["tuner"],
  tunerRefPosition: ["tuner"],
  tunerRefFreq: ["tuner"],
  tunerSpecWindow: [],
  homLoss: [],
  lineLoss: [],
  opPoint: [],
  harmonic: [],
  rfFreq: ["tuner"],
  revFreq: [],
  circumference: []
};

let lastChangedInputIdV61 = null;
let inputImpactNoteTimerV61 = null;

function snapshotOutputs() {
  const snapshot = {};
  outputIdsToWatchV61.forEach((id) => {
    const el = document.getElementById(id);
    if (el) snapshot[id] = (el.textContent || "").trim();
  });
  return snapshot;
}

function getChangedOutputContainerV61(el) {
  if (!el) return null;
  return el.closest(".kpi-card")
      || el.closest(".mini-widget")
      || el.closest(".result-card dl > div")
      || el.closest(".derived-pill")
      || el.closest(".annotation")
      || el.closest(".info-card")
      || el.closest(".power-node")
      || el.closest(".flow-node")
      || el.closest(".chart-card")
      || el.closest(".card")
      || el.parentElement;
}

function shortChangedLabelV61(id) {
  const el = document.getElementById(id);
  const container = getChangedOutputContainerV61(el);
  if (!container) return id;

  const dt = container.querySelector("dt");
  if (dt) return dt.textContent.trim();

  const title = container.querySelector("span, b, h3");
  if (title) return title.textContent.trim();

  if (id.startsWith("kpi")) return id.replace("kpi", "KPI ");
  if (id.startsWith("widget")) return id.replace("widget", "Summary ");
  if (id.startsWith("anno")) return "Overview label";
  return id;
}

function showInputImpactNoteV61(inputId, changedIds) {
  const note = document.getElementById("inputChangeImpactNote");
  if (!note) return;

  const uniqueLabels = [...new Set(changedIds.map(shortChangedLabelV61))].filter(Boolean).slice(0, 6);
  const inputLabel = document.querySelector(`label[for="${inputId}"], #${inputId}`)?.closest("label")?.textContent?.trim()
    || inputId;

  if (!uniqueLabels.length) {
    note.innerHTML = `<b>${inputLabel}</b><small>현재 표시 영역에서 직접 바뀐 출력값은 없습니다. 필요 시 관련 탭에서 확인하세요.</small>`;
  } else {
    note.innerHTML = `<b>${inputLabel}</b><small>Changed outputs: ${uniqueLabels.join(" · ")}</small>`;
  }

  note.classList.remove("visible");
  void note.offsetWidth;
  note.classList.add("visible");

  if (inputImpactNoteTimerV61) window.clearTimeout(inputImpactNoteTimerV61);
  inputImpactNoteTimerV61 = window.setTimeout(() => {
    note.classList.remove("visible");
  }, 2200);
}

function flashChangedOutputs(beforeSnapshot) {
  if (suppressChangeFlash) return;

  const changedIds = [];
  outputIdsToWatchV61.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const before = beforeSnapshot[id];
    const after = (el.textContent || "").trim();

    if (before !== undefined && before !== after) {
      changedIds.push(id);
      el.classList.remove("value-changed");
      void el.offsetWidth;
      el.classList.add("value-changed");

      const panel = getChangedOutputContainerV61(el);
      if (panel) {
        panel.classList.remove("changed-panel");
        void panel.offsetWidth;
        panel.classList.add("changed-panel");
      }
    }
  });

  // Also highlight expected targets if the value is off-screen or text did not change due rounding.
  if (lastChangedInputIdV61) {
    (inputImpactTargetsV61[lastChangedInputIdV61] || []).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const panel = getChangedOutputContainerV61(el);
      if (panel) {
        panel.classList.remove("changed-panel");
        void panel.offsetWidth;
        panel.classList.add("changed-panel");
      }
      if (!changedIds.includes(id)) changedIds.push(id);
    });
    showInputImpactNoteV61(lastChangedInputIdV61, changedIds);
  }
}

function flashExpectedImpact(inputId) {
  const ids = inputImpactTargetsV61[inputId] || [];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.remove("value-changed");
    void el.offsetWidth;
    el.classList.add("value-changed");

    const panel = getChangedOutputContainerV61(el);
    if (panel) {
      panel.classList.remove("changed-panel");
      void panel.offsetWidth;
      panel.classList.add("changed-panel");
    }
  });
  showInputImpactNoteV61(inputId, ids);
}

function flashLabelImpacts(inputId) {
  lastChangedInputIdV61 = inputId;
  const targets = [...new Set(inputLabelImpactTargetsV61[inputId] || [])];

  document.querySelectorAll(".annotation.label-impact").forEach((el) => el.classList.remove("label-impact"));

  targets.forEach((area) => {
    const label = document.querySelector(`[data-label-area="${area}"]`);
    if (label) {
      void label.offsetWidth;
      label.classList.add("label-impact");
    }
  });
}


/* v62: light highlight behavior, no explanatory floating boxes */
let lightHighlightTimerV62 = null;

function clearLightHighlightsV62() {
  document.querySelectorAll(".scenario-affected, .scenario-affected-flash, .scenario-changed, .scenario-flash, .changed-panel, .value-changed, .label-impact").forEach((el) => {
    el.classList.remove("scenario-affected", "scenario-affected-flash", "scenario-changed", "scenario-flash", "changed-panel", "value-changed", "label-impact");
  });
  document.querySelectorAll(".scenario-select select").forEach((el) => el.classList.remove("scenario-select-active"));
  ["scenarioGlobalNotice", "scenarioChangeNotice", "inputChangeImpactNote"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("visible");
      el.textContent = "";
      el.innerHTML = "";
    }
  });
}

function scheduleLightHighlightClearV62() {
  if (lightHighlightTimerV62) window.clearTimeout(lightHighlightTimerV62);
  lightHighlightTimerV62 = window.setTimeout(clearLightHighlightsV62, 1250);
}

/* Override note to no-op; highlight only. */
function showInputImpactNoteV61(inputId, changedIds) {
  scheduleLightHighlightClearV62();
}

/* Wrap existing scenario highlighters so they clear quickly and do not keep labels. */
if (typeof applyScenarioSoftHighlightsV60 === "function") {
  const previousApplyScenarioSoftHighlightsV60 = applyScenarioSoftHighlightsV60;
  applyScenarioSoftHighlightsV60 = function(forceFlash = true) {
    previousApplyScenarioSoftHighlightsV60(forceFlash);
    const select = document.getElementById("scenarioSelect");
    if (select) select.classList.add("scenario-select-active");
    scheduleLightHighlightClearV62();
  };
}

if (typeof applyScenarioGlobalHighlightsV58 === "function") {
  applyScenarioGlobalHighlightsV58 = function(forceFlash = true) {
    if (typeof applyScenarioSoftHighlightsV60 === "function") {
      applyScenarioSoftHighlightsV60(forceFlash);
    }
    scheduleLightHighlightClearV62();
  };
}

if (typeof applyScenarioResultHighlightsV57 === "function") {
  applyScenarioResultHighlightsV57 = function(forceFlash = true) {
    if (typeof applyScenarioSoftHighlightsV60 === "function") {
      applyScenarioSoftHighlightsV60(forceFlash);
    }
    scheduleLightHighlightClearV62();
  };
}

/* Also clear after normal input changed output flashes. */
const previousFlashChangedOutputsV62 = flashChangedOutputs;
flashChangedOutputs = function(beforeSnapshot) {
  previousFlashChangedOutputsV62(beforeSnapshot);
  scheduleLightHighlightClearV62();
};

const previousFlashExpectedImpactV62 = flashExpectedImpact;
flashExpectedImpact = function(inputId) {
  previousFlashExpectedImpactV62(inputId);
  scheduleLightHighlightClearV62();
};

const previousFlashLabelImpactsV62 = flashLabelImpacts;
flashLabelImpacts = function(inputId) {
  previousFlashLabelImpactsV62(inputId);
  scheduleLightHighlightClearV62();
};


/* v68: prevent whole Overview/card background highlight */
function getChangedOutputContainerV61(el) {
  if (!el) return null;
  return el.closest(".kpi-card")
      || el.closest(".mini-widget")
      || el.closest(".result-card dl > div")
      || el.closest(".derived-pill")
      || el.closest(".annotation")
      || el.closest(".power-node")
      || el.closest(".flow-node")
      || el.closest(".info-card")
      || el.closest("tr")
      || el.parentElement;
}
