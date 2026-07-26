/**
 * Calculate the tax amount based on total and tax rate percentage.
 * @param totalAmount - The total amount before tax.
 * @param taxRate - The tax rate percentage.
 * @returns The tax amount.
 */
export const calculateTaxAmount = (
  totalAmount: number,
  taxRate: number,
): number => {
  return (totalAmount * taxRate) / 100;
};

export const formatPrice = (price: number): string => {
  const formatedPrice = new Intl.NumberFormat('en-US').format(+price);
  return formatedPrice;
};
