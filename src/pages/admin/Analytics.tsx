import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, Product } from '../../types';
import { getAuth } from 'firebase/auth';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [] as Order[],
    topProducts: [] as (Product & { totalSold: number })[],
  });
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Update stats when filter changes
  useEffect(() => {
    if (allOrders.length === 0) return;
    let filtered = allOrders;
    if (filterMonth !== 'all' || filterYear !== 'all') {
      filtered = allOrders.filter(order => {
        const date = order.createdAt && typeof order.createdAt === 'object' && 'seconds' in order.createdAt && typeof (order.createdAt as { seconds?: unknown }).seconds === 'number'
          ? new Date((order.createdAt as { seconds: number }).seconds * 1000)
          : order.createdAt ? new Date(order.createdAt) : null;
        if (!date) return false;
        const m = date.getMonth();
        const y = date.getFullYear();
        return (filterMonth === 'all' || m === Number(filterMonth)) &&
               (filterYear === 'all' || y === Number(filterYear));
      });
    }
    setStats(s => ({
      ...s,
      totalRevenue: filtered.reduce((sum, o) => sum + (typeof o.total === 'number' ? o.total : 0), 0),
      totalOrders: filtered.length
    }));
  }, [filterMonth, filterYear, allOrders]);

  const fetchAnalytics = async () => {
    try {
      // Fetch orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setAllOrders(orders);

      // Fetch customers (exclude current user)
      const customersSnapshot = await getDocs(collection(db, 'users'));
      const customers = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Only count users with role === 'user' and not the current user
      const totalCustomers = customers.filter(u => {
        const user = u as { id: string; role?: string };
        return (!currentUserId || user.id !== currentUserId) && user.role === 'user';
      }).length;

      // Fetch products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      const totalProducts = products.length;

      // Calculate statistics
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const recentOrders = orders
        .sort((a, b) => {
          const dateA = a.createdAt && typeof a.createdAt === 'object' && 'seconds' in a.createdAt && typeof (a.createdAt as { seconds?: unknown }).seconds === 'number'
            ? new Date((a.createdAt as { seconds: number }).seconds * 1000)
            : a.createdAt ? new Date(a.createdAt) : null;
          const dateB = b.createdAt && typeof b.createdAt === 'object' && 'seconds' in b.createdAt && typeof (b.createdAt as { seconds?: unknown }).seconds === 'number'
            ? new Date((b.createdAt as { seconds: number }).seconds * 1000)
            : b.createdAt ? new Date(b.createdAt) : null;
          return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        })
        .slice(0, 5);

      // Calculate top products
      const productSales = new Map<string, number>();
      orders.forEach(order => {
        if (Array.isArray(order.items)) {
          order.items.forEach(item => {
            const currentCount = productSales.get(item.productId) || 0;
            productSales.set(item.productId, currentCount + item.quantity);
          });
        }
      });

      const topProducts = products
        .map(product => ({
          ...product,
          totalSold: productSales.get(product.id) || 0,
        }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers,
        totalProducts,
        recentOrders,
        topProducts,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  // Get unique months/years for dropdowns
  const monthOptions = Array.from(new Set(
    allOrders
      .map(order => {
        const date = order.createdAt && typeof order.createdAt === 'object' && 'seconds' in order.createdAt && typeof (order.createdAt as { seconds?: unknown }).seconds === 'number'
          ? new Date((order.createdAt as { seconds: number }).seconds * 1000)
          : order.createdAt ? new Date(order.createdAt) : null;
        return date ? date.getMonth() : null;
      })
      .filter((m): m is number => m !== null)
  ));
  const yearOptions = Array.from(new Set(
    allOrders
      .map(order => {
        const date = order.createdAt && typeof order.createdAt === 'object' && 'seconds' in order.createdAt && typeof (order.createdAt as { seconds?: unknown }).seconds === 'number'
          ? new Date((order.createdAt as { seconds: number }).seconds * 1000)
          : order.createdAt ? new Date(order.createdAt) : null;
        return date ? date.getFullYear() : null;
      })
      .filter((y): y is number => y !== null)
  ));

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Analytics Dashboard</h1>
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Month</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            <option value="all">All</option>
            {monthOptions.sort((a, b) => a - b).map(m => (
              <option key={m} value={m}>{monthNames[m]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
            <option value="all">All</option>
            {yearOptions.sort((a, b) => b - a).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Total Revenue</div>
            <div className="text-xl font-bold text-gray-900">₱{stats.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Customers</p>
              <p className="text-2xl font-bold">{stats.totalCustomers}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.total.toFixed(2)}</p>
                    <p className={`text-sm ${
                      order.status === 'delivered' ? 'text-green-600' : 
                      order.status === 'cancelled' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {typeof order.status === 'string' && order.status.length > 0
  ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
  : 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Top Products</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {stats.topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="ml-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.totalSold} sold</p>
                    <p className="text-sm text-gray-500">
                      ${(product.price * product.totalSold).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}