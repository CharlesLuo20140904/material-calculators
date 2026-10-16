import { syncUnitUi, switchUnits } from './units.js';

function setButtonState(button, text) {
  const original = button.dataset.label || button.textContent;
  button.dataset.label = original;
  button.textContent = text;
  window.setTimeout(() => {
    button.textContent = original;
  }, 1400);
}

async function copySummary(button, getSummary) {
  try {
    await navigator.clipboard.writeText(getSummary());
    setButtonState(button, 'Copied');
  } catch {
    setButtonState(button, 'Copy unavailable');
  }
}

function bindUnitButtons(form, render) {
  form.querySelectorAll('[data-unit-target]').forEach((button) => {
    button.addEventListener('click', () => {
      switchUnits(form, button.dataset.unitTarget);
      render();
    });
  });
}

function bindActions(form, render, getSummary) {
  document.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
    form.reset();
    syncUnitUi(form, 'imperial');
    render();
  });
  const copy = document.querySelector('[data-action="copy"]');
  copy?.addEventListener('click', () => copySummary(copy, getSummary));
  document.querySelector('[data-action="print"]')?.addEventListener('click', () => window.print());
}

export function mountCalculator({ form, render, getSummary }) {
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  bindUnitButtons(form, render);
  bindActions(form, render, getSummary);
  syncUnitUi(form, form.dataset.unit || 'imperial');
  render();
}
