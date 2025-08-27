'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  BookOpen, 
  Calendar,
  Eye,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface CourseApproval {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  category: string;
  level: string;
  imageUrl: string;
  modules: any[];
  createdAt: Date;
  status: string;
}

function CourseApprovalsContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<CourseApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingCourse, setApprovingCourse] = useState<string | null>(null);
  const [rejectingCourse, setRejectingCourse] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseApproval | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/course-approvals');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load pending courses',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId: string) => {
    try {
      setApprovingCourse(courseId);
      const response = await fetch('/api/admin/course-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, action: 'approve' }),
      });

      if (!response.ok) throw new Error('Failed to approve course');
      
      toast({
        title: 'Course Approved',
        description: 'The course has been approved and is now published.',
      });
      
      fetchPendingCourses(); // Refresh the list
    } catch (error) {
      console.error('Error approving course:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve course',
      });
    } finally {
      setApprovingCourse(null);
    }
  };

  const handleReject = async (courseId: string) => {
    try {
      setRejectingCourse(courseId);
      const response = await fetch('/api/admin/course-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId, 
          action: 'reject',
          reason: rejectReason 
        }),
      });

      if (!response.ok) throw new Error('Failed to reject course');
      
      toast({
        title: 'Course Rejected',
        description: 'The course has been rejected.',
      });
      
      setRejectReason('');
      fetchPendingCourses(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting course:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject course',
      });
    } finally {
      setRejectingCourse(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      programming: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
      music: 'bg-green-100 text-green-800',
      gaming: 'bg-orange-100 text-orange-800',
      business: 'bg-gray-100 text-gray-800',
      lifestyle: 'bg-pink-100 text-pink-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="w-full flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve pending course submissions
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {courses.length} Pending
        </Badge>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No pending approvals</h3>
            <p className="text-muted-foreground">
              All course submissions have been reviewed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {course.instructorName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {course.instructorName}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(course.category)}>
                    {course.category}
                  </Badge>
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{course.modules?.length || 0} modules</span>
                  <span>{formatDate(course.createdAt)}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowCourseDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApprove(course.id)}
                    disabled={approvingCourse === course.id}
                  >
                    {approvingCourse === course.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Course</DialogTitle>
                        <DialogDescription>
                          Provide a reason for rejecting "{selectedCourse?.title}"
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Enter rejection reason..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRejectReason('');
                            setSelectedCourse(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => selectedCourse && handleReject(selectedCourse.id)}
                          disabled={!rejectReason.trim() || rejectingCourse === selectedCourse?.id}
                        >
                          {rejectingCourse === selectedCourse?.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Reject Course
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Course Details Dialog */}
      <Dialog open={showCourseDetails} onOpenChange={setShowCourseDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              Course details and modules
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Course Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Instructor:</strong> {selectedCourse.instructorName}</p>
                    <p><strong>Email:</strong> {selectedCourse.instructorEmail}</p>
                    <p><strong>Category:</strong> {selectedCourse.category}</p>
                    <p><strong>Level:</strong> {selectedCourse.level}</p>
                    <p><strong>Created:</strong> {formatDate(selectedCourse.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCourse.description}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Modules ({selectedCourse.modules?.length || 0})</h4>
                <div className="space-y-2">
                  {selectedCourse.modules?.map((module: any, index: number) => (
                    <div key={module.id || index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{module.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CourseApprovalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col md:ml-64">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <CourseApprovalsContent />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
