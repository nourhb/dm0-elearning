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
      <div className="w-full flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6">
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-3 sm:h-4 w-72 sm:w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 sm:h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Skeleton className="h-64 sm:h-80" />
          <Skeleton className="h-64 sm:h-80" />
        </div>
      </div>
    );
  }

    return (
    <>
      <div className="w-full flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6">
        {/* Modern Header with Welcome Message */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Command Center
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">
              Welcome back, {user?.displayName}. Here's your platform overview.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                         <Button 
               variant="outline" 
               size="sm"
               className="w-full sm:w-auto"
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
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button 
              onClick={() => setIsCreateUserDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create User</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards with Real Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Courses</span>
              <span className="sm:hidden">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Achievements</span>
              <span className="sm:hidden">Achievements</span>
            </TabsTrigger>
          </TabsList>

                     {/* Overview Tab */}
           <TabsContent value="overview" className="space-y-4 sm:space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
               {/* User Activity Chart */}
               <Card className="border-0 shadow-lg">
                 <CardHeader className="p-4 sm:p-6">
                   <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                     <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                     User Activity
                   </CardTitle>
                   <CardDescription className="text-sm">
                     Platform activity over the last 30 days
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="p-4 sm:p-6">
                   <div className="h-64 sm:h-80">
                     <UserSignupChart />
                   </div>
                 </CardContent>
               </Card>

               {/* Course Performance */}
               <Card className="border-0 shadow-lg">
                 <CardHeader className="p-4 sm:p-6">
                   <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                     <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                     Course Performance
                   </CardTitle>
                   <CardDescription className="text-sm">
                     Top performing courses by enrollment
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="p-4 sm:p-6">
                   <div className="h-64 sm:h-80">
                     <EnrollmentChart />
                   </div>
                 </CardContent>
               </Card>
             </div>

             {/* Quick Actions */}
             <Card className="border-0 shadow-lg">
               <CardHeader className="p-4 sm:p-6">
                 <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                   <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                   Quick Actions
                 </CardTitle>
                 <CardDescription className="text-sm">
                   Common administrative tasks
                 </CardDescription>
               </CardHeader>
               <CardContent className="p-4 sm:p-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                   <Button variant="outline" className="h-16 sm:h-20 flex flex-col gap-2 p-3">
                     <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
                     <span className="text-xs sm:text-sm">Create User</span>
                   </Button>
                   <Button variant="outline" className="h-16 sm:h-20 flex flex-col gap-2 p-3">
                     <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                     <span className="text-xs sm:text-sm">Review Courses</span>
                   </Button>
                   <Button variant="outline" className="h-16 sm:h-20 flex flex-col gap-2 p-3">
                     <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
                     <span className="text-xs sm:text-sm">System Settings</span>
                   </Button>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

                     {/* Users Tab */}
           <TabsContent value="users" className="space-y-4 sm:space-y-6">
             <Card className="border-0 shadow-lg">
               <CardHeader className="p-4 sm:p-6">
                 <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                   <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                   User Management
                 </CardTitle>
                 <CardDescription className="text-sm">
                   Manage platform users and their roles
                 </CardDescription>
               </CardHeader>
               <CardContent className="p-4 sm:p-6">
                 <div className="space-y-3 sm:space-y-4">
                   {users.slice(0, 10).map((user) => (
                     <div key={user.uid} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4">
                                              <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarFallback className="text-xs sm:text-sm">{user.displayName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                         <div className="min-w-0 flex-1">
                           <p className="font-medium text-sm sm:text-base truncate">{user.displayName}</p>
                           <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-2 w-full sm:w-auto">
                         <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                           {user.role}
                         </Badge>
                         <Button
                           variant="outline"
                           size="sm"
                           className="text-xs px-2 sm:px-3"
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
           <TabsContent value="courses" className="space-y-4 sm:space-y-6">
             <Card className="border-0 shadow-lg">
               <CardHeader className="p-4 sm:p-6">
                 <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                   <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                   Course Management
                 </CardTitle>
                 <CardDescription className="text-sm">
                   Review and manage platform courses
                 </CardDescription>
               </CardHeader>
               <CardContent className="p-4 sm:p-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                   {courses.slice(0, 6).map((course) => (
                     <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                       <CardContent className="p-3 sm:p-4">
                         <div className="space-y-2 sm:space-y-3">
                                                      <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{course.title}</h3>
                              <Badge variant={course.status === 'Published' ? 'default' : 'secondary'} className="text-xs">
                                {course.status}
                              </Badge>
                            </div>
                           <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                             {course.description}
                           </p>
                                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-1 sm:gap-0">
                              <span className="text-muted-foreground truncate">
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
           <TabsContent value="achievements" className="space-y-4 sm:space-y-6">
             <Card className="border-0 shadow-lg">
               <CardHeader className="p-4 sm:p-6">
                 <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                   <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                   Admin Achievements
                 </CardTitle>
                 <CardDescription className="text-sm">
                   Track your administrative milestones
                 </CardDescription>
               </CardHeader>
               <CardContent className="p-4 sm:p-6">
                 <div className="space-y-4 sm:space-y-6">
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
