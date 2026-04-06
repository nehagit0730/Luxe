import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { Button } from './Button';
import { useCartStore } from '../store/useCartStore';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
    });
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-white transition-all hover:shadow-lg"
    >
      <Link to={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.images[0] || 'https://picsum.photos/seed/product/400/500'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {product.discountPrice && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
            SALE
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
          <Button variant="secondary" size="icon" className="rounded-full">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="primary" size="icon" className="rounded-full" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/product/${product.slug}`} className="text-sm font-medium text-gray-900 hover:underline">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-sm font-bold text-red-600">{formatPrice(product.discountPrice)}</span>
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500 line-clamp-1">{product.description}</p>
      </div>
    </motion.div>
  );
};
