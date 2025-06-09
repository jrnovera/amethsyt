import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import toast from 'react-hot-toast';

const jewelryCategories = [
  { name: 'Rings', icon: '💍' },
  { name: 'Necklaces', icon: '📿' },
  { name: 'Earrings', icon: '🦻' },
  { name: 'Bracelets', icon: '🧿' },
  { name: 'Brooches', icon: '🎀' },
  { name: 'Pendants', icon: '🔗' },
  { name: 'Charms', icon: '🧸' },
  { name: 'Watches', icon: '⌚' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setAllProducts(productsData);
      
      // Filter featured products
      const featured = productsData.filter(product => product.isFeatured === true);
      setFeaturedProducts(featured.length > 0 ? featured : productsData.slice(0, 4));
      
      // Get best sellers (products on sale or sort by recent)
      const bestSellers = productsData.filter(product => product.isSale === true);
      setBestSellingProducts(bestSellers.length > 0 ? bestSellers : productsData.slice(0, 4));
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Bar */}
      

      {/* Hero Section */}
      <section className="relative h-[400px] bg-cover bg-center" style={{ backgroundImage: "url('https://plus.unsplash.com/premium_photo-1661558675975-58ff8435b9f8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative h-full container mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6 drop-shadow">Discover Exquisite Jewelry</h1>
            <p className="text-xl mb-8 drop-shadow">
              Explore our collection of handcrafted jewelry pieces that tell your unique story.
            </p>
            <Link
              to="/products"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Category Bar */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-6">
          {jewelryCategories.map((cat) => (
            <button
              key={cat.name}
              className="flex flex-col items-center focus:outline-none group"
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-purple-700">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Flash Sale / Featured Jewelry */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Featured Jewelry</h2>
          <Link to="/products" className="text-purple-600 hover:underline text-sm">See All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-4 flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : featuredProducts.length > 0 ? featuredProducts.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <img src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.jpg'} 
                  alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-gray-800">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-bold">₱{item.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs font-semibold hover:bg-purple-200 transition" onClick={() => navigate(`/products/${item.id}`)}>Buy</button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-4 text-center py-10 text-gray-500">No featured products found</div>
          )}
        </div>
      </section>

     

      {/* Today's For You */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Today's Picks For You</h2>
          <Link to="/products" className="text-purple-600 hover:underline text-sm">View More</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-4 flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : allProducts.length > 0 ? allProducts.slice(0, 8).map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <img src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.jpg'} 
                  alt={item.name} className="w-full h-44 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-gray-800">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-bold">₱{item.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs font-semibold hover:bg-purple-200 transition" onClick={() => navigate(`/products/${item.id}`)}>Add to Cart</button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-4 text-center py-10 text-gray-500">No products found</div>
          )}
        </div>
      </section>

      {/* Best Selling Store */}
      <section className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Best Sellers</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {loading ? (
            <div className="w-full flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : bestSellingProducts.length > 0 ? bestSellingProducts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden w-48 cursor-pointer"
              onClick={() => navigate(`/products/${item.id}`)}
              role="button"
              tabIndex={0}
              onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/products/${item.id}`); }}
            >
              <img src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.jpg'} 
                  alt={item.name} className="w-full h-32 object-cover" />
              <div className="p-3 text-center">
                <h3 className="font-semibold text-base mb-1 text-gray-800">{item.name}</h3>
                <span className="text-purple-600 font-bold">₱{item.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )) : (
            <div className="w-full text-center py-10 text-gray-500">No best selling products found</div>
          )}
        </div>
      </section>

      {/* Footer */}
      <section className="w-full flex justify-center bg-black">
        <video
          src="https://media.tiffany.com/is/content/tiffanydm/2025_HW_HP_Hero_Desktop"
          autoPlay
          loop
          muted
          playsInline
          className="w-full max-h-[300px] object-cover  shadow-lg"
        />
      </section>

    </div>
  );
};

export default Home;
