import React from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

export const Shop = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('newest');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnapshot = await getDocs(collection(db, 'categories'));
        setCategories(catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));

        const prodSnapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
        setProducts(prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.categoryId === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-black">Shop All</h1>
          <p className="mt-2 text-gray-500">Explore our full range of premium products.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full rounded-full bg-gray-100 border-none pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="rounded-full bg-gray-100 border-none px-4 py-2 text-sm focus:ring-2 focus:ring-black"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select 
              className="rounded-full bg-gray-100 border-none px-4 py-2 text-sm focus:ring-2 focus:ring-black"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-500">No products found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
