'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedProgressCard } from '@/components/ui/modern/animated-progress-card';
import { AchievementBadge, AchievementGrid, AchievementProgress } from '@/components/ui/modern/achievement-badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Activity, 
  Star,
  Settings,
  BarChart3,
  Zap,
  Crown,
  Trophy,
  RefreshCw,
  UserPlus,
  UserCheck,
  Target,
  Award,
  Medal,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  MessageSquare,
  FileText,
  Video,
  Brain,
  Rocket,
  Lightbulb,
  Globe,
  Shield,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Lock,
  Unlock,
  UserX,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EnrollmentChart } from '@/components/dashboard/enrollment-chart';
import { UserSignupChart } from '@/components/dashboard/user-signup-chart';
import { CreateUserDialog } from '@/components/dashboard/create-user-dialog';
import { ManageUserDialog } from '@/components/dashboard/manage-user-dialog';
import type { UserProfile, Course } from '@/lib/types';

export function ModernAdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isManageUserDialogOpen, setIsManageUserDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // ✅ OPTIMIZED: Admin-specific API call
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard/admin', {
          credentials: 'include'
        });
        const data = await res.json();
        
        setUsers(data.users || []);
        setCourses(data.courses || []);
        setEnrollmentRequests(data.enrollmentRequests || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load dashboard data',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  // Calculate real-time statistics
  const realStats = {
    totalUsers: users.length,
    totalCourses: courses.length,
    totalEnrollments: enrollmentRequests.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    publishedCourses: courses.filter(c => c.status === 'Published').length,
    pendingApprovals: courses.filter(c => c.status === 'Draft').length,
    monthlyGrowth: calculateMonthlyGrowth(),
  };

  function calculateMonthlyGrowth() {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentMonthUsers = users.filter(u => new Date(u.createdAt).getMonth() === currentMonth).length;
    const lastMonthUsers = users.filter(u => new Date(u.createdAt).getMonth() === lastMonth).length;
    
    if (lastMonthUsers === 0) return 100;
    return ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;
  }

  // Achievement system for admin
  const adminAchievements = [
    {
      id: 'first-100-users',
      title: 'Century Club',
      description: 'Reach 100 registered users',
      category: 'milestone' as const,
      points: 100,
      isUnlocked: realStats.totalUsers >= 100,
      unlockedAt: realStats.totalUsers >= 100 ? new Date() : undefined,
      rarity: 'rare' as const,
    },
    {
      id: 'course-curator',
      title: 'Course Curator',
      description: 'Approve 50 courses',
      category: 'teaching' as const,
      points: 200,
      isUnlocked: realStats.publishedCourses >= 50,
      unlockedAt: realStats.publishedCourses >= 50 ? new Date() : undefined,
      rarity: 'epic' as const,
    },
    {
      id: 'platform-expert',
      title: 'Platform Expert',
      description: 'Manage 500 total enrollments',
      category: 'milestone' as const,
      points: 300,
      isUnlocked: realStats.totalEnrollments >= 500,
      unlockedAt: realStats.totalEnrollments >= 500 ? new Date() : undefined,
      rarity: 'legendary' as const,
    },
  ];

  if (loading) {
    return (
      <div className="w-full flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Modern Header with Welcome Message */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Command Center
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Welcome back, {user?.displayName}. Here's your platform overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
                         <Button 
               variant="outline" 
               size="sm"
                               onClick={async () => {
                  try {
                    setLoading(true);
                    const res = await fetch('/api/dashboard/admin', {
                      credentials: 'include'
                    });
                    const data = await res.json();
                    setUsers(data.users || []);
                    setCourses(data.courses || []);
                    setEnrollmentRequests(data.enrollmentRequests || []);
                    toast({
                      title: 'Success',
                      description: 'Dashboard data refreshed',
                    });
                  } catch (error) {
                    console.error('Failed to refresh:', error);
                    toast({
                      variant: 'destructive',
                      title: 'Error',
                      description: 'Failed to refresh dashboard data',
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                               disabled={loading}
             >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateUserDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedProgressCard
            title="Total Users"
            value={realStats.totalUsers}
            maxValue={1000}
            icon={Users}
            color="blue"
            trend={{ value: realStats.monthlyGrowth, isPositive: realStats.monthlyGrowth > 0 }}
            subtitle="Active platform users"
          />
          
          <AnimatedProgressCard
            title="Total Courses"
            value={realStats.totalCourses}
            maxValue={500}
            icon={BookOpen}
            color="green"
            trend={{ value: 15, isPositive: true }}
            subtitle="Published courses"
          />
          
          <AnimatedProgressCard
            title="Total Enrollments"
            value={realStats.totalEnrollments}
            maxValue={1000}
            icon={UserCheck}
            color="purple"
            trend={{ value: 12, isPositive: true }}
            subtitle="Active enrollments"
          />
          
          <AnimatedProgressCard
            title="Active Users"
            value={realStats.activeUsers}
            maxValue={realStats.totalUsers || 1}
            icon={Activity}
            color="orange"
            trend={{ value: 8, isPositive: true }}
            subtitle="Currently active"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Activity Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    User Activity
                  </CardTitle>
                  <CardDescription>
                    Platform activity over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserSignupChart />
                </CardContent>
              </Card>

              {/* Course Performance */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Course Performance
                  </CardTitle>
                  <CardDescription>
                    Top performing courses by enrollment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnrollmentChart />
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <UserPlus className="h-6 w-6" />
                    <span>Create User</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <BookOpen className="h-6 w-6" />
                    <span>Review Courses</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    <span>System Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage platform users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 10).map((user) => (
                    <div key={user.uid} className="flex items-center justify-between p-4 border rounded-lg">
                                             <div className="flex items-center space-x-4">
                         <Avatar>
                           <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                         </Avatar>
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsManageUserDialogOpen(true);
                          }}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Management
                </CardTitle>
                <CardDescription>
                  Review and manage platform courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.slice(0, 6).map((course) => (
                    <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                                                     <div className="flex items-center justify-between">
                             <h3 className="font-semibold text-lg">{course.title}</h3>
                             <Badge variant={course.status === 'Published' ? 'default' : 'secondary'}>
                               {course.status}
                             </Badge>
                           </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>
                                                     <div className="flex items-center justify-between text-sm">
                             <span className="text-muted-foreground">
                               Instructor ID: {course.instructorId}
                             </span>
                            <span className="font-medium">
                              {course.studentCount || 0} students
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Admin Achievements
                </CardTitle>
                <CardDescription>
                  Track your administrative milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <AchievementProgress 
                    unlocked={adminAchievements.filter(a => a.isUnlocked).length}
                    total={adminAchievements.length}
                  />
                  <AchievementGrid achievements={adminAchievements} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateUserDialog
        isOpen={isCreateUserDialogOpen}
        setIsOpen={setIsCreateUserDialogOpen}
        creatorId={user?.uid || ''}
        creatorRole={(user?.role as 'admin' | 'formateur' | 'student') || 'admin'}
        onUserCreated={() => {
          setIsCreateUserDialogOpen(false);
          window.location.reload();
        }}
      />

      {selectedUser && (
        <ManageUserDialog
          isOpen={isManageUserDialogOpen}
          setIsOpen={setIsManageUserDialogOpen}
          user={selectedUser}
          onUserUpdate={() => {
            setIsManageUserDialogOpen(false);
            setSelectedUser(null);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
