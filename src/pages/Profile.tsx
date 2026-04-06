import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Order } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { Button } from '../components/Button';
import { Package, ChevronRight, User as UserIcon, Settings, ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="rounded-3xl border bg-white p-8 text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="h-12 w-12 text-gray-300" />
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold text-black">{user.displayName || 'User'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">
              {user.role}
            </div>
            
            <div className="mt-8 grid grid-cols-1 gap-2">
              {user.role === 'admin' && (
                <Link to="/admin" className="w-full">
                  <Button variant="primary" className="w-full justify-start rounded-xl">
                    <LayoutDashboard className="mr-3 h-4 w-4" /> Admin Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="w-full justify-start rounded-xl border-gray-100 hover:bg-gray-50">
                <Settings className="mr-3 h-4 w-4" /> Account Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl text-red-600 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="mr-3 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-black p-8 text-white">
            <h3 className="font-bold">Need Help?</h3>
            <p className="mt-2 text-sm text-gray-400">Our support team is available 24/7 to assist you with your orders.</p>
            <Button variant="outline" className="mt-6 w-full rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20">
              Contact Support
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">My Orders</h1>
            <p className="mt-2 text-gray-500">Track and manage your recent purchases.</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order.id} 
                  className="rounded-2xl border bg-white overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Order Placed</p>
                        <p className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</p>
                        <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Order ID</p>
                        <p className="text-sm font-bold">#{order.id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                        order.status === 'paid' ? "bg-green-100 text-green-700" : 
                        order.status === 'shipped' ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {order.status}
                      </span>
                      <Button variant="ghost" size="sm" className="text-xs font-bold">View Details</Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-sm font-bold text-black">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed p-20 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-black">No orders yet</h3>
              <p className="mt-2 text-gray-500">You haven't placed any orders with us yet.</p>
              <Button className="mt-6 rounded-full px-8" onClick={() => navigate('/shop')}>
                Start Shopping <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
