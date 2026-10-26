function normalizedDimensions(input) {
  const divisor = input.unit === 'metric' ? 100 : 12;
  return {
    rollWidth: input.rollWidth / divisor,
    repeat: input.repeat / divisor,
    trim: input.trim / divisor,
  };
}

function wallGroups(input) {
  if (Array.isArray(input.walls)) return input.walls;
  return [{ width: input.wallWidth, openingWidth: 0 }];
}

function dropsForWalls(input, rollWidth) {
  return wallGroups(input).reduce((total, wall) => {
    const usableWidth = Math.max(0, wall.width - (wall.openingWidth || 0));
    return total + Math.ceil(usableWidth / rollWidth);
  }, 0);
}

function matchedLengths(input, dimensions, count) {
  const rawDrop = input.height + dimensions.trim;
  if (input.matchType === 'random' || dimensions.repeat <= 0) {
    return { standardDrop: rawDrop, offsetDrop: rawDrop, cuts: Array(count).fill(rawDrop) };
  }
  const standardDrop = Math.ceil(rawDrop / dimensions.repeat) * dimensions.repeat;
  const offsetDrop = input.matchType === 'half-drop'
    ? Math.ceil((rawDrop + dimensions.repeat / 2) / dimensions.repeat) * dimensions.repeat
    : standardDrop;
  const cuts = Array.from({ length: count }, (_, index) => (
    input.matchType === 'half-drop' && index % 2 ? offsetDrop : standardDrop
  ));
  return { standardDrop, offsetDrop, cuts };
}

function packCuts(cuts, rollLength) {
  let rolls = 1;
  let remaining = rollLength;
  for (const cut of cuts) {
    if (cut > rollLength) return null;
    if (cut > remaining) {
      rolls += 1;
      remaining = rollLength;
    }
    remaining -= cut;
  }
  return cuts.length ? rolls : 0;
}

export function calculateWallpaper(input) {
  const dimensions = normalizedDimensions(input);
  const dropsNeeded = dropsForWalls(input, dimensions.rollWidth);
  const lengths = matchedLengths(input, dimensions, dropsNeeded);
  const baseRolls = packCuts(lengths.cuts, input.rollLength);
  if (baseRolls === null) return null;
  const rolls = baseRolls + (input.reserveRoll ? 1 : 0);
  const usedLength = lengths.cuts.reduce((sum, length) => sum + length, 0);
  const rawLength = dropsNeeded * (input.height + dimensions.trim);
  return {
    ...lengths,
    drop: lengths.standardDrop,
    dropsNeeded,
    dropsPerRoll: Math.floor(input.rollLength / lengths.standardDrop),
    baseRolls,
    rolls,
    repeatWaste: Math.max(0, usedLength - rawLength),
    spareLength: rolls * input.rollLength - usedLength,
    cost: rolls * input.pricePerRoll,
  };
}
