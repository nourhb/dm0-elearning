import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

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

    let dashboardData = {};

    switch (userRole) {
      case 'admin':
        // Admin dashboard - all system data
        const [
          totalUsers,
          totalCourses,
          totalEnrollments,
          pendingEnrollmentRequests,
          pendingCourseApprovals,
          totalRevenue,
          allCourses,
          allUsers,
          enrollmentRequests
        ] = await Promise.all([
          db.collection('users').count().get(),
          db.collection('courses').count().get(),
          db.collection('progress').count().get(),
          db.collection('enrollmentRequests').where('status', '==', 'pending').count().get(),
          db.collection('courses').where('status', '==', 'pending_approval').count().get(),
          db.collection('payments').get().then(snapshot => {
            return snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
          }),
          db.collection('courses').orderBy('createdAt', 'desc').limit(10).get(),
          db.collection('users').orderBy('createdAt', 'desc').limit(10).get(),
          db.collection('enrollmentRequests').where('status', '==', 'pending').orderBy('createdAt', 'desc').limit(10).get()
        ]);

        dashboardData = {
          stats: {
            totalUsers: totalUsers.data().count,
            totalCourses: totalCourses.data().count,
            totalEnrollments: totalEnrollments.data().count,
            pendingEnrollmentRequests: pendingEnrollmentRequests.data().count,
            pendingCourseApprovals: pendingCourseApprovals.data().count,
            totalRevenue: totalRevenue,
          },
          courses: allCourses.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          })),
          users: allUsers.docs.map(doc => ({
            uid: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          })),
          enrollmentRequests: enrollmentRequests.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          })),
          roleDistribution: allUsers.docs.reduce((acc: any, doc: any) => {
            const role = doc.data().role || 'student';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          }, {}),
        };
        break;

      case 'formateur':
        // Formateur dashboard - their courses and students
        const [
          myCourses,
          myPublishedCourses,
          myPendingCourses,
          myRejectedCourses,
          myStudents,
          myCourseEnrollments,
          myCoursesData
        ] = await Promise.all([
          db.collection('courses').where('instructorId', '==', userId).count().get(),
          db.collection('courses').where('instructorId', '==', userId).where('status', '==', 'published').count().get(),
          db.collection('courses').where('instructorId', '==', userId).where('status', '==', 'pending_approval').count().get(),
          db.collection('courses').where('instructorId', '==', userId).where('status', '==', 'rejected').count().get(),
          db.collection('progress').where('courseId', 'in', await getMyCourseIds(db, userId)).get().then(snapshot => {
            const uniqueStudents = new Set(snapshot.docs.map(doc => doc.data().userId));
            return uniqueStudents.size;
          }),
          db.collection('progress').where('courseId', 'in', await getMyCourseIds(db, userId)).count().get(),
          db.collection('courses').where('instructorId', '==', userId).orderBy('createdAt', 'desc').get()
        ]);

        dashboardData = {
          stats: {
            totalCourses: myCourses.data().count,
            publishedCourses: myPublishedCourses.data().count,
            pendingCourses: myPendingCourses.data().count,
            rejectedCourses: myRejectedCourses.data().count,
            totalStudents: myStudents,
            totalEnrollments: myCourseEnrollments.data().count,
          },
          courses: myCoursesData.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          })),
        };
        break;

      case 'student':
        // Student dashboard - their enrollments and progress
        const [
          myEnrollments,
          myCompletedCourses,
          myInProgressCourses,
          myTotalProgress,
          myCertificates,
          myEnrolledCourses,
          myProgress
        ] = await Promise.all([
          db.collection('progress').where('userId', '==', userId).count().get(),
          db.collection('progress').where('userId', '==', userId).where('completed', '==', true).count().get(),
          db.collection('progress').where('userId', '==', userId).where('completed', '==', false).count().get(),
          db.collection('progress').where('userId', '==', userId).get().then(snapshot => {
            const enrollments = snapshot.docs.map(doc => doc.data());
            return enrollments.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0) / Math.max(enrollments.length, 1);
          }),
          db.collection('certificates').where('userId', '==', userId).count().get(),
          db.collection('progress').where('userId', '==', userId).get(),
          db.collection('progress').where('userId', '==', userId).get()
        ]);

        // Get course details for enrolled courses
        const enrolledCourseIds = myEnrolledCourses.docs.map(doc => doc.data().courseId);
        const courseDetails = enrolledCourseIds.length > 0 ? 
          await db.collection('courses').where('__name__', 'in', enrolledCourseIds).get() : 
          { docs: [] };

        dashboardData = {
          stats: {
            totalEnrollments: myEnrollments.data().count,
            completedCourses: myCompletedCourses.data().count,
            inProgressCourses: myInProgressCourses.data().count,
            averageProgress: Math.round(myTotalProgress),
            certificates: myCertificates.data().count,
          },
          enrolledCourses: courseDetails.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          })),
          progress: myProgress.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          })),
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    // Add cache headers for better performance
    const response = NextResponse.json({ 
      success: true,
      ...dashboardData 
    });

    // Cache based on data type
    const cacheTime = userRole === 'admin' ? 30 : 60; // 30s for admin, 60s for others
    response.headers.set('Cache-Control', `public, s-maxage=${cacheTime}, stale-while-revalidate=300`);

    return response;

  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get course IDs for a formateur
async function getMyCourseIds(db: any, instructorId: string): Promise<string[]> {
  const coursesSnapshot = await db.collection('courses')
    .where('instructorId', '==', instructorId)
    .select('__name__')
    .get();
  
  return coursesSnapshot.docs.map(doc => doc.id);
}
