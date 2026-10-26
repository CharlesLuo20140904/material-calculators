import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePaint, PAINT_DEFAULTS } from '../assets/js/calculators/paint.js';
import { calculateTile } from '../assets/js/calculators/tile.js';
import { calculateWallpaper } from '../assets/js/calculators/wallpaper.js';
import { calculateFlooring } from '../assets/js/calculators/flooring.js';
import { calculateDrywall, DRYWALL_DEFAULTS } from '../assets/js/calculators/drywall.js';
import { calculateConcrete, CONCRETE_BAG_OPTIONS } from '../assets/js/calculators/concrete.js';
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

test('wallpaper rounds each wall independently and deducts full-height openings', () => {
  const result = calculateWallpaper({
    unit: 'imperial', height: 8, rollWidth: 24, rollLength: 33,
    repeat: 0, trim: 0, pricePerRoll: 50, reserveRoll: false,
    matchType: 'random', walls: [
      { width: 5, openingWidth: 0 },
      { width: 5, openingWidth: 3 },
    ],
  });
  assert.equal(result.dropsNeeded, 4);
  assert.equal(result.baseRolls, 1);
});

test('half-drop wallpaper alternates a longer offset cut', () => {
  const result = calculateWallpaper({
    unit: 'imperial', wallWidth: 10, height: 8,
    rollWidth: 24, rollLength: 40, repeat: 24,
    trim: 0, pricePerRoll: 50, reserveRoll: false, matchType: 'half-drop',
  });
  assert.equal(result.dropsNeeded, 5);
  assert.equal(result.standardDrop, 8);
  assert.equal(result.offsetDrop, 10);
  assert.equal(result.repeatWaste, 4);
});

test('flooring estimate rounds purchase quantity to full boxes', () => {
  const result = calculateFlooring({
    length: 12, width: 10, waste: 10, coveragePerBox: 22, pricePerBox: 55,
  });
  assert.equal(result.area, 120);
  assert.equal(result.boxes, 6);
  assert.equal(result.purchaseArea, 132);
  assert.equal(result.cost, 330);
});

test('drywall estimate deducts openings and includes an optional ceiling', () => {
  const result = calculateDrywall({
    length: 12, width: 10, height: 8, doors: 1, windows: 2,
    doorArea: DRYWALL_DEFAULTS.doorArea.imperial,
    windowArea: DRYWALL_DEFAULTS.windowArea.imperial,
    includeCeiling: true, waste: 10, sheetWidth: 4, sheetLength: 8, pricePerSheet: 18,
  });
  assert.equal(result.area, 427);
  assert.equal(result.sheets, 15);
  assert.equal(result.cost, 270);
});

test('concrete estimate converts slab depth and rounds to full bags', () => {
  const result = calculateConcrete({
    unit: 'imperial', length: 10, width: 10, depth: 4,
    waste: 5, bagYield: 0.6, pricePerBag: 6,
  });
  assert.equal(result.bags, 59);
  assert.ok(Math.abs(result.orderVolume - 1.2963) < 0.0001);
  assert.equal(result.cost, 354);
  assert.equal(result.bagComparisons.find((item) => item.size === 40).bags, 117);
  assert.equal(result.compareReadyMix, true);
});

test('concrete presets expose documented 40, 60, and 80 lb yields', () => {
  assert.deepEqual(CONCRETE_BAG_OPTIONS.map((option) => option.imperial), [0.3, 0.45, 0.6]);
});

test('unit conversion preserves common paint coverage', () => {
  const metric = convert(350, 'paintCoverage', 'imperial', 'metric');
  assert.ok(Math.abs(metric - 8.5897) < 0.001);
  assert.ok(Math.abs(convert(metric, 'paintCoverage', 'metric', 'imperial') - 350) < 0.001);
});

test('unit conversion preserves concrete bag yield', () => {
  const metric = convert(0.6, 'volume', 'imperial', 'metric');
  assert.ok(Math.abs(metric - 0.01699) < 0.0001);
  assert.ok(Math.abs(convert(metric, 'volume', 'metric', 'imperial') - 0.6) < 0.0001);
});

test('unit conversion keeps enough precision for boxed flooring', () => {
  const metricLength = convert(12, 'length', 'imperial', 'metric');
  const metricWidth = convert(10, 'length', 'imperial', 'metric');
  const metricCoverage = convert(22, 'area', 'imperial', 'metric');
  const result = calculateFlooring({
    length: metricLength, width: metricWidth, waste: 10,
    coveragePerBox: metricCoverage, pricePerBox: 55,
  });
  assert.equal(result.boxes, 6);
});
