import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { CartItem } from '../types';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  details?: {
    material?: string;
    dimensions?: string;
    weight?: string;
  };
  images?: string[];
  rating?: number;
  reviews?: number;
}


interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  description: string;
  createdAt?: { seconds: number; nanoseconds: number } | string;
  userName?: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setNotFound(false);
      // Try cache first
      const cached = localStorage.getItem('products-cache');
      if (cached) {
        const products: Product[] = JSON.parse(cached);
        const found = products.find(p => String(p.id) === id);
        if (found) {
          setProduct(found);
          setLoading(false);
          return;
        }
      }
      // Fetch from Firestore
      try {
        const docRef = doc(db, 'products', id!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        setNotFound(true);
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  // Fetch reviews for this product
  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('productId', '==', id)
        );
        const snapshot = await getDocs(reviewsQuery);
        let fetchedReviews: Review[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
        // Fetch user names for each review
        for (let review of fetchedReviews) {
          if (review.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', review.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                review.userName = userData.name || userData.displayName || 'User';
              } else {
                review.userName = 'User';
              }
            } catch {
              review.userName = 'User';
            }
          }
        }
        // Sort reviews newest first
        fetchedReviews.sort((a, b) => {
          const aTime = typeof a.createdAt === 'object' && a.createdAt?.seconds ? a.createdAt.seconds : 0;
          const bTime = typeof b.createdAt === 'object' && b.createdAt?.seconds ? b.createdAt.seconds : 0;
          return bTime - aTime;
        });
        setReviews(fetchedReviews);
      } catch (err) {
        setReviewsError('Failed to load reviews.');
      } finally {
        setReviewsLoading(false);
      }
    };
    if (id) fetchReviews();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading product...</div>;
  }
  if (notFound || !product) {
    return <div className="text-center py-12 text-gray-500">Product not found.</div>;
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(e.target.value));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Product Images */}
        <div className="md:w-1/2">
          <img
            src={product?.images && product.images.length > 0 ? product.images[0] : product?.image || '/images/placeholder.jpg'}
            alt={product?.name}
            className="w-full h-[480px] object-cover rounded-xl shadow-lg mb-6"
          />
          {/* Thumbnails if multiple images */}
          {product?.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-purple-500"
                />
              ))}
            </div>
          )}
        </div>
        {/* Product Details */}
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl font-bold mb-2">{product?.name}</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xl text-purple-700 font-semibold">
              {typeof product?.price === 'number' ? `₱${product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'No price'}
            </span>
            <div className="flex items-center">
              <i className="fas fa-star text-yellow-400" />
              <span className="ml-1 text-lg text-gray-700">{product?.rating}</span>
              <span className="ml-1 text-base text-gray-400">({product?.reviews})</span>
            </div>
          </div>
          <p className="text-gray-600 mb-6">{product?.description}</p>
          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="quantity" className="text-gray-700">Quantity:</label>
            <input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 px-3 py-2 border rounded-lg text-center"
            />
          </div>
          <button
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            onClick={() => {
              addItem({
                productId: String(product.id),
                variantId: "",
                quantity,
                price: product.price,
              });
              toast.success('Added to cart!');
            }}
          >
            Add to Cart
          </button>
          <button
            className="w-full mt-2 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            onClick={() => navigate('/cart')}
          >
            Go to Cart
          </button>
          <button
            className="w-full mt-4 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            onClick={() => navigate(-1)}
          >
            Back to Products
          </button>
        </div>
      </div>
      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
        {reviewsLoading ? (
          <div className="text-gray-500">Loading reviews...</div>
        ) : reviewsError ? (
          <div className="text-red-500">{reviewsError}</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">No reviews for this product yet.</div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-800">{review.userName || 'User'}</span>
                  <span className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                  </span>
                </div>
                <div className="text-gray-700 mb-1">{review.description}</div>
                {review.createdAt && (
                  <div className="text-xs text-gray-400">
                    {typeof review.createdAt === 'object' && review.createdAt.seconds
                      ? new Date((review.createdAt.seconds as number) * 1000).toLocaleDateString()
                      : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products - You can implement this section later */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">You May Also Like</h2>
        <div className="text-gray-600">
          Related products section coming soon...
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;