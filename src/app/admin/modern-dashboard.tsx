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
  Calendar,
  Bell,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye as EyeIcon,
  PlusCircle,
  Search,
  Filter,
  Download,
  Upload,
  BarChart,
  PieChart,
  LineChart,
  TrendingDown,
  Users2,
  BookOpenCheck,
  GraduationCap,
  History,
  Timer,
  CheckSquare,
  AlertTriangle,
  Info,
  HelpCircle,
  Network,
  Key,
  UserCog,
  User,
  UserMinus,
  UserLock,
  UserSearch,
  Tag,
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
import { CourseCard } from '@/components/dashboard/course-card';
import Link from 'next/link';
import type { UserProfile, Course } from '@/lib/types';

// Activity tracking interface
interface ActivityLog {
  id: string;
  type: 'user_created' | 'course_published' | 'enrollment_approved' | 'system_update' | 'user_login' | 'course_edited' | 'user_deleted' | 'course_deleted';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  courseId?: string;
  courseName?: string;
  severity: 'low' | 'medium' | 'high';
  icon: any;
}

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
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const res = await fetch('/api/dashboard/admin', {
          credentials: 'include'
        });
        
        if (!res.ok) {
          throw new Error(`API request failed: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        
        console.log('Admin dashboard data received:', data);
        console.log('Users count:', data.users?.length || 0);
        console.log('Courses count:', data.courses?.length || 0);
        console.log('Enrollments count:', data.enrollmentRequests?.length || 0);
        
        setUsers(data.users || []);
        setCourses(data.courses || []);
        setEnrollmentRequests(data.enrollmentRequests || []);
        
        // Generate mock activity logs based on data
        generateActivityLogs(data);
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

  // Generate mock activity logs
  const generateActivityLogs = (data: any) => {
    const logs: ActivityLog[] = [];
    const now = new Date();
    
    // User activities
    data.users?.forEach((user: any, index: number) => {
      logs.push({
        id: `user-${user.id || index}`,
        type: 'user_created',
        title: 'New User Registered',
        description: `${user.displayName || user.email} joined the platform`,
        timestamp: new Date(now.getTime() - index * 3600000), // Each hour apart
        userId: user.uid,
        userName: user.displayName || user.email,
        severity: 'low',
        icon: UserPlus
      });
    });

    // Course activities
    data.courses?.forEach((course: any, index: number) => {
      logs.push({
        id: `course-${course.id || index}`,
        type: course.status === 'Published' ? 'course_published' : 'course_edited',
        title: course.status === 'Published' ? 'Course Published' : 'Course Updated',
        description: `${course.title} was ${course.status === 'Published' ? 'published' : 'updated'}`,
        timestamp: new Date(now.getTime() - (index + 10) * 3600000),
        courseId: course.id,
        courseName: course.title,
        severity: 'medium',
        icon: course.status === 'Published' ? BookOpen : Edit
      });
    });

    // Enrollment activities
    data.enrollmentRequests?.forEach((enrollment: any, index: number) => {
      logs.push({
        id: `enrollment-${enrollment.id || index}`,
        type: 'enrollment_approved',
        title: 'Enrollment Approved',
        description: `Enrollment request approved for course`,
        timestamp: new Date(now.getTime() - (index + 20) * 3600000),
        severity: 'low',
        icon: CheckCircle
      });
    });

    // System activities
    logs.push({
      id: 'system-1',
      type: 'system_update',
      title: 'System Update',
      description: 'Platform updated to latest version',
      timestamp: new Date(now.getTime() - 24 * 3600000),
      severity: 'medium',
      icon: Settings
    });

    logs.push({
      id: 'system-2',
      type: 'user_login',
      title: 'Admin Login',
      description: 'Administrator logged into the system',
      timestamp: new Date(now.getTime() - 2 * 3600000),
      severity: 'low',
      icon: Shield
    });

    setActivityLogs(logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

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

  // Quick Actions Handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create_user':
        setIsCreateUserDialogOpen(true);
        break;
      case 'review_courses':
        setActiveTab('courses');
        break;
      case 'system_settings':
        toast({
          title: 'System Settings',
          description: 'System settings page will be implemented soon',
        });
        break;
      case 'view_analytics':
        setActiveTab('overview');
        break;
      case 'manage_users':
        setActiveTab('users');
        break;
      case 'activity_logs':
        setActiveTab('activity');
        break;
      default:
        toast({
          title: 'Action',
          description: `${action} functionality will be implemented soon`,
        });
    }
  };

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
                  
                  if (!res.ok) {
                    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
                  }
                  
                  const data = await res.json();
                  setUsers(data.users || []);
                  setCourses(data.courses || []);
                  setEnrollmentRequests(data.enrollmentRequests || []);
                  generateActivityLogs(data);
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-2 p-3"
                onClick={() => handleQuickAction('create_user')}
              >
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Create User</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-2 p-3"
                onClick={() => handleQuickAction('review_courses')}
              >
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Review Courses</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-2 p-3"
                onClick={() => handleQuickAction('manage_users')}
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Manage Users</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-2 p-3"
                onClick={() => handleQuickAction('view_analytics')}
              >
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Analytics</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-2 p-3"
                onClick={() => handleQuickAction('activity_logs')}
              >
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Activity Logs</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex flex-col gap-2 p-3"
                onClick={() => handleQuickAction('system_settings')}
              >
                <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Management Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Pending Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                Pending Actions
              </CardTitle>
              <CardDescription className="text-sm">
                Items requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <BookOpen className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Course Approvals</p>
                      <p className="text-xs text-muted-foreground">
                        {courses.filter(c => c.status === 'Draft').length} courses pending
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {courses.filter(c => c.status === 'Draft').length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Enrollment Requests</p>
                      <p className="text-xs text-muted-foreground">
                        {enrollmentRequests.length} requests waiting
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {enrollmentRequests.length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">System Issues</p>
                      <p className="text-xs text-muted-foreground">
                        {users.filter(u => u.status !== 'active').length} inactive users
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {users.filter(u => u.status !== 'active').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Server className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                System Health
              </CardTitle>
              <CardDescription className="text-sm">
                Platform performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Healthy</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Response Time</span>
                  <span className="text-xs text-muted-foreground">~200ms</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage Usage</span>
                  <span className="text-xs text-muted-foreground">45%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Sessions</span>
                  <span className="text-xs text-muted-foreground">
                    {users.filter(u => u.status === 'active').length}
                  </span>
                </div>
                
                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Check Health
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm">
                Latest platform events
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {activityLogs.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className={`p-1 rounded-full ${
                      activity.severity === 'high' ? 'bg-red-100' :
                      activity.severity === 'medium' ? 'bg-yellow-100' :
                      'bg-green-100'
                    }`}>
                      <activity.icon className="h-3 w-3 ${
                        activity.severity === 'high' ? 'text-red-600' :
                        activity.severity === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => setActiveTab('activity')}
                  >
                    View All Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto sm:h-10">
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
            <TabsTrigger value="activity" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Activity</span>
              <span className="sm:hidden">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Analytics</span>
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
                    <UserSignupChart users={users} />
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
                    <EnrollmentChart courses={courses} />
                  </div>
                </CardContent>
              </Card>
            </div>
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
                          <AvatarFallback className="text-xs sm:text-sm">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">{user.displayName || user.email}</p>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                      Course Management
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Review and manage platform courses
                    </CardDescription>
                  </div>
                  <Link href="/formateur/courses/new">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Course
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {courses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {courses.map((course) => (
                      <CourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        description={course.description}
                        progress={0}
                        imageUrl={course.imageUrl}
                        aiHint={course.aiHint}
                        completed={false}
                        isEnrolled={false}
                        instructorId={course.instructorId}
                        showManagementButtons={true}
                        onEdit={(courseId) => {
                          window.location.href = `/formateur/courses/${courseId}/edit`;
                        }}
                        onDelete={(courseId) => {
                          toast({
                            title: "Delete Course",
                            description: `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
                          });
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-4">
                      No courses have been created yet
                    </p>
                    <Link href="/formateur/courses/new">
                      <Button>Create First Course</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4 sm:space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  Platform Activity Log
                </CardTitle>
                <CardDescription className="text-sm">
                  Track all platform activities and system events
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {activityLogs.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`p-2 rounded-full ${
                        activity.severity === 'high' ? 'bg-red-100 text-red-600' :
                        activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm sm:text-base">{activity.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        {activity.userName && (
                          <p className="text-xs text-blue-600 mt-1">User: {activity.userName}</p>
                        )}
                        {activity.courseName && (
                          <p className="text-xs text-green-600 mt-1">Course: {activity.courseName}</p>
                        )}
                      </div>
                      <Badge variant={
                        activity.severity === 'high' ? 'destructive' :
                        activity.severity === 'medium' ? 'secondary' :
                        'default'
                      } className="text-xs">
                        {activity.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <BarChart className="h-4 w-4 sm:h-5 sm:w-5" />
                    User Growth
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Monthly user registration trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="h-64 sm:h-80">
                    <UserSignupChart users={users} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
                    Role Distribution
                  </CardTitle>
                  <CardDescription className="text-sm">
                    User roles across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Admins</span>
                      <span className="font-medium">{users.filter(u => u.role === 'admin').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Instructors</span>
                      <span className="font-medium">{users.filter(u => u.role === 'formateur').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Students</span>
                      <span className="font-medium">{users.filter(u => u.role === 'student').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
