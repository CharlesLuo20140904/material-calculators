export const CONCRETE_BAG_OPTIONS = [
  { size: 40, imperial: 0.30, metric: 0.0085 },
  { size: 60, imperial: 0.45, metric: 0.0127 },
  { size: 80, imperial: 0.60, metric: 0.0170 },
];

function baseDepth(input) {
  return input.unit === 'imperial' ? input.depth / 12 : input.depth / 100;
}

function orderVolume(volume, unit) {
  return unit === 'imperial' ? volume / 27 : volume;
}

function bagComparisons(requiredVolume, unit) {
  return CONCRETE_BAG_OPTIONS.map((option) => ({
    size: option.size,
    yield: option[unit],
    bags: Math.ceil(requiredVolume / option[unit]),
  }));
}

export function calculateConcrete(input) {
  const volume = input.length * input.width * baseDepth(input);
  const requiredVolume = volume * (1 + input.waste / 100);
  const bags = Math.ceil(requiredVolume / input.bagYield);
  const comparison = bagComparisons(requiredVolume, input.unit);
  const readyMixThreshold = input.unit === 'imperial' ? 1 : 0.75;
  const ordered = orderVolume(requiredVolume, input.unit);
  return {
    volume,
    requiredVolume,
    orderVolume: ordered,
    bags,
    bagComparisons: comparison,
    compareReadyMix: ordered >= readyMixThreshold,
    suppliedVolume: bags * input.bagYield,
    cost: bags * input.pricePerBag,
  };
}
