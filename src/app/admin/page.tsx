
'use client';

import { Suspense, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { ModernAdminDashboard } from './modern-dashboard';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Award,
  Calendar,
  Clock,
  Star,
  Eye,
  Download,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Mail,
  Bell,
  Shield,
  Zap,
  Sparkles,
  Crown,
  Trophy,
  Medal,
  Lightbulb,
  Rocket,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Search,
  RefreshCw,
  Download as DownloadIcon,
  Upload,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  UserPlus,
  User,
  BookMarked,
  GraduationCap,
  MessageSquare,
  FileText,
  ImageIcon,
  Video,
  Music,
  Code,
  Palette,
  Gamepad2,
  Target as TargetIcon,
  Globe as GlobeIcon,
  DollarSign,
  CreditCard,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  BookOpen as BookOpenIcon,
  Activity as ActivityIcon,
  Target as TargetIcon2,
  Award as AwardIcon,
  Clock as ClockIcon,
  Star as StarIcon,
  Eye as EyeIcon,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon,
  Video as VideoIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  ArrowUpRight as ArrowUpRightIcon,
  ArrowDownRight as ArrowDownRightIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon2,
  RefreshCw as RefreshCwIcon,
  Trophy as TrophyIcon,
  Medal as MedalIcon,
  Lightbulb as LightbulbIcon,
  Rocket as RocketIcon,
  Brain,
  Code as CodeIcon,
  Palette as PaletteIcon,
  Music as MusicIcon,
  Gamepad2 as Gamepad2Icon,
  Globe as GlobeIcon2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EnrollmentChart } from '@/components/dashboard/enrollment-chart';
import { UserRolesChart } from '@/components/dashboard/user-roles-chart';
import { UserSignupChart } from '@/components/dashboard/user-signup-chart';
import { CourseCard } from '@/components/dashboard/course-card';
import { CreateUserDialog } from '@/components/dashboard/create-user-dialog';
import { ManageUserDialog } from '@/components/dashboard/manage-user-dialog';
import { AnimatedProgressCard } from '@/components/ui/modern/animated-progress-card';
import { AchievementBadge, AchievementGrid, AchievementProgress } from '@/components/ui/modern/achievement-badge';
import type { UserProfile, Course } from '@/lib/types';
import { 
  canCreateRole, 
  canManageRole, 
  canDeleteRole, 
  canSuspendRole,
  getCreatableRoles,
  getManageableRoles,
  ROLE_INFO,
  type UserRole 
} from '@/lib/permissions';

function AdminDashboardContent() {
  return <ModernAdminDashboard />;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>;
  }

  if (user.role !== 'admin') {
    return <div className="flex h-screen items-center justify-center"><p>Access denied</p></div>;
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col md:ml-64">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={<div>Loading...</div>}>
              <AdminDashboardContent />
            </Suspense>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
