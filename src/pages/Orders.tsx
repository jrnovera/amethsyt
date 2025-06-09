// Orders.tsx - List all placed orders from Firestore
import React, { useEffect, useState } from 'react';
import ReviewModal from '../components/ReviewModal';
import { db } from '../lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData, addDoc, query, where } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';

interface Order {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  paymentMethod: string;
  gcashNumber?: string;
  subtotal: number;
  shipping: number;
  total: number;
  isDelivered: boolean;
  createdAt?: { seconds: number; nanoseconds: number };
}

const Orders: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.id));
        const querySnapshot = await getDocs(ordersQuery);
        const fetched: Order[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(fetched);
        setError(null);
      } catch (err) {
        setError('Failed to fetch orders.');
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  function formatPeso(amount: number) {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  }
  function formatDate(ts?: { seconds: number; nanoseconds: number }) {
    if (!ts) return '';
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleString('en-PH');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      {!user?.id ? (
        <div className="text-red-500">Please log in to view your orders.</div>
      ) : loading ? (
        <div>Loading orders...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md text-sm">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="py-1.5 px-2 font-semibold rounded-tl-lg">Order ID</th>
                <th className="py-1.5 px-2 font-semibold">Name</th>
                <th className="py-1.5 px-2 font-semibold">Email</th>
                <th className="py-1.5 px-2 font-semibold">Phone</th>
                <th className="py-1.5 px-2 font-semibold">Address</th>
                <th className="py-1.5 px-2 font-semibold">Payment</th>
                <th className="py-1.5 px-2 font-semibold">Subtotal</th>
                <th className="py-1.5 px-2 font-semibold">Shipping</th>
                <th className="py-1.5 px-2 font-semibold">Total</th>
                <th className="py-1.5 px-2 font-semibold">Status</th>
                <th className="py-1.5 px-2 font-semibold rounded-tr-lg">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-100">
                  <td className="py-1 px-2 border-b text-xs break-all">{order.id}</td>
                  <td className="py-1 px-2 border-b whitespace-nowrap">{order.firstName} {order.lastName}</td>
                  <td className="py-1 px-2 border-b whitespace-nowrap">{order.email}</td>
                  <td className="py-1 px-2 border-b whitespace-nowrap">{order.phone}</td>
                  <td className="py-1 px-2 border-b whitespace-nowrap">{order.address}, {order.city} {order.zipCode}</td>
                  <td className="py-1 px-2 border-b capitalize">
                    {order.paymentMethod}
                    {order.paymentMethod === 'gcash' && order.gcashNumber && (
                      <span className="text-xs text-gray-500 ml-1">({order.gcashNumber})</span>
                    )}
                  </td>
                  <td className="py-1 px-2 border-b">{formatPeso(order.subtotal)}</td>
                  <td className="py-1 px-2 border-b">{formatPeso(order.shipping)}</td>
                  <td className="py-1 px-2 border-b font-bold">{formatPeso(order.total)}</td>
                  <td className="py-1 px-2 border-b">
                    {order.isDelivered ? (
  <div className="flex flex-col items-start gap-1">
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Delivered</span>
    <button
      className="mt-1 px-3 py-0.5 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
      onClick={() => {
        setSelectedOrderId(order.id);
        setReviewModalOpen(true);
      }}
    >
      Review
    </button>
  </div>
) : (
  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Out for delivery</span>
)}
                  </td>
                  <td className="py-1 px-2 border-b text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {reviewModalOpen && selectedOrderId && (
        <ReviewModal
          open={reviewModalOpen}
          orderId={selectedOrderId}
          order={orders.find(o => o.id === selectedOrderId)}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={async ({ rating, description, order }) => {
            if (!order) return;
            try {
              const { id: orderId, ...orderFields } = order;
              // Debug: log order
              console.log('Submitting review for order:', order);
              // If order.items exists and is an array, create a review for each product
              if (order.items && Array.isArray(order.items) && order.items.length > 0) {
                for (const item of order.items) {
                  await addDoc(collection(db, 'reviews'), {
                    orderId,
                    productId: item.productId,
                    productName: item.productName,
                    userId: order.userId,
                    userName: order.firstName + ' ' + order.lastName,
                    rating,
                    description,
                    createdAt: new Date(),
                    ...orderFields,
                  });
                }
              } else {
                // Fallback: create a review for the whole order
                await addDoc(collection(db, 'reviews'), {
                  orderId,
                  userId: order.userId,
                  userName: order.firstName + ' ' + order.lastName,
                  rating,
                  description,
                  createdAt: new Date(),
                  ...orderFields,
                });
              }
              alert('Review submitted!');
            } catch (err) {
              console.error('Failed to submit review:', err);
              alert('Failed to submit review.');
            }
            setReviewModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Orders;
