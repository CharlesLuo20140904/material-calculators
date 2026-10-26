import { calculateWallpaper } from '../calculators/wallpaper.js';
import { checked, compactNumber, currency, readNumber, setOutput } from '../core/format.js';
import { mountCalculator } from '../core/page.js';

const form = document.querySelector('#wallpaper-form');
const rows = form.querySelector('[data-wall-rows]');
let latestSummary = 'Complete the project details to create an estimate.';

function validNumber(input, minimum = 0) {
  const value = Number(input.value);
  const valid = Number.isFinite(value) && value >= minimum;
  input.setAttribute('aria-invalid', String(!valid));
  return valid ? value : null;
}

function readWalls() {
  return [...rows.querySelectorAll('.wall-row')].map((row) => ({
    width: validNumber(row.querySelector('[data-wall-width]'), 0.01),
    openingWidth: validNumber(row.querySelector('[data-opening-width]'), 0),
  }));
}

function readInput() {
  const input = {
    unit: form.dataset.unit,
    walls: readWalls(),
    height: readNumber(form, 'height', 0.01),
    rollWidth: readNumber(form, 'rollWidth', 0.01),
    rollLength: readNumber(form, 'rollLength', 0.01),
    repeat: readNumber(form, 'repeat', 0),
    trim: readNumber(form, 'trim', 0),
    pricePerRoll: readNumber(form, 'pricePerRoll', 0),
    matchType: form.elements.namedItem('matchType')?.value,
    reserveRoll: checked(form, 'reserveRoll'),
  };
  const invalidWalls = input.walls.some((wall) => Object.values(wall).includes(null));
  return invalidWalls || Object.values(input).includes(null) ? null : input;
}

function clearResult(message = 'Wallpaper estimate is incomplete.') {
  ['wallpaper-rolls', 'wallpaper-base-rolls', 'wallpaper-drops', 'wallpaper-cut',
    'wallpaper-waste', 'wallpaper-cost'].forEach((id) => setOutput(id, '—'));
  setOutput('wallpaper-message', message);
  latestSummary = message;
}

function lengthLabel(value, unit) {
  return `${compactNumber(value, 1)} ${unit === 'imperial' ? 'ft' : 'm'}`;
}

function resultSummary(result, unit) {
  return [
    `Rolls to buy: ${result.rolls}`,
    `Base estimate: ${result.baseRolls} rolls`,
    `Full drops required: ${result.dropsNeeded}`,
    `Matched cut length: ${lengthLabel(result.standardDrop, unit)}`,
    `Pattern alignment waste: ${lengthLabel(result.repeatWaste, unit)}`,
    `Estimated material cost: ${currency(result.cost)}`,
  ].join('\n');
}

function render() {
  const input = readInput();
  if (!input) return clearResult();
  const result = calculateWallpaper(input);
  if (!result) return clearResult('The roll is shorter than one required matched drop.');
  setOutput('wallpaper-rolls', compactNumber(result.rolls, 0));
  setOutput('wallpaper-base-rolls', compactNumber(result.baseRolls, 0));
  setOutput('wallpaper-drops', compactNumber(result.dropsNeeded, 0));
  setOutput('wallpaper-cut', lengthLabel(result.standardDrop, input.unit));
  setOutput('wallpaper-waste', lengthLabel(result.repeatWaste, input.unit));
  setOutput('wallpaper-cost', currency(result.cost));
  setOutput('wallpaper-message', 'Confirm the match symbol, packaged roll size, and dye lot before ordering.');
  latestSummary = resultSummary(result, input.unit);
}

function wallRow(index, width = '') {
  const unit = form.dataset.unit === 'metric' ? 'm' : 'ft';
  const row = document.createElement('div');
  row.className = 'wall-row';
  row.innerHTML = `<span class="wall-index">${String(index).padStart(2, '0')}</span>
    <label class="compact-field">Wall width<div class="input-wrap"><input data-wall-width data-convert="length" type="number" value="${width}" min="0.01" step="0.1" inputmode="decimal"><span class="unit-label" data-unit-imperial="ft" data-unit-metric="m">${unit}</span></div></label>
    <label class="compact-field">Full-height opening<div class="input-wrap"><input data-opening-width data-convert="length" type="number" value="0" min="0" step="0.1" inputmode="decimal"><span class="unit-label" data-unit-imperial="ft" data-unit-metric="m">${unit}</span></div></label>
    <button class="row-remove" type="button" data-remove-wall aria-label="Remove wall">Remove</button>`;
  return row;
}

function refreshRows() {
  const allRows = [...rows.querySelectorAll('.wall-row')];
  allRows.forEach((row, index) => {
    row.querySelector('.wall-index').textContent = String(index + 1).padStart(2, '0');
    row.querySelector('[data-remove-wall]').hidden = allRows.length === 1;
  });
}

function bindWallControls() {
  form.querySelector('[data-add-wall]').addEventListener('click', () => {
    rows.append(wallRow(rows.children.length + 1, form.dataset.unit === 'metric' ? '3.6' : '12'));
    refreshRows();
    render();
  });
  rows.addEventListener('click', (event) => {
    if (!event.target.matches('[data-remove-wall]')) return;
    event.target.closest('.wall-row').remove();
    refreshRows();
    render();
  });
}

function bindPresets() {
  form.querySelectorAll('[data-roll-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const metric = form.dataset.unit === 'metric';
      const values = button.dataset.rollPreset === 'us'
        ? (metric ? [52.1, 10.058] : [20.5, 33])
        : (metric ? [53, 10.05] : [20.9, 32.97]);
      form.elements.namedItem('rollWidth').value = values[0];
      form.elements.namedItem('rollLength').value = values[1];
      render();
    });
  });
}

function bindReset() {
  form.querySelector('[data-action="reset"]').addEventListener('click', () => {
    [...rows.querySelectorAll('.wall-row')].slice(1).forEach((row) => row.remove());
    refreshRows();
  });
}

bindWallControls();
bindPresets();
bindReset();
refreshRows();
mountCalculator({ form, render, getSummary: () => latestSummary });
