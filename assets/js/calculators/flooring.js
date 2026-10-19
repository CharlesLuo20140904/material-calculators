function wholeBoxes(value) {
  return Math.ceil(value - 1e-10);
}

export function calculateFlooring(input) {
  const area = input.length * input.width;
  const requiredArea = area * (1 + input.waste / 100);
  const boxes = wholeBoxes(requiredArea / input.coveragePerBox);
  const purchaseArea = boxes * input.coveragePerBox;
  return {
    area,
    requiredArea,
    boxes,
    purchaseArea,
    overage: purchaseArea - area,
    cost: boxes * input.pricePerBox,
  };
}
