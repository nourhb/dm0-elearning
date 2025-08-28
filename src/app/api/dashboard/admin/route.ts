import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin dashboard API called');
    
    // Check for authentication
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    const isAuthenticated = authHeader || cookieHeader;
    
    if (!isAuthenticated) {
      console.log('Admin dashboard API: Unauthorized access attempt');
      return NextResponse.json({ 
        error: 'Unauthorized',
        needsAuth: true
      }, { status: 401 });
    }

    console.log('Admin dashboard API: Initializing Firebase Admin');
    const { db } = getAdminServices();
    
    // Fetch admin-specific data (all system data)
    const [coursesSnapshot, usersSnapshot, enrollmentsSnapshot] = await Promise.allSettled([
      db.collection('courses').limit(20).get(),
      db.collection('users').limit(50).get(),
      db.collection('enrollments').limit(20).get()
    ]);

    // Process results safely
    const courses = coursesSnapshot.status === 'fulfilled' 
      ? coursesSnapshot.value.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }))
      : [];

    const users = usersSnapshot.status === 'fulfilled'
      ? usersSnapshot.value.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }))
      : [];

    const enrollments = enrollmentsSnapshot.status === 'fulfilled'
      ? enrollmentsSnapshot.value.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }))
      : [];

    // Calculate admin stats
    const stats = {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      activeUsers: users.filter((u: any) => u.status === 'active').length,
      publishedCourses: courses.filter((c: any) => c.status === 'Published').length,
      draftCourses: courses.filter((c: any) => c.status === 'Draft').length,
      roleDistribution: {
        admin: users.filter((u: any) => u.role === 'admin').length,
        formateur: users.filter((u: any) => u.role === 'formateur').length,
        student: users.filter((u: any) => u.role === 'student').length
      }
    };

    const responseData = {
      stats,
      courses,
      users,
      enrollmentRequests: enrollments,
      roleDistribution: stats.roleDistribution
    };
    
    console.log('Admin API returning data:', {
      usersCount: users.length,
      coursesCount: courses.length,
      enrollmentsCount: enrollments.length
    });
    
    console.log('Admin dashboard API: Successfully returning response');
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in admin dashboard:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch admin dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
