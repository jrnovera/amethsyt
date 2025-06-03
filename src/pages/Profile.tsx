import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

// Dummy data - replace with actual API calls
const DUMMY_PROFILE: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
  },
};

const DUMMY_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    date: '2024-03-15',
    status: 'delivered',
    total: 999.99,
    items: [
      {
        name: 'Diamond Ring',
        quantity: 1,
        price: 999.99,
      },
    ],
  },
  {
    id: 'ORD-002',
    date: '2024-03-10',
    status: 'shipped',
    total: 1499.98,
    items: [
      {
        name: 'Pearl Necklace',
        quantity: 2,
        price: 749.99,
      },
    ],
  },
];

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(DUMMY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [orders] = useState<Order[]>(DUMMY_ORDERS);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the profile
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-50"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={profile.address.street}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={profile.address.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={profile.address.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={profile.address.zipCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/cart')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                View Cart
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full bg-white text-purple-600 border border-purple-600 py-2 px-4 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Order History</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:border-purple-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-gray-600">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
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

export default Profile;