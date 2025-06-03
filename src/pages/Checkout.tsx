// Checkout page with full validation and error display for all fields. Payment is Cash on Delivery or GCash only.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useCartStore } from '../store/useCartStore';

interface FormData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  paymentMethod: 'cod' | 'gcash';
  gcashNumber?: string;
  isDelivered: boolean;
}

import { useAuthStore } from '../store/useAuthStore';

const Checkout: React.FC = () => {
  const { user } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    userId: user?.id || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cod',
    gcashNumber: '',
    isDelivered: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simple validators
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^09\d{9}$/.test(phone);
  const validateGCash = (number: string) => /^09\d{9}$/.test(number);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Invalid phone (must be 11 digits, start with 09)';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';

    if (!formData.zipCode) newErrors.zipCode = 'ZIP Code is required';
    if (formData.paymentMethod === 'gcash') {
      if (!formData.gcashNumber) newErrors.gcashNumber = 'GCash number is required';
      else if (!validateGCash(formData.gcashNumber)) newErrors.gcashNumber = 'Invalid GCash number (must be 11 digits, start with 09)';
    }
    return newErrors;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const foundErrors = validate();
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        ...formData,
        userId: user?.id || '',
        isDelivered: false,
        subtotal: cartSummary.subtotal,
        shipping: cartSummary.shipping,
        total: cartSummary.total,
        createdAt: Timestamp.now(),
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/');
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Dummy cart data - replace with actual cart state
  // Helper to format as Philippine Peso
  function formatPeso(amount: number) {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  }

  const cartSummary = {
    subtotal: 1999.97,
    shipping: 50.00,
    total: 1999.97 + 50.00,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  className={`w-full border rounded-lg px-4 py-2 ${errors.firstName ? 'border-red-500' : ''}`}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  className={`w-full border rounded-lg px-4 py-2 ${errors.lastName ? 'border-red-500' : ''}`}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full border rounded-lg px-4 py-2 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  className={`w-full border rounded-lg px-4 py-2 ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  aria-invalid={!!errors.address}
                  aria-describedby={errors.address ? 'address-error' : undefined}
                  className={`w-full border rounded-lg px-4 py-2 ${errors.address ? 'border-red-500' : ''}`}
                />
                {errors.address && (
                  <p id="address-error" className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                    className={`w-full border rounded-lg px-4 py-2 ${errors.city ? 'border-red-500' : ''}`}
                  />
                  {errors.city && (
                    <p id="city-error" className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    aria-invalid={!!errors.zipCode}
                    aria-describedby={errors.zipCode ? 'zipCode-error' : undefined}
                    className={`w-full border rounded-lg px-4 py-2 ${errors.zipCode ? 'border-red-500' : ''}`}
                  />
                  {errors.zipCode && (
                    <p id="zipCode-error" className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Payment Method</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="form-radio h-4 w-4 text-purple-600"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="gcash"
                      checked={formData.paymentMethod === 'gcash'}
                      onChange={handleInputChange}
                      className="form-radio h-4 w-4 text-purple-600"
                    />
                    <span>GCash</span>
                  </label>
                </div>
              </div>
              {formData.paymentMethod === 'gcash' && (
                <div>
                  <label className="block text-gray-700 mb-2">GCash Number</label>
                  <input
                    type="text"
                    name="gcashNumber"
                    value={formData.gcashNumber || ''}
                    onChange={handleInputChange}
                    required
                    aria-invalid={!!errors.gcashNumber}
                    aria-describedby={errors.gcashNumber ? 'gcashNumber-error' : undefined}
                    className={`w-full border rounded-lg px-4 py-2 ${errors.gcashNumber ? 'border-red-500' : ''}`}
                    placeholder="09XXXXXXXXX"
                  />
                  {errors.gcashNumber && (
                    <p id="gcashNumber-error" className="text-red-500 text-sm mt-1">{errors.gcashNumber}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPeso(cartSummary.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{formatPeso(cartSummary.shipping)}</span>
            </div>
            <div className="border-t pt-2 mt-2 font-semibold text-black flex justify-between">
              <span>Total</span>
              <span>{formatPeso(cartSummary.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;