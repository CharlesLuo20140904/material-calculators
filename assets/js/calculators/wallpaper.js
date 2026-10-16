function normalizedDimensions(input) {
  if (input.unit === 'metric') {
    return {
      rollWidth: input.rollWidth / 100,
      repeat: input.repeat / 100,
      trim: input.trim / 100,
    };
  }
  return {
    rollWidth: input.rollWidth / 12,
    repeat: input.repeat / 12,
    trim: input.trim / 12,
  };
}

function matchedDrop(height, trim, repeat) {
  const rawDrop = height + trim;
  if (repeat <= 0) return rawDrop;
  return Math.ceil(rawDrop / repeat) * repeat;
}

export function calculateWallpaper(input) {
  const dimensions = normalizedDimensions(input);
  const drop = matchedDrop(input.height, dimensions.trim, dimensions.repeat);
  const dropsNeeded = Math.ceil(input.wallWidth / dimensions.rollWidth);
  const dropsPerRoll = Math.floor(input.rollLength / drop);
  if (dropsPerRoll < 1) return null;
  const baseRolls = Math.ceil(dropsNeeded / dropsPerRoll);
  const rolls = baseRolls + (input.reserveRoll ? 1 : 0);
  const usedLength = dropsNeeded * drop;
  return {
    drop,
    dropsNeeded,
    dropsPerRoll,
    baseRolls,
    rolls,
    spareLength: rolls * input.rollLength - usedLength,
    cost: rolls * input.pricePerRoll,
  };
}
