export const DRYWALL_DEFAULTS = {
  doorArea: { imperial: 21, metric: 1.95 },
  windowArea: { imperial: 12, metric: 1.11 },
};

export function calculateDrywall(input) {
  const openingArea = input.doors * input.doorArea + input.windows * input.windowArea;
  const wallArea = Math.max(0, 2 * (input.length + input.width) * input.height - openingArea);
  const ceilingArea = input.includeCeiling ? input.length * input.width : 0;
  const area = wallArea + ceilingArea;
  const requiredArea = area * (1 + input.waste / 100);
  const sheetArea = input.sheetWidth * input.sheetLength;
  const sheets = Math.ceil(requiredArea / sheetArea);
  return {
    area,
    requiredArea,
    sheetArea,
    sheets,
    suppliedArea: sheets * sheetArea,
    cost: sheets * input.pricePerSheet,
  };
}
