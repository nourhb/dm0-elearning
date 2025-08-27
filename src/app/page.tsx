'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            DM0 E-Learning Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to our modern learning platform. Choose your role to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-purple-600" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>Manage the platform, users, and courses</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Access Admin Panel
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-green-600" />
              <CardTitle>Formateur Dashboard</CardTitle>
              <CardDescription>Create and manage your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/formateur">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Access Formateur Panel
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-12 w-12 mx-auto text-orange-600" />
              <CardTitle>Student Dashboard</CardTitle>
              <CardDescription>Browse and enroll in courses</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/dashboard">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  Access Student Panel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <p className="text-gray-500">Need help? Try our demo system:</p>
          <Link href="/demo-login">
            <Button variant="outline" size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Demo Login
            </Button>
          </Link>
        </div>

        <div className="text-sm text-gray-400 space-y-2">
          <p>Status: Application is running with simplified authentication</p>
          <p>API: Static data mode (Firebase bypassed for deployment)</p>
        </div>
      </div>
    </div>
  );
}
