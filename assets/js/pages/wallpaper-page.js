import { calculateWallpaper } from '../calculators/wallpaper.js';
import { checked, compactNumber, currency, readNumber, setOutput } from '../core/format.js';
import { mountCalculator } from '../core/page.js';

const form = document.querySelector('#wallpaper-form');
let latestSummary = 'Complete the project details to create an estimate.';

function readInput() {
  const input = {
    unit: form.dataset.unit,
    wallWidth: readNumber(form, 'wallWidth', 0.01),
    height: readNumber(form, 'height', 0.01),
    rollWidth: readNumber(form, 'rollWidth', 0.01),
    rollLength: readNumber(form, 'rollLength', 0.01),
    repeat: readNumber(form, 'repeat', 0),
    trim: readNumber(form, 'trim', 0),
    pricePerRoll: readNumber(form, 'pricePerRoll', 0),
    reserveRoll: checked(form, 'reserveRoll'),
  };
  return Object.values(input).includes(null) ? null : input;
}

function clearResult(message = 'Wallpaper estimate is incomplete.') {
  ['wallpaper-rolls', 'wallpaper-drops', 'wallpaper-per-roll', 'wallpaper-cost'].forEach((id) => {
    setOutput(id, '—');
  });
  setOutput('wallpaper-message', message);
  latestSummary = message;
}

function resultSummary(result) {
  return [
    `Rolls to buy: ${result.rolls}`,
    `Drops required: ${result.dropsNeeded}`,
    `Drops per roll: ${result.dropsPerRoll}`,
    `Estimated material cost: ${currency(result.cost)}`,
  ].join('\n');
}

function render() {
  const input = readInput();
  if (!input) return clearResult();
  const result = calculateWallpaper(input);
  if (!result) return clearResult('The roll is shorter than one matched drop.');
  setOutput('wallpaper-rolls', compactNumber(result.rolls, 0));
  setOutput('wallpaper-drops', compactNumber(result.dropsNeeded, 0));
  setOutput('wallpaper-per-roll', compactNumber(result.dropsPerRoll, 0));
  setOutput('wallpaper-cost', currency(result.cost));
  setOutput('wallpaper-message', 'Confirm the roll label and dye lot before ordering.');
  latestSummary = resultSummary(result);
}

mountCalculator({ form, render, getSummary: () => latestSummary });
