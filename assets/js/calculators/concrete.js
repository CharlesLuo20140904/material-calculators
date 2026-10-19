function baseDepth(input) {
  return input.unit === 'imperial' ? input.depth / 12 : input.depth / 100;
}

function orderVolume(volume, unit) {
  return unit === 'imperial' ? volume / 27 : volume;
}

export function calculateConcrete(input) {
  const volume = input.length * input.width * baseDepth(input);
  const requiredVolume = volume * (1 + input.waste / 100);
  const bags = Math.ceil(requiredVolume / input.bagYield);
  return {
    volume,
    requiredVolume,
    orderVolume: orderVolume(requiredVolume, input.unit),
    bags,
    suppliedVolume: bags * input.bagYield,
    cost: bags * input.pricePerBag,
  };
}
