import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin dashboard API called');
    
    // Simple authentication check - just verify we have some form of auth
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    const isAuthenticated = authHeader || cookieHeader;
    
    if (!isAuthenticated) {
      console.log('Admin dashboard API: No authentication provided');
      return NextResponse.json({ 
        error: 'Unauthorized',
        needsAuth: true
      }, { status: 401 });
    }

    console.log('Admin dashboard API: Authentication check passed');
    console.log('Admin dashboard API: Initializing Firebase Admin');
    
    // Initialize Firebase services with error handling
    let db;
    try {
      const services = getAdminServices();
      db = services.db;
    } catch (firebaseError) {
      console.error('Firebase initialization failed:', firebaseError);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: firebaseError instanceof Error ? firebaseError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
    // Fetch admin-specific data (all system data) with better error handling
    let courses: any[] = [];
    let users: any[] = [];
    let enrollments: any[] = [];

    try {
      const [coursesSnapshot, usersSnapshot, enrollmentsSnapshot] = await Promise.allSettled([
        db.collection('courses').limit(20).get(),
        db.collection('users').limit(50).get(),
        db.collection('enrollments').limit(20).get()
      ]);

      // Process results safely
      courses = coursesSnapshot.status === 'fulfilled' 
        ? coursesSnapshot.value.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          }))
        : [];

      users = usersSnapshot.status === 'fulfilled'
        ? usersSnapshot.value.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          }))
        : [];

      enrollments = enrollmentsSnapshot.status === 'fulfilled'
        ? enrollmentsSnapshot.value.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          }))
        : [];

    } catch (dbError) {
      console.error('Database query failed:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch data from database',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

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
