
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setAuthCookie } from '../login/actions';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { services } = useAuth();

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!services) return;

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;
    const role = formData.get('role') as string;

    try {
      setLoading(true);
      setError(null);

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(services.auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: email,
        displayName: displayName,
        role: role,
        status: 'active',
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Get ID token and set cookie
      const idToken = await user.getIdToken();
      const res = await setAuthCookie(idToken);

      if (res?.success) {
        // Redirect based on role
        const redirectPath = role === 'admin' ? '/admin' : 
                           role === 'formateur' ? '/formateur' : '/student/dashboard';
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(res?.message || 'An unknown error occurred during signup.');
      }
    } catch (error: any) {
      console.error('Signup Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!services) {
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <Card className="mx-auto max-w-md border-0 shadow-lg sm:border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription>
          Sign up for your DM0 E-Learning Platform account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}
        <form onSubmit={handleSignup} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="displayName">Full Name</Label>
            <Input id="displayName" name="displayName" placeholder="John Doe" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="john@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Create a strong password" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Account Type</Label>
            <Select name="role" required>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student - Learn and enroll in courses</SelectItem>
                <SelectItem value="formateur">Formateur - Create and manage courses</SelectItem>
                <SelectItem value="admin">Admin - Platform management</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
