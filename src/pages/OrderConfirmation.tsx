import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '../components/Button';
import { motion } from 'motion/react';

export const OrderConfirmation = () => {
  const { orderId } = useParams();

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-8"
      >
        <CheckCircle className="h-12 w-12 text-green-600" />
      </motion.div>
      
      <h1 className="text-4xl font-extrabold text-black mb-4">Order Confirmed!</h1>
      <p className="text-lg text-gray-500 mb-8">
        Thank you for your purchase. Your order <span className="font-bold text-black">#{orderId}</span> has been placed successfully.
      </p>
      
      <div className="rounded-3xl border bg-gray-50 p-8 mb-12 text-left">
        <h3 className="font-bold text-black mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" /> What happens next?
        </h3>
        <ul className="space-y-4 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">1</span>
            You'll receive an order confirmation email with details of your purchase.
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">2</span>
            We'll send you a tracking link as soon as your order ships.
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">3</span>
            Your premium items will arrive in 3-5 business days.
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/shop">
          <Button variant="outline" className="rounded-full px-8 h-12">
            Continue Shopping
          </Button>
        </Link>
        <Link to="/profile">
          <Button className="rounded-full px-8 h-12">
            View My Orders <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
