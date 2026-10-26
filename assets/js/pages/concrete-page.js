import { calculateConcrete, CONCRETE_BAG_OPTIONS } from '../calculators/concrete.js';
import { compactNumber, currency, readNumber, setOutput } from '../core/format.js';
import { mountCalculator } from '../core/page.js?v=20261026';

const form = document.querySelector('#concrete-form');
let latestSummary = 'Complete the project details to create an estimate.';

function readInput() {
  const input = {
    unit: form.dataset.unit,
    length: readNumber(form, 'length', 0.01),
    width: readNumber(form, 'width', 0.01),
    depth: readNumber(form, 'depth', 0.01),
    waste: readNumber(form, 'waste', 0),
    bagYield: readNumber(form, 'bagYield', 0.0001),
    pricePerBag: readNumber(form, 'pricePerBag', 0),
  };
  return Object.values(input).includes(null) ? null : input;
}

function clearResult() {
  ['concrete-bags', 'concrete-volume', 'concrete-supplied', 'concrete-cost',
    'bags-40', 'bags-60', 'bags-80'].forEach((id) => setOutput(id, '—'));
  setOutput('concrete-message', 'Complete the slab and product details.');
  latestSummary = 'Concrete estimate is incomplete.';
}

function volumeLabels(unit) {
  return unit === 'imperial' ? { base: 'ft³', order: 'yd³' } : { base: 'm³', order: 'm³' };
}

function resultSummary(result, unit) {
  const labels = volumeLabels(unit);
  const comparisons = result.bagComparisons.map((item) => `${item.size} lb: ${item.bags} bags`);
  return [`Selected bags to buy: ${result.bags}`,
    `Order volume: ${compactNumber(result.orderVolume, 2)} ${labels.order}`,
    ...comparisons,
    `Bagged volume supplied: ${compactNumber(result.suppliedVolume, 2)} ${labels.base}`,
    `Estimated material cost: ${currency(result.cost)}`].join('\n');
}

function renderComparisons(result) {
  result.bagComparisons.forEach((item) => setOutput(`bags-${item.size}`, compactNumber(item.bags, 0)));
}

function render() {
  const input = readInput();
  if (!input) return clearResult();
  const result = calculateConcrete(input);
  const labels = volumeLabels(input.unit);
  setOutput('concrete-bags', compactNumber(result.bags, 0));
  setOutput('concrete-volume', `${compactNumber(result.orderVolume, 2)} ${labels.order}`);
  setOutput('concrete-supplied', `${compactNumber(result.suppliedVolume, 2)} ${labels.base}`);
  setOutput('concrete-cost', currency(result.cost));
  setOutput('concrete-message', result.compareReadyMix
    ? 'At this volume, compare a ready-mix quote with bag cost and labor.'
    : 'For a small pour, bagged mix may be practical; compare local delivery minimums.');
  renderComparisons(result);
  latestSummary = resultSummary(result, input.unit);
}

function presetYield(size, unit) {
  const option = CONCRETE_BAG_OPTIONS.find((item) => item.size === size);
  return option?.[unit];
}

function selectPreset(button) {
  const size = Number(button.dataset.bagSize);
  form.elements.namedItem('bagYield').value = presetYield(size, form.dataset.unit);
  form.querySelectorAll('[data-bag-size]').forEach((item) => {
    item.setAttribute('aria-pressed', String(item === button));
  });
  setOutput('selected-bag-size', `${size} lb bag`);
  render();
}

form.querySelectorAll('[data-bag-size]').forEach((button) => {
  button.addEventListener('click', () => selectPreset(button));
});

form.querySelector('[data-action="reset"]').addEventListener('click', () => {
  form.querySelectorAll('[data-bag-size]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.bagSize === '80'));
  });
  setOutput('selected-bag-size', '80 lb bag');
});

mountCalculator({ form, render, getSummary: () => latestSummary });
