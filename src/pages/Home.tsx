import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-r from-purple-300 to-indigo-400">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative h-full container mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6">
              Discover Exquisite Jewelry
            </h1>
            <p className="text-xl mb-8">
              Explore our collection of handcrafted jewelry pieces that tell your unique story.
            </p>
            <Link
              to="/products"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: 'Necklaces', image: '../public/images/necklace.webp' },
            { name: 'Rings', image: '../public/images/rings.webp' },
            { name: 'Earrings', image: '../public/images/earings.jpg' },
            { name: 'Bracelets', image: '../public/images/bracelet.webp' },
          ].map((category) => (
            <div
              key={category.name}
              className="relative h-80 group overflow-hidden rounded-lg shadow-lg"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <Link
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold hover:text-white transition-colors"
              >
                {category.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Premium Quality',
                description: 'Each piece is crafted with the finest materials and attention to detail.'
              },
              {
                title: 'Expert Craftsmanship',
                description: 'Our artisans bring years of experience to create stunning pieces.'
              },
              {
                title: 'Customer Satisfaction',
                description: '100% satisfaction guaranteed with our products and service.'
              }
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 