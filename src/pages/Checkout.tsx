import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ShieldCheck, CreditCard, Truck, ArrowLeft } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const Checkout = () => {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }

    setLoading(true);
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const orderData = {
        userId: user.uid,
        items,
        total: total * 1.08,
        status: 'paid',
        address: formData,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      navigate(`/order-confirmation/${docRef.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-black mb-12">Checkout</h1>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
              <Truck className="h-5 w-5" /> Shipping Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
              <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required />
              <div className="sm:col-span-2">
                <Input label="Street Address" name="street" value={formData.street} onChange={handleInputChange} required />
              </div>
              <Input label="City" name="city" value={formData.city} onChange={handleInputChange} required />
              <Input label="State / Province" name="state" value={formData.state} onChange={handleInputChange} required />
              <Input label="Zip / Postal Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
              <Input label="Country" name="country" value={formData.country} onChange={handleInputChange} required />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Payment Method
            </h2>
            <div className="rounded-2xl border p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold">Credit / Debit Card</span>
                <div className="flex gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                </div>
              </div>
              <div className="space-y-4">
                <Input placeholder="Card Number" className="bg-white" disabled />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="MM / YY" className="bg-white" disabled />
                  <Input placeholder="CVC" className="bg-white" disabled />
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Secure payment processing by Stripe.
              </p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-3xl bg-gray-50 p-8 sticky top-24">
            <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.name} x {item.quantity}</span>
                  <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-4 border-t">
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
              type="submit"
              className="w-full mt-8 h-14 rounded-full text-lg"
              isLoading={loading}
            >
              Complete Purchase
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => navigate('/cart')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
