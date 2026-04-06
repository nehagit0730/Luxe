import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User } from '../types';

export const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let userData: User;

      if (!userDoc.exists()) {
        userData = {
          uid: user.uid,
          email: user.email!,
          role: 'customer',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', user.uid), userData);
      } else {
        userData = userDoc.data() as User;
      }

      setUser(userData);
      navigate(userData.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
        navigate(userDoc.data().role === 'admin' ? '/admin' : '/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border bg-white p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-black">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-500">Please enter your details to sign in.</p>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
              <label className="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>
            <Link to="/forgot-password" title="Forgot Password" className="text-sm font-medium text-black hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button className="w-full h-12 rounded-full" isLoading={loading}>Sign In</Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or continue with</span></div>
        </div>

        <Button variant="outline" className="w-full h-12 rounded-full" onClick={handleGoogleLogin} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="mr-2 h-5 w-5" />
          Google
        </Button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="font-bold text-black hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
