import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, ListOrdered } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useRef, useState } from 'react';

function UserMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-2 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <User className="h-6 w-6 text-gray-600" />
        <span className="text-gray-600 text-sm">{user.email}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50 border">
          <button
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {(!user || user.role !== 'admin') && (
            <Link to="/" className="flex items-center space-x-2">
              <img src="/images/new2.png" alt="Logo" className="h-10 w-10 object-contain" />
              <span className="text-2xl font-bold text-gray-800">Amethyst Shop</span>
            </Link>
          )}

          {/* Show Admin link if admin, otherwise regular links */}
          {user && user.role === 'admin' ? (
            <Link to="/admin/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors">
              Admin
            </Link>
          ) : (
            <div className="hidden md:flex items-center space-x-8"></div>
          )}

          <div className="flex items-center space-x-6">
            {(!user || user.role !== 'admin') && (
              <>
                <Link to="/orders" className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors">
                  <ListOrdered className="h-6 w-6" />
                  <span className="hidden md:inline text-sm font-medium">Orders</span>
                </Link>
                <Link to="/cart" className="relative">
                  <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-purple-600 transition-colors" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <div className="relative">
              {user ? (
                <UserMenu user={user} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}