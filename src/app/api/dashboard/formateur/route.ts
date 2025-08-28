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
    
    // Fetch formateur-specific data
    const [coursesSnapshot, enrollmentsSnapshot] = await Promise.allSettled([
      db.collection('courses').limit(20).get(),
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

    // Calculate formateur stats
    const stats = {
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      publishedCourses: courses.filter((c: any) => c.status === 'Published').length,
      draftCourses: courses.filter((c: any) => c.status === 'Draft').length,
      totalStudents: enrollments.length
    };

    return NextResponse.json({
      stats,
      courses,
      enrollments
    });

  } catch (error) {
    console.error('Error in formateur dashboard:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch formateur dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
