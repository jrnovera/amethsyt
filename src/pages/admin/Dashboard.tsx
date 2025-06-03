import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Package, Users, ShoppingBag, BarChart } from 'lucide-react';
import Products from './Products';
import Orders from './Orders';
import Customers from './Customers';
import Analytics from './Analytics';

export default function Dashboard() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
        <nav className="space-y-2">
          <Link
            to="/admin/products"
            className={`flex items-center space-x-2 p-2 rounded-lg ${
              isActive('/products')
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Products</span>
          </Link>
          <Link
            to="/admin/orders"
            className={`flex items-center space-x-2 p-2 rounded-lg ${
              isActive('/orders')
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Orders</span>
          </Link>
          <Link
            to="/admin/customers"
            className={`flex items-center space-x-2 p-2 rounded-lg ${
              isActive('/customers')
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Customers</span>
          </Link>
          <Link
            to="/admin/analytics"
            className={`flex items-center space-x-2 p-2 rounded-lg ${
              isActive('/analytics')
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <BarChart className="h-5 w-5" />
            <span>Analytics</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products/*" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </div>
  );
}