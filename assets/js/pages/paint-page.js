import { calculatePaint, PAINT_DEFAULTS } from '../calculators/paint.js';
import { checked, compactNumber, currency, readInteger, readNumber, setOutput } from '../core/format.js';
import { mountCalculator } from '../core/page.js';

const form = document.querySelector('#paint-form');
let latestSummary = 'Complete the project details to create an estimate.';

function readInput() {
  const unit = form.dataset.unit;
  const input = {
    unit,
    length: readNumber(form, 'length', 0.01),
    width: readNumber(form, 'width', 0.01),
    height: readNumber(form, 'height', 0.01),
    doors: readInteger(form, 'doors', 0),
    windows: readInteger(form, 'windows', 0),
    coats: readInteger(form, 'coats', 1),
    coverage: readNumber(form, 'coverage', 1),
    waste: readNumber(form, 'waste', 0),
    price: readNumber(form, 'price', 0),
    includeCeiling: checked(form, 'includeCeiling'),
    doorArea: PAINT_DEFAULTS.doorArea[unit],
    windowArea: PAINT_DEFAULTS.windowArea[unit],
  };
  return Object.values(input).includes(null) ? null : input;
}

function clearResult() {
  ['paint-purchase', 'paint-exact', 'paint-area', 'paint-cost'].forEach((id) => {
    setOutput(id, '—');
  });
  latestSummary = 'Paint estimate is incomplete.';
}

function resultSummary(result, unit) {
  const volume = unit === 'imperial' ? 'gal' : 'L';
  const area = unit === 'imperial' ? 'sq ft' : 'm²';
  return [
    `Paint to buy: ${compactNumber(result.purchase, 2)} ${volume}`,
    `Exact calculated use: ${compactNumber(result.exact, 2)} ${volume}`,
    `Prepared surface: ${compactNumber(result.netArea)} ${area}`,
    `Estimated material cost: ${currency(result.cost)}`,
  ].join('\n');
}

function render() {
  const input = readInput();
  if (!input) return clearResult();
  const result = calculatePaint(input);
  const volume = input.unit === 'imperial' ? 'gal' : 'L';
  const area = input.unit === 'imperial' ? 'sq ft' : 'm²';
  setOutput('paint-purchase', `${compactNumber(result.purchase, 2)} ${volume}`);
  setOutput('paint-exact', `${compactNumber(result.exact, 2)} ${volume}`);
  setOutput('paint-area', `${compactNumber(result.netArea)} ${area}`);
  setOutput('paint-cost', currency(result.cost));
  latestSummary = resultSummary(result, input.unit);
}

mountCalculator({ form, render, getSummary: () => latestSummary });
