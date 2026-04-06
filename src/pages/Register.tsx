import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User } from '../types';

export const Register = () => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });

      const userData: User = {
        uid: result.user.uid,
        email: result.user.email!,
        role: 'customer',
        displayName: name,
        photoURL: '',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', result.user.uid), userData);
      setUser(userData);
      navigate('/');
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
          <h2 className="text-3xl font-extrabold text-black">Create Account</h2>
          <p className="mt-2 text-sm text-gray-500">Join LUXE. and start your shopping journey.</p>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <Input 
              label="Full Name" 
              placeholder="John Doe" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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

          <Button className="w-full h-12 rounded-full" isLoading={loading}>Sign Up</Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="font-bold text-black hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
