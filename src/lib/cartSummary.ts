// Utility to calculate cart summary (subtotal, tax, shipping, total)
import { CartItem } from '../types';

export function getCartSummary(cartItems: CartItem[]) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const shipping = 99; // Flat shipping (customize as needed)
  const total = subtotal + tax + shipping;
  return { subtotal, tax, shipping, total };
}
