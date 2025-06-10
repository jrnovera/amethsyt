import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import toast from 'react-hot-toast';
// Import icons if needed
import { Sparkles } from 'lucide-react';

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
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Hero Section with Premium Styling */}
      <section 
        className="relative h-[500px] bg-cover bg-center bg-fixed" 
        style={{ backgroundImage: "url('https://plus.unsplash.com/premium_photo-1661558675975-58ff8435b9f8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
        <div className="relative h-full container mx-auto px-6 flex items-center">
          <div className="max-w-2xl text-white">
            <div className="flex items-center mb-4">
              <span className="h-[1px] w-12 bg-gold mr-4"></span>
              <span className="font-serif tracking-wider text-gold">AMETHYST LUXURY</span>
            </div>
            <h1 className="text-5xl font-serif font-bold mb-6 drop-shadow-md tracking-wide leading-tight">Discover Exquisite <span className="text-gold">Jewelry</span></h1>
            <p className="text-xl mb-8 drop-shadow-md font-light tracking-wide leading-relaxed">
              Explore our collection of handcrafted jewelry pieces that tell your unique story.
            </p>
            <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-10 py-3.5 rounded-md font-serif font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex items-center">
                <span>Shop Collection</span>
                <Sparkles className="w-4 h-4 ml-2 opacity-70" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Elegant Category Section */}
      {/* Custom styles are applied directly through Tailwind classes */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-medium mb-2">Explore <span className="text-purple-600">Collections</span></h2>
          <div className="w-24 h-[1px] bg-gradient-to-r from-purple-400 to-gold mx-auto"></div>
        </div>
        <div className="category-gradient rounded-xl p-8 shadow-sm">
          <div className="flex flex-wrap justify-center gap-8">
            {jewelryCategories.map((cat) => (
              <button
                key={cat.name}
                className="category-button flex flex-col items-center focus:outline-none group transition-all duration-300"
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 border border-gold/20 group-hover:border-gold/50">
                  <span className="icon text-3xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                </div>
                <span className="text-sm font-medium font-serif tracking-wide text-gray-700 group-hover:amethyst-text group-hover:font-semibold transition-all">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jewelry Section - Enhanced */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-medium text-gray-800">Featured <span className="text-purple-600">Collection</span></h2>
            <div className="w-20 h-[1px] bg-gradient-to-r from-purple-400 to-[#e0b973] mt-2"></div>
          </div>
          <Link to="/products" className="text-[#e0b973] hover:text-purple-600 font-serif text-sm tracking-wider flex items-center group transition-all duration-300">
            View Collection <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-4 flex justify-center py-20">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : featuredProducts.length > 0 ? featuredProducts.map((item) => (
            <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-[#e0b973]/30" 
                 style={{ boxShadow: '0 10px 30px -15px rgba(0,0,0,0.1)' }}>
              <div className="relative overflow-hidden">
                <div className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#a084ca" viewBox="0 0 16 16">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                  </svg>
                </div>
                <img src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.jpg'} 
                    alt={item.name} className="w-full h-60 object-cover transform group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[#e0b973] font-medium font-serif">₱{item.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  <button 
                    className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-1.5 rounded-sm text-sm font-medium transition-colors duration-300" 
                    onClick={() => navigate(`/products/${item.id}`)}
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-4 text-center py-16 text-gray-400 font-serif italic">No featured products found</div>
          )}
        </div>
      </section>

     

      {/* Today's Picks - Enhanced */}
      <section className="container mx-auto px-6 py-16 bg-gray-50/50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-medium text-gray-800">Today's <span className="text-purple-600">Selection</span></h2>
            <div className="w-20 h-[1px] bg-gradient-to-r from-[#e0b973] to-purple-400 mt-2"></div>
          </div>
          <Link to="/products" className="text-[#e0b973] hover:text-purple-600 font-serif text-sm tracking-wider flex items-center group transition-all duration-300">
            View All <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-4 flex justify-center py-20">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : allProducts.length > 0 ? allProducts.slice(0, 8).map((item) => (
            <div key={item.id} className="bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-[#e0b973]/30"
                 style={{ boxShadow: '0 10px 20px -10px rgba(0,0,0,0.08)' }}>
              <div className="relative overflow-hidden">
                <div className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#a084ca" viewBox="0 0 16 16">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                  </svg>
                </div>
                <img src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.jpg'} 
                    alt={item.name} className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[#e0b973] font-medium font-serif">₱{item.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  <button 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-5 py-1.5 rounded-sm text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
                    onClick={() => navigate(`/products/${item.id}`)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-4 text-center py-16 text-gray-400 font-serif italic">No products available at the moment</div>
          )}
        </div>
      </section>

      {/* Best Sellers - Enhanced with Luxury Styling */}
      <section className="container mx-auto px-6 py-20 relative">
        <div className="absolute left-0 right-0 h-40 top-0 bg-gradient-to-b from-white to-transparent z-0"></div>
        <div className="relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block mb-2 text-[#e0b973] font-serif tracking-wider">PREMIUM SELECTION</span>
            <h2 className="text-3xl font-serif font-medium text-gray-800 mb-2">Our <span className="text-purple-600">Best Sellers</span></h2>
            <div className="w-32 h-[1px] bg-gradient-to-r from-[#e0b973] to-purple-400 mx-auto"></div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {loading ? (
              <div className="w-full flex justify-center py-16">
                <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : bestSellingProducts.length > 0 ? bestSellingProducts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-[#e0b973]/30 w-56 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/products/${item.id}`)}
                role="button"
                tabIndex={0}
                onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/products/${item.id}`); }}
                style={{ boxShadow: '0 10px 25px -15px rgba(0,0,0,0.1)' }}
              >
                <div className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 bg-[#e0b973] text-xs text-white px-3 py-1 rounded-br font-medium z-10 shadow-sm">
                    Best Seller
                  </div>
                  <img 
                    src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.jpg'} 
                    alt={item.name} 
                    className="w-full h-44 object-cover transform group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-serif text-lg mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                  <div className="flex justify-center items-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#e0b973" viewBox="0 0 16 16">
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <span className="text-[#e0b973] font-medium font-serif block">₱{item.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )) : (
              <div className="w-full text-center py-16 text-gray-400 font-serif italic">No best selling products found</div>
            )}
          </div>
        </div>
      </section>

      {/* Luxurious Video Showcase */}
      <section className="w-full flex flex-col justify-center bg-black py-10 relative">
        <div className="container mx-auto px-6 text-center mb-10 relative z-10">
          <span className="text-[#e0b973] font-serif tracking-wider block mb-2">AMETHYST LUXURY</span>
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-4">Craftsmanship Beyond <span className="text-[#e0b973]">Ordinary</span></h2>
          <p className="text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Each piece in our collection is meticulously crafted to reflect elegance, sophistication, and timeless beauty.  
          </p>
        </div>
        
        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
          <video
            src="https://media.tiffany.com/is/content/tiffanydm/2025_HW_HP_Hero_Desktop"
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-h-[400px] object-cover shadow-lg"
          />
          <div className="absolute bottom-10 left-0 right-0 text-center z-20">
            <button 
              onClick={() => navigate('/products')}
              className="bg-transparent backdrop-blur-sm border-2 border-[#e0b973] text-[#e0b973] hover:bg-[#e0b973]/10 px-8 py-3 rounded-sm text-sm tracking-wider font-serif transition-all duration-300"
            >
              EXPLORE THE COLLECTION
            </button>
          </div>
        </div>
        
        {/* Footer Navigation */}
      
      </section>

    </div>
  );
};

export default Home;
