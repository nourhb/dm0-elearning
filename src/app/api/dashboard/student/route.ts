import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Check for authentication
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    const isAuthenticated = authHeader || cookieHeader;
    
    if (!isAuthenticated) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        needsAuth: true
      }, { status: 401 });
    }

    const { db } = getAdminServices();
    
    // Fetch student-specific data
    const [coursesSnapshot, enrollmentsSnapshot] = await Promise.allSettled([
      db.collection('courses').where('status', '==', 'Published').limit(20).get(),
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

    const enrollments = enrollmentsSnapshot.status === 'fulfilled'
      ? enrollmentsSnapshot.value.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }))
      : [];

    // Calculate student stats
    const stats = {
      totalCourses: courses.length,
      enrolledCourses: enrollments.length,
      completedCourses: enrollments.filter((e: any) => e.status === 'completed').length,
      inProgressCourses: enrollments.filter((e: any) => e.status === 'in_progress').length
    };

    return NextResponse.json({
      stats,
      courses,
      enrollments
    });

  } catch (error) {
    console.error('Error in student dashboard:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch student dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
