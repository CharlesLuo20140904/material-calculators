import { calculateDrywall, DRYWALL_DEFAULTS } from '../calculators/drywall.js';
import { checked, compactNumber, currency, readInteger, readNumber, setOutput } from '../core/format.js';
import { mountCalculator } from '../core/page.js?v=20261019c';

const form = document.querySelector('#drywall-form');
let latestSummary = 'Complete the project details to create an estimate.';

function readInput() {
  const unit = form.dataset.unit;
  const input = {
    unit,
    length: readNumber(form, 'length', 0.01), width: readNumber(form, 'width', 0.01),
    height: readNumber(form, 'height', 0.01), doors: readInteger(form, 'doors', 0),
    windows: readInteger(form, 'windows', 0), waste: readNumber(form, 'waste', 0),
    sheetWidth: readNumber(form, 'sheetWidth', 0.01),
    sheetLength: readNumber(form, 'sheetLength', 0.01),
    pricePerSheet: readNumber(form, 'pricePerSheet', 0),
    includeCeiling: checked(form, 'includeCeiling'),
    doorArea: DRYWALL_DEFAULTS.doorArea[unit], windowArea: DRYWALL_DEFAULTS.windowArea[unit],
  };
  return Object.values(input).includes(null) ? null : input;
}

function clearResult() {
  ['drywall-sheets', 'drywall-area', 'drywall-supplied', 'drywall-cost'].forEach((id) => {
    setOutput(id, '—');
  });
  latestSummary = 'Drywall estimate is incomplete.';
}

function resultSummary(result, unit) {
  const area = unit === 'imperial' ? 'sq ft' : 'm²';
  return [`Sheets to buy: ${result.sheets}`, `Area to cover: ${compactNumber(result.area)} ${area}`,
    `Board supplied: ${compactNumber(result.suppliedArea)} ${area}`,
    `Estimated material cost: ${currency(result.cost)}`].join('\n');
}

function render() {
  const input = readInput();
  if (!input) return clearResult();
  const result = calculateDrywall(input);
  const area = input.unit === 'imperial' ? 'sq ft' : 'm²';
  setOutput('drywall-sheets', compactNumber(result.sheets, 0));
  setOutput('drywall-area', `${compactNumber(result.area)} ${area}`);
  setOutput('drywall-supplied', `${compactNumber(result.suppliedArea)} ${area}`);
  setOutput('drywall-cost', currency(result.cost));
  latestSummary = resultSummary(result, input.unit);
}

mountCalculator({ form, render, getSummary: () => latestSummary });
