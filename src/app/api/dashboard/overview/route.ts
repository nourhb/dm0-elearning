import { NextRequest, NextResponse } from 'next/server';
import { optimizedAPIs } from '@/lib/performance/optimized-api';
import { cookies } from 'next/headers';
import { getAdminServices } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { auth, db } = getAdminServices();
    
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('AuthToken')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token and get user claims
    const decodedToken = await auth.verifyIdToken(authToken);
    const userRole = decodedToken.role || 'student';
    const userId = decodedToken.uid;

    // Use optimized API for dashboard data
    return optimizedAPIs.dashboard.execute(request, async (firebaseApp) => {
      const { db } = firebaseApp;
      
      // Fetch all data in parallel for optimal performance
      const [
        statsPromise,
        coursesPromise,
        usersPromise,
        enrollmentRequestsPromise
      ] = await Promise.allSettled([
        // Dashboard statistics
        (async () => {
          const statsSnapshot = await db.collection('courses').get();
          const usersSnapshot = await db.collection('users').get();
          const enrollmentsSnapshot = await db.collection('enrollments').get();
          
          const totalCourses = statsSnapshot.size;
          const totalUsers = usersSnapshot.size;
          const totalEnrollments = enrollmentsSnapshot.size;
          
          // Calculate role distribution
          const roleDistribution = { admin: 0, formateur: 0, student: 0 };
          usersSnapshot.docs.forEach((doc: any) => {
            const userData = doc.data();
            const role = userData.role || 'student';
            roleDistribution[role as keyof typeof roleDistribution]++;
          });
          
          return {
            totalCourses,
            totalUsers,
            totalEnrollments,
            roleDistribution,
            recentActivity: [] // Simplified for performance
          };
        })(),
        
        // Courses data
        (async () => {
          let query = db.collection('courses');
          
          if (userRole === 'formateur') {
            query = query.where('instructorId', '==', userId);
          } else if (userRole === 'student') {
            query = query.where('status', '==', 'published');
          }
          
          const coursesSnapshot = await query.orderBy('createdAt', 'desc').limit(10).get();
          return coursesSnapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
            };
          });
        })(),
        
        // Users data (admin only)
        (async () => {
          if (userRole !== 'admin') return [];
          
          const usersSnapshot = await db.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();
            
          return usersSnapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
            };
          });
        })(),
        
        // Enrollment requests (admin only)
        (async () => {
          if (userRole !== 'admin') return [];
          
          const requestsSnapshot = await db.collection('enrollmentRequests')
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
            
          return requestsSnapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
            };
          });
        })()
      ]);

      // Process results with error handling
      const stats = statsPromise.status === 'fulfilled' ? statsPromise.value : {};
      const courses = coursesPromise.status === 'fulfilled' ? coursesPromise.value : [];
      const users = usersPromise.status === 'fulfilled' ? usersPromise.value : [];
      const enrollmentRequests = enrollmentRequestsPromise.status === 'fulfilled' ? enrollmentRequestsPromise.value : [];

      return {
        stats,
        courses,
        users,
        enrollmentRequests,
        roleDistribution: (stats as any).roleDistribution || { admin: 0, formateur: 0, student: 0 }
      };
    }, {
      cacheKey: `dashboard-overview-${userRole}-${userId}`,
      userId
    });

  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
