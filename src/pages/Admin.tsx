import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Layers, 
  Settings, 
  Image as ImageIcon,
  Plus,
  Search,
  Bell,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/Button';

// Admin Sub-pages (Mocking for now, will implement logic later)
const AdminHome = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Total Revenue', value: '$12,450', change: '+12%', icon: LayoutDashboard },
        { label: 'Orders', value: '156', change: '+8%', icon: ShoppingCart },
        { label: 'Customers', value: '2,420', change: '+18%', icon: Users },
        { label: 'Products', value: '48', change: '0%', icon: Package },
      ].map((stat, i) => (
        <div key={i} className="p-6 rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-gray-50"><stat.icon className="h-5 w-5" /></div>
            <span className="text-xs font-bold text-green-600">{stat.change}</span>
          </div>
          <p className="text-sm text-gray-500">{stat.label}</p>
          <h3 className="text-2xl font-bold text-black">{stat.value}</h3>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="p-6 rounded-2xl border bg-white shadow-sm">
        <h3 className="font-bold mb-4">Recent Orders</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100" />
                <div>
                  <p className="text-sm font-bold">Order #123{i}</p>
                  <p className="text-xs text-gray-500">2 mins ago</p>
                </div>
              </div>
              <span className="text-sm font-bold">$120.00</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 rounded-2xl border bg-white shadow-sm">
        <h3 className="font-bold mb-4">Top Products</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-gray-100" />
                <div>
                  <p className="text-sm font-bold">Premium Watch {i}</p>
                  <p className="text-xs text-gray-500">42 sales</p>
                </div>
              </div>
              <span className="text-sm font-bold">$299.00</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const AdminLayout = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Layers, label: 'Categories', path: '/admin/categories' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: ImageIcon, label: 'Media', path: '/admin/media' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-black">LUXE.</Link>
          <span className="ml-2 text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded uppercase">Admin</span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700">
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search admin..." 
              className="w-full rounded-full bg-gray-100 border-none pl-10 pr-4 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600" />
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{user?.displayName || 'Admin'}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200" />
            </div>
          </div>
        </header>

        <div className="p-8">
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="products" element={<div>Products Management <Button className="ml-4"><Plus className="mr-2 h-4 w-4" /> Add Product</Button></div>} />
            <Route path="categories" element={<div>Categories Management</div>} />
            <Route path="orders" element={<div>Orders Management</div>} />
            {/* Add more admin routes as needed */}
          </Routes>
        </div>
      </main>
    </div>
  );
};

import { cn } from '../lib/utils';
