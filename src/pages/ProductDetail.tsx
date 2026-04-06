import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/Button';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, Heart, Share2, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);
  const [activeImage, setActiveImage] = React.useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setProduct({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-20 animate-pulse">Loading...</div>;
  if (!product) return <div className="mx-auto max-w-7xl px-4 py-20 text-center">Product not found.</div>;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      quantity,
      stock: product.stock,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100"
          >
            <img 
              src={product.images[activeImage] || 'https://picsum.photos/seed/product/800/1000'} 
              alt={product.name} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-lg border-2 transition-all",
                  activeImage === i ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Premium Collection</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full"><Heart className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="h-5 w-5" /></Button>
            </div>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-black">{product.name}</h1>
          <div className="mt-4 flex items-center gap-4">
            {product.discountPrice ? (
              <>
                <span className="text-3xl font-bold text-red-600">{formatPrice(product.discountPrice)}</span>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-black">{formatPrice(product.price)}</span>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-bold text-black">Description</h3>
            <p className="mt-2 text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-full px-4 py-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:text-gray-400"
                >-</button>
                <span className="mx-4 font-bold min-w-[20px] text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-1 hover:text-gray-400"
                >+</button>
              </div>
              <p className="text-sm text-gray-500">
                {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1 rounded-full h-14 text-lg"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 rounded-full h-14 text-lg border-black"
                disabled={product.stock === 0}
                onClick={() => { handleAddToCart(); navigate('/cart'); }}
              >
                Buy Now
              </Button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 border-t pt-8">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Free worldwide shipping on orders over $150</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">30-day easy return policy</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Secure payment with Stripe & SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';
