import { syncUnitUi, switchUnits } from './units.js?v=20261019c';
import { trackAnalytics } from '../analytics.js';

function calculatorName(form) {
  return form.id.replace('-form', '');
}

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

function bindUnitButtons(form, render, calculator) {
  form.querySelectorAll('[data-unit-target]').forEach((button) => {
    button.addEventListener('click', () => {
      switchUnits(form, button.dataset.unitTarget);
      render();
      trackAnalytics('unit_change', {
        calculator,
        measurement_system: button.dataset.unitTarget,
      });
    });
  });
}

function bindActions(form, render, getSummary, calculator) {
  document.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
    form.reset();
    syncUnitUi(form, 'imperial');
    render();
    trackAnalytics('calculator_reset', { calculator });
  });
  const copy = document.querySelector('[data-action="copy"]');
  copy?.addEventListener('click', () => {
    copySummary(copy, getSummary);
    trackAnalytics('result_copy', { calculator });
  });
  document.querySelector('[data-action="print"]')?.addEventListener('click', () => {
    trackAnalytics('result_print', { calculator });
    window.print();
  });
}

function bindFirstInteraction(form, calculator) {
  form.addEventListener('input', () => {
    trackAnalytics('calculator_start', { calculator });
  }, { once: true });
}

export function mountCalculator({ form, render, getSummary }) {
  const calculator = calculatorName(form);
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  bindUnitButtons(form, render, calculator);
  bindActions(form, render, getSummary, calculator);
  bindFirstInteraction(form, calculator);
  syncUnitUi(form, form.dataset.unit || 'imperial');
  render();
}
