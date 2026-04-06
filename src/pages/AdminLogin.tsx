import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User } from '../types';
import { Lock } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        if (userData.role === 'admin') {
          setUser(userData);
          navigate('/admin');
        } else {
          setError('Access denied. You do not have administrator privileges.');
          await auth.signOut();
        }
      } else {
        setError('User record not found.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border bg-white p-10 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest font-bold">LuxeCommerce Management</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
          <div className="space-y-4">
            <Input 
              label="Admin Email" 
              type="email" 
              placeholder="admin@luxe.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <Button className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-black/10" isLoading={loading}>
            Sign In to Dashboard
          </Button>
        </form>

        <div className="text-center pt-4">
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-black transition-colors">
            &larr; Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
