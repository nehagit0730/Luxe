import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Menu as MenuType } from '../types';
import { cn } from '../lib/utils';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, isAdmin, setUser } = useAuthStore();
  const { items } = useCartStore();
  const { settings } = useSettingsStore();
  const [menu, setMenu] = React.useState<MenuType | null>(null);
  const navigate = useNavigate();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  React.useEffect(() => {
    const fetchMenu = async () => {
      if (settings?.header.menuId) {
        const q = query(collection(db, 'menus'), where('handle', '==', settings.header.menuId), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setMenu({ id: snap.docs[0].id, ...snap.docs[0].data() } as MenuType);
        }
      }
    };
    fetchMenu();
  }, [settings?.header.menuId]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  const navLinks = menu?.items || [
    { label: 'Shop', url: '/shop' },
    { label: 'Categories', url: '/categories' },
    { label: 'About', url: '/about' }
  ];

  return (
    <nav className={cn(
      "z-50 w-full border-b bg-white/80 backdrop-blur-md",
      settings?.header.sticky ? "sticky top-0" : "relative"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-black flex items-center gap-2">
              {settings?.general.logo ? (
                <img src={settings.general.logo} alt={settings.general.siteName} className="h-8 w-auto" />
              ) : (
                settings?.general.siteName || 'LUXE.'
              )}
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link, i) => (
                <Link key={i} to={link.url} className="text-sm font-medium text-gray-600 hover:text-black">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {settings?.header.showSearch && (
              <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1.5">
                <Search className="h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-32 md:w-48"
                />
              </div>
            )}

            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="icon" title="Admin Dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm">Login</Button>
              </Link>
            )}

            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white px-4 py-4 space-y-4"
          >
            <Link to="/shop" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Shop</Link>
            <Link to="/categories" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Categories</Link>
            <Link to="/about" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>About</Link>
            <div className="pt-4 border-t">
              {!user && (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Login</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
