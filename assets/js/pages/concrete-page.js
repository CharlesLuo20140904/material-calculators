import { calculateConcrete } from '../calculators/concrete.js';
import { compactNumber, currency, readNumber, setOutput } from '../core/format.js';
import { mountCalculator } from '../core/page.js?v=20261019c';

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
  ['concrete-bags', 'concrete-volume', 'concrete-supplied', 'concrete-cost'].forEach((id) => {
    setOutput(id, '—');
  });
  latestSummary = 'Concrete estimate is incomplete.';
}

function volumeLabels(unit) {
  return unit === 'imperial'
    ? { base: 'ft³', order: 'yd³' }
    : { base: 'm³', order: 'm³' };
}

function resultSummary(result, unit) {
  const labels = volumeLabels(unit);
  return [`Bags to buy: ${result.bags}`,
    `Order volume: ${compactNumber(result.orderVolume, 2)} ${labels.order}`,
    `Bagged volume supplied: ${compactNumber(result.suppliedVolume, 2)} ${labels.base}`,
    `Estimated material cost: ${currency(result.cost)}`].join('\n');
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
  latestSummary = resultSummary(result, input.unit);
}

mountCalculator({ form, render, getSummary: () => latestSummary });
