'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Shield, Zap } from 'lucide-react';

export default function DemoLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const createDemoSession = async (role: 'admin' | 'formateur' | 'student') => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create demo session');
      }

      const data = await response.json();
      
      toast({
        title: 'Demo session created!',
        description: `Welcome, ${data.user.displayName}!`,
      });

      // Redirect to appropriate dashboard
      switch (role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'formateur':
          router.push('/formateur');
          break;
        case 'student':
          router.push('/student');
          break;
      }
    } catch (error) {
      console.error('Error creating demo session:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create demo session. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            DM0 E-Learning Demo
          </CardTitle>
          <CardDescription className="text-gray-600">
            Choose a role to explore the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button
              onClick={() => createDemoSession('admin')}
              disabled={isLoading}
              className="h-16 flex flex-col gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Admin Dashboard</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => createDemoSession('formateur')}
              disabled={isLoading}
              className="h-16 flex flex-col gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <User className="h-5 w-5" />
                  <span className="text-sm">Formateur Dashboard</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => createDemoSession('student')}
              disabled={isLoading}
              className="h-16 flex flex-col gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  <span className="text-sm">Student Dashboard</span>
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-6">
            <p>This creates a temporary demo session for testing.</p>
            <p>No real authentication required.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
