export function readNumber(form, name, minimum = 0) {
  const input = form.elements.namedItem(name);
  const value = Number(input?.value);
  const valid = Number.isFinite(value) && value >= minimum;
  input?.setAttribute('aria-invalid', String(!valid));
  return valid ? value : null;
}

export function readInteger(form, name, minimum = 0) {
  const input = form.elements.namedItem(name);
  const value = Number(input?.value);
  const valid = Number.isInteger(value) && value >= minimum;
  input?.setAttribute('aria-invalid', String(!valid));
  return valid ? value : null;
}

export function compactNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function currency(value) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function setOutput(id, value) {
  const output = document.getElementById(id);
  if (output) output.textContent = value;
}

export function checked(form, name) {
  return Boolean(form.elements.namedItem(name)?.checked);
}
