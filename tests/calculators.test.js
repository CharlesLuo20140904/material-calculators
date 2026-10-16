import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePaint, PAINT_DEFAULTS } from '../assets/js/calculators/paint.js';
import { calculateTile } from '../assets/js/calculators/tile.js';
import { calculateWallpaper } from '../assets/js/calculators/wallpaper.js';
import { convert } from '../assets/js/core/units.js';

test('paint estimate deducts openings and rounds to quarter gallons', () => {
  const result = calculatePaint({
    unit: 'imperial', length: 12, width: 10, height: 8,
    doors: 1, windows: 2, coats: 2, coverage: 350,
    waste: 5, price: 42, includeCeiling: false,
    doorArea: PAINT_DEFAULTS.doorArea.imperial,
    windowArea: PAINT_DEFAULTS.windowArea.imperial,
  });
  assert.equal(result.netArea, 307);
  assert.equal(result.purchase, 2);
  assert.equal(result.cost, 84);
});

test('paint estimate can include a ceiling', () => {
  const result = calculatePaint({
    unit: 'metric', length: 4, width: 3, height: 2.5,
    doors: 0, windows: 0, coats: 1, coverage: 10,
    waste: 0, price: 12, includeCeiling: true,
    doorArea: PAINT_DEFAULTS.doorArea.metric,
    windowArea: PAINT_DEFAULTS.windowArea.metric,
  });
  assert.equal(result.netArea, 47);
  assert.equal(result.purchase, 5);
});

test('tile estimate rounds tiles and boxes upward', () => {
  const result = calculateTile({
    unit: 'imperial', length: 12, width: 10,
    tileWidth: 12, tileHeight: 24, waste: 10,
    tilesPerBox: 8, pricePerBox: 64,
  });
  assert.equal(result.neededTiles, 66);
  assert.equal(result.boxes, 9);
  assert.equal(result.purchaseTiles, 72);
  assert.equal(result.cost, 576);
});

test('tile waste applies before whole-tile rounding', () => {
  const result = calculateTile({
    unit: 'imperial',
    length: 3.2,
    width: 3.2,
    tileWidth: 12,
    tileHeight: 12,
    waste: 10,
    tilesPerBox: 1,
    pricePerBox: 0,
  });
  assert.equal(result.baseTiles, 11);
  assert.equal(result.neededTiles, 12);
});

test('wallpaper estimate accounts for repeat, trim, and reserve roll', () => {
  const result = calculateWallpaper({
    unit: 'imperial', wallWidth: 44, height: 8,
    rollWidth: 20.5, rollLength: 33, repeat: 20.5,
    trim: 4, pricePerRoll: 68, reserveRoll: true,
  });
  assert.equal(result.dropsNeeded, 26);
  assert.equal(result.dropsPerRoll, 3);
  assert.equal(result.rolls, 10);
  assert.equal(result.cost, 680);
});

test('wallpaper rejects a roll shorter than one full drop', () => {
  const result = calculateWallpaper({
    unit: 'metric', wallWidth: 10, height: 3,
    rollWidth: 53, rollLength: 2, repeat: 64,
    trim: 10, pricePerRoll: 50, reserveRoll: false,
  });
  assert.equal(result, null);
});

test('unit conversion preserves common paint coverage', () => {
  const metric = convert(350, 'paintCoverage', 'imperial', 'metric');
  assert.ok(Math.abs(metric - 8.5897) < 0.001);
  assert.ok(Math.abs(convert(metric, 'paintCoverage', 'metric', 'imperial') - 350) < 0.001);
});
