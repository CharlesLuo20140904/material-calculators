import { calculateFlooring } from '../calculators/flooring.js';
import { compactNumber, currency, readNumber, setOutput } from '../core/format.js';
import { mountCalculator } from '../core/page.js?v=20261019c';

const form = document.querySelector('#flooring-form');
let latestSummary = 'Complete the project details to create an estimate.';

function readInput() {
  const input = {
    unit: form.dataset.unit,
    length: readNumber(form, 'length', 0.01),
    width: readNumber(form, 'width', 0.01),
    waste: readNumber(form, 'waste', 0),
    coveragePerBox: readNumber(form, 'coveragePerBox', 0.01),
    pricePerBox: readNumber(form, 'pricePerBox', 0),
  };
  return Object.values(input).includes(null) ? null : input;
}

function clearResult() {
  ['flooring-boxes', 'flooring-area', 'flooring-supplied', 'flooring-cost'].forEach((id) => {
    setOutput(id, '—');
  });
  latestSummary = 'Flooring estimate is incomplete.';
}

function resultSummary(result, unit) {
  const area = unit === 'imperial' ? 'sq ft' : 'm²';
  return [
    `Boxes to buy: ${result.boxes}`,
    `Measured floor: ${compactNumber(result.area)} ${area}`,
    `Flooring supplied: ${compactNumber(result.purchaseArea)} ${area}`,
    `Estimated material cost: ${currency(result.cost)}`,
  ].join('\n');
}

function render() {
  const input = readInput();
  if (!input) return clearResult();
  const result = calculateFlooring(input);
  const area = input.unit === 'imperial' ? 'sq ft' : 'm²';
  setOutput('flooring-boxes', compactNumber(result.boxes, 0));
  setOutput('flooring-area', `${compactNumber(result.area)} ${area}`);
  setOutput('flooring-supplied', `${compactNumber(result.purchaseArea)} ${area}`);
  setOutput('flooring-cost', currency(result.cost));
  latestSummary = resultSummary(result, input.unit);
}

mountCalculator({ form, render, getSummary: () => latestSummary });
