export function getActiveDiscountPercentage(product) {
  const percentage = Number(
    product?.discount_percentage ?? product?.discountPercentage
  );
  const sellingPrice = Number(product?.sellingPrice ?? product?.price);
  const mrp = Number(product?.mrp);

  if (
    !Number.isFinite(percentage) ||
    percentage <= 0 ||
    percentage >= 100 ||
    !Number.isFinite(sellingPrice) ||
    sellingPrice <= 0 ||
    !Number.isFinite(mrp) ||
    mrp <= sellingPrice
  ) {
    return null;
  }

  return percentage;
}
