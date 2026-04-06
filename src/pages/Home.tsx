import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { motion } from 'motion/react';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), where('isFeatured', '==', true), limit(4));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920" 
          alt="Hero" 
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
              Elevate Your <br /> Everyday Style.
            </h1>
            <p className="mt-6 text-xl text-gray-200">
              Discover our curated collection of premium essentials designed for comfort, durability, and timeless elegance.
            </p>
            <div className="mt-10 flex gap-4">
              <Link to="/shop">
                <Button size="lg" className="rounded-full px-8">
                  Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline" size="lg" className="rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 px-8">
                  Explore Categories
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders over $150' },
            { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
            { icon: Star, title: 'Premium Quality', desc: 'Crafted with the finest materials' },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4 p-6 rounded-xl bg-gray-50">
              <div className="rounded-full bg-white p-3 shadow-sm">
                <feature.icon className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-black">Featured Products</h2>
            <p className="mt-2 text-gray-500">Our handpicked selection for you.</p>
          </div>
          <Link to="/shop" className="text-sm font-bold text-black hover:underline flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-gray-500">
                No featured products found.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-black px-6 py-16 sm:px-12 sm:py-20 text-center">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Join the LUXE. Club
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="mt-10 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 rounded-full bg-white/10 border-white/20 px-6 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button className="rounded-full px-8">Subscribe</Button>
            </form>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        </div>
      </section>
    </div>
  );
};
