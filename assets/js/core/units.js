const factors = {
  length: 0.3048,
  smallLength: 2.54,
  area: 0.092903,
  paintCoverage: 0.024542,
  priceVolume: 0.264172,
};

function precision(kind) {
  if (kind === 'smallLength') return 1;
  if (kind === 'priceVolume') return 2;
  return 2;
}

export function convert(value, kind, from, to) {
  if (from === to || !Number.isFinite(value)) return value;
  const factor = factors[kind];
  if (!factor) return value;
  return from === 'imperial' ? value * factor : value / factor;
}

function convertInput(input, from, to) {
  const value = Number(input.value);
  const converted = convert(value, input.dataset.convert, from, to);
  if (!Number.isFinite(converted)) return;
  input.value = String(Number(converted.toFixed(precision(input.dataset.convert))));
}

export function syncUnitUi(form, unit) {
  form.dataset.unit = unit;
  form.querySelectorAll('[data-unit-target]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.unitTarget === unit));
  });
  form.querySelectorAll('[data-unit-imperial]').forEach((node) => {
    const key = unit === 'imperial' ? 'unitImperial' : 'unitMetric';
    node.textContent = node.dataset[key];
  });
}

export function switchUnits(form, unit) {
  const from = form.dataset.unit || 'imperial';
  if (from === unit) return;
  form.querySelectorAll('input[data-convert]').forEach((input) => {
    convertInput(input, from, unit);
  });
  syncUnitUi(form, unit);
}
