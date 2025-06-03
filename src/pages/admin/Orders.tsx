import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';


function DeliverNowButton({ orderId, disabled, onDelivered }: { orderId: string, disabled: boolean, onDelivered: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeliver = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { isDelivered: true });
      setSuccess(true);
      onDelivered();
    } catch (e) {
      setError('Failed to update order.');
    }
    setLoading(false);
  };

  return (
    <div className="mt-3 flex flex-col gap-1">
      <button
        className={`w-full py-2 px-4 rounded bg-purple-600 text-white font-semibold transition hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed`}
        onClick={handleDeliver}
        disabled={disabled || loading}
      >
        {loading ? 'Delivering...' : disabled ? 'Delivered' : 'Deliver Now'}
      </button>
      {success && <span className="text-green-600 text-xs">Marked as delivered!</span>}
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      } catch (err) {
        setError('Failed to fetch orders');
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Order[];
      setOrders(ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Collect all unique keys from orders (after loading)
  const allKeys: string[] = orders.length > 0
    ? Array.from(
        orders.reduce((set: Set<string>, order: Record<string, unknown>) => {
          Object.keys(order).forEach(key => set.add(key));
          return set;
        }, new Set<string>())
      )
    : [];

  // Helper for formatting
  const formatValue = (key: string, value: any) => {
    if (key === 'total' && typeof value === 'number') {
      return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    }
    if (key === 'createdAt' && value) {
      if (typeof value === 'object' && value.seconds) {
        const date = new Date(value.seconds * 1000);
        return date.toLocaleString('en-PH');
      }
      if (!isNaN(Date.parse(value))) {
        return new Date(value).toLocaleString('en-PH');
      }
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value ?? '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            const delivered = !!order.isDelivered;
            return (
              <div
                key={String(order.id)}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col gap-3 hover:shadow-xl transition-shadow min-w-0"
              >
                <div className="font-bold text-purple-700 text-lg mb-2">
                  Order #{String(order.id).slice(0, 8)}
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  {allKeys.map((key) => (
                    <div key={String(key)} className="flex justify-between items-baseline border-b last:border-b-0 pb-1">
                      <span className="font-semibold text-gray-600 capitalize mr-2 text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="text-gray-900 text-sm break-all ml-2" style={{ fontFamily: 'monospace' }}>
                        {formatValue(key, order[key])}
                      </span>
                    </div>
                  ))}
                </div>
                <DeliverNowButton
                  orderId={order.id}
                  disabled={delivered}
                  onDelivered={() => {
                    setOrders((prev) =>
                      prev.map((o) =>
                        o.id === order.id ? { ...o, isDelivered: true } : o
                      )
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}