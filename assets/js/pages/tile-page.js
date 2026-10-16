import { calculateTile } from '../calculators/tile.js';
import { compactNumber, currency, readInteger, readNumber, setOutput } from '../core/format.js';
import { mountCalculator } from '../core/page.js';

const form = document.querySelector('#tile-form');
let latestSummary = 'Complete the project details to create an estimate.';

function readInput() {
  const input = {
    unit: form.dataset.unit,
    length: readNumber(form, 'length', 0.01),
    width: readNumber(form, 'width', 0.01),
    tileWidth: readNumber(form, 'tileWidth', 0.01),
    tileHeight: readNumber(form, 'tileHeight', 0.01),
    waste: readNumber(form, 'waste', 0),
    tilesPerBox: readInteger(form, 'tilesPerBox', 1),
    pricePerBox: readNumber(form, 'pricePerBox', 0),
  };
  return Object.values(input).includes(null) ? null : input;
}

function clearResult() {
  ['tile-boxes', 'tile-count', 'tile-area', 'tile-cost'].forEach((id) => {
    setOutput(id, '—');
  });
  latestSummary = 'Tile estimate is incomplete.';
}

function resultSummary(result, unit) {
  const area = unit === 'imperial' ? 'sq ft' : 'm²';
  return [
    `Boxes to buy: ${result.boxes}`,
    `Tiles supplied: ${result.purchaseTiles}`,
    `Project area: ${compactNumber(result.area)} ${area}`,
    `Estimated material cost: ${currency(result.cost)}`,
  ].join('\n');
}

function render() {
  const input = readInput();
  if (!input) return clearResult();
  const result = calculateTile(input);
  const area = input.unit === 'imperial' ? 'sq ft' : 'm²';
  setOutput('tile-boxes', compactNumber(result.boxes, 0));
  setOutput('tile-count', compactNumber(result.purchaseTiles, 0));
  setOutput('tile-area', `${compactNumber(result.area)} ${area}`);
  setOutput('tile-cost', currency(result.cost));
  latestSummary = resultSummary(result, input.unit);
}

mountCalculator({ form, render, getSummary: () => latestSummary });
