function tileArea(input) {
  const divisor = input.unit === 'imperial' ? 144 : 10000;
  return (input.tileWidth * input.tileHeight) / divisor;
}

export function calculateTile(input) {
  const area = input.length * input.width;
  const eachArea = tileArea(input);
  const baseTiles = Math.ceil(area / eachArea);
  const neededTiles = Math.ceil((area / eachArea) * (1 + input.waste / 100));
  const boxes = Math.ceil(neededTiles / input.tilesPerBox);
  const purchaseTiles = boxes * input.tilesPerBox;
  return {
    area,
    eachArea,
    baseTiles,
    neededTiles,
    boxes,
    purchaseTiles,
    cost: boxes * input.pricePerBox,
  };
}
