import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/Button';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export const Cart = () => {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-6">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-black">Your cart is empty</h2>
        <p className="mt-4 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop">
          <Button className="mt-8 rounded-full px-8">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-black mb-12">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          {items.map((item) => (
            <motion.div 
              layout
              key={item.productId} 
              className="flex items-center gap-6 p-4 rounded-2xl border bg-white"
            >
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                  <h3 className="font-bold text-black">{item.name}</h3>
                  <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">{formatPrice(item.price)} each</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center border rounded-full px-3 py-1">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:text-gray-400"
                    ><Minus className="h-3 w-3" /></button>
                    <span className="mx-4 font-bold text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:text-gray-400"
                    ><Plus className="h-3 w-3" /></button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          <Link to="/shop" className="inline-flex items-center text-sm font-bold text-black hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </Link>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-3xl bg-gray-50 p-8 sticky top-24">
            <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-bold">{formatPrice(total * 0.08)}</span>
              </div>
              <div className="pt-4 border-t flex justify-between items-end">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-extrabold">{formatPrice(total * 1.08)}</span>
              </div>
            </div>
            <Button 
              className="w-full mt-8 h-14 rounded-full text-lg"
              onClick={() => navigate('/checkout')}
            >
              Checkout
            </Button>
            <p className="mt-4 text-center text-xs text-gray-400">
              Shipping and taxes calculated at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
