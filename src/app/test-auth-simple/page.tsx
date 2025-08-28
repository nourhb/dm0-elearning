'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestAuthSimple() {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [userData, setUserData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Test basic API endpoint
      const res = await fetch('/api/test-simple', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setAuthStatus('API is working');
        setUserData(data);
      } else {
        setAuthStatus('API error: ' + res.status);
      }
    } catch (error) {
      setAuthStatus('Connection error: ' + error);
    }
  };

  const testDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard/admin', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      } else {
        console.error('Dashboard error:', res.status);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
            <CardDescription>Testing simplified authentication system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={authStatus.includes('working') ? 'default' : 'destructive'}>
                {authStatus}
              </Badge>
            </div>
            
            <Button onClick={checkAuth}>Test API</Button>
            <Button onClick={testDashboard}>Test Dashboard</Button>
            
            {userData && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold">API Response:</h3>
                <pre className="text-sm">{JSON.stringify(userData, null, 2)}</pre>
              </div>
            )}
            
            {dashboardData && (
              <div className="mt-4 p-4 bg-blue-100 rounded">
                <h3 className="font-semibold">Dashboard Data:</h3>
                <pre className="text-sm">{JSON.stringify(dashboardData, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
