import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useAuthStore } from './store/useAuthStore';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Profile } from './pages/Profile';
import { AdminLayout } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { User } from './types';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isAdmin, isLoading } = useAuthStore();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (adminOnly) {
    if (!user || !isAdmin) return <Navigate to="/admin/login" />;
  } else {
    if (!user) return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          // Auto-upgrade user to admin if email matches
          if (userData.email === 'nehabhardwaz.gtl@gmail.com' && userData.role !== 'admin') {
            userData.role = 'admin';
            await updateDoc(userDocRef, { role: 'admin' });
          }
          setUser(userData);
        } else {
          // Fallback if doc doesn't exist yet
          const newUserData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            role: firebaseUser.email === 'nehabhardwaz.gtl@gmail.com' ? 'admin' : 'customer',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newUserData);
          setUser(newUserData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        } />

        {/* Storefront Routes */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/about" element={<div className="mx-auto max-w-3xl py-20 px-4">About LUXE.</div>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}
