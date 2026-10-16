export const PAINT_DEFAULTS = {
  doorArea: { imperial: 21, metric: 1.95 },
  windowArea: { imperial: 12, metric: 1.11 },
};

function purchaseStep(unit) {
  return unit === 'imperial' ? 0.25 : 1;
}

export function calculatePaint(input) {
  const { length, width, height, doors, windows } = input;
  const opening = doors * input.doorArea + windows * input.windowArea;
  const wallArea = Math.max(0, 2 * (length + width) * height - opening);
  const ceilingArea = input.includeCeiling ? length * width : 0;
  const netArea = wallArea + ceilingArea;
  const coatedArea = netArea * input.coats * (1 + input.waste / 100);
  const exact = coatedArea / input.coverage;
  const step = purchaseStep(input.unit);
  const purchase = Math.ceil(exact / step) * step;
  return {
    netArea,
    coatedArea,
    exact,
    purchase,
    cost: purchase * input.price,
  };
}
