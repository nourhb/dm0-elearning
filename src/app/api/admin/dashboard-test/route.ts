import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin dashboard TEST API called');
    const { auth, db } = getAdminServices();
    console.log('Firebase services obtained successfully');

    // SIMPLE APPROACH - No authentication required
    console.log('Fetching Firestore collections...');
    
    // Fetch all data in parallel
    const collectionPromises = [
      db.collection('users').get().catch((error) => {
        console.warn('Failed to fetch users collection:', error);
        return { docs: [] };
      }),
      db.collection('courses').get().catch((error) => {
        console.warn('Failed to fetch courses collection:', error);
        return { docs: [] };
      }),
      db.collection('progress').get().catch((error) => {
        console.warn('Failed to fetch progress collection:', error);
        return { docs: [] };
      }),
      db.collection('communityPosts').get().catch((error) => {
        console.warn('Failed to fetch communityPosts collection:', error);
        return { docs: [] };
      }),
      db.collection('postComments').get().catch((error) => {
        console.warn('Failed to fetch postComments collection:', error);
        return { docs: [] };
      }),
      db.collection('messages').get().catch((error) => {
        console.warn('Failed to fetch messages collection:', error);
        return { docs: [] };
      }),
      db.collection('enrollmentRequests').get().catch((error) => {
        console.warn('Failed to fetch enrollmentRequests collection:', error);
        return { docs: [] };
      }),
    ];
    
    const results = await Promise.all(collectionPromises);
    const [usersSnapshot, coursesSnapshot, progressSnapshot, communityPostsSnapshot, postCommentsSnapshot, messagesSnapshot, enrollmentRequestsSnapshot] = results;
    console.log('Firestore collections fetched successfully');

    // Process users
    const users = usersSnapshot.docs.map(doc => {
      try {
        const data = doc.data();
        return {
          uid: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
        };
      } catch (error) {
        console.warn('Error processing user document:', doc.id, error);
        return null;
      }
    }).filter(Boolean);

    // Process courses
    const courses = coursesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
      };
    });

    // Process progress
    const progress = progressSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate?.() || data.startedAt || new Date(),
        completedAt: data.completedAt?.toDate?.() || data.completedAt || new Date(),
      };
    });

    // Process community posts
    const communityPosts = communityPostsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
        lastActivityAt: data.lastActivityAt?.toDate?.() || data.lastActivityAt || new Date(),
        deletedAt: data.deletedAt?.toDate?.() || data.deletedAt || null,
      };
    });

    // Process post comments
    const postComments = postCommentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
        editedAt: data.editedAt?.toDate?.() || data.editedAt || null,
        deletedAt: data.deletedAt?.toDate?.() || data.deletedAt || null,
      };
    });

    // Process chat messages
    const messages = messagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        deletedAt: data.deletedAt?.toDate?.() || data.deletedAt || null,
      };
    });

    // Process enrollment requests
    const enrollmentRequests = enrollmentRequestsSnapshot.docs.map(doc => {
      try {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
          respondedAt: data.respondedAt?.toDate?.() || data.respondedAt || null,
        };
      } catch (error) {
        console.warn('Error processing enrollment request document:', doc.id, error);
        return null;
      }
    }).filter(Boolean);

    // Calculate statistics
    console.log('Calculating statistics...');
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      totalUsers: users.length,
      totalCourses: courses.length,
      newUsersThisMonth: users.filter(u => {
        if (!u || !u.createdAt) return false;
        const createdAt = new Date(u.createdAt);
        return createdAt >= thisMonth;
      }).length,
      activeUsers: users.filter(u => u && (u as any).status === 'active').length,
      suspendedUsers: users.filter(u => u && (u as any).status === 'suspended').length,
      publishedCourses: courses.filter(c => (c as any).status === 'Published').length,
      draftCourses: courses.filter(c => (c as any).status === 'Draft').length,
      totalEnrollments: progress.length,
      completedEnrollments: progress.filter(p => (p as any).completed).length,
      averageCompletionRate: progress.length > 0 
        ? Math.round((progress.filter(p => (p as any).completed).length / progress.length) * 100)
        : 0,
      totalPosts: communityPosts.filter(p => !(p as any).isDeleted).length,
      totalComments: postComments.filter(c => !(c as any).isDeleted).length,
      totalMessages: messages.filter(m => !(m as any).isDeleted).length,
      pinnedPosts: communityPosts.filter(p => (p as any).isPinned && !(p as any).isDeleted).length,
      deletedPosts: communityPosts.filter(p => (p as any).isDeleted).length,
      deletedComments: postComments.filter(c => (c as any).isDeleted).length,
      deletedMessages: messages.filter(m => (m as any).isDeleted).length,
      pendingEnrollmentRequests: enrollmentRequests.filter(r => r && (r as any).status === 'pending').length,
      approvedEnrollmentRequests: enrollmentRequests.filter(r => r && (r as any).status === 'approved').length,
      deniedEnrollmentRequests: enrollmentRequests.filter(r => r && (r as any).status === 'denied').length,
    };

    // Calculate role distribution
    const roleDistribution = {
      admin: users.filter(u => u && (u as any).role === 'admin').length,
      formateur: users.filter(u => u && (u as any).role === 'formateur').length,
      student: users.filter(u => u && (u as any).role === 'student').length,
    };

    // Calculate recent activity (last 7 days)
    console.log('Calculating recent activity...');
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = [];

    // User signups
    const recentUsers = users
      .filter(u => u && (u as any).createdAt && new Date((u as any).createdAt) >= lastWeek)
      .map(u => ({
        type: 'user_signup',
        user: (u as any).displayName,
        action: 'joined the platform',
        time: (u as any).createdAt,
        role: (u as any).role,
        createdBy: (u as any).createdBy,
      }));

    // New posts
    const recentPosts = communityPosts
      .filter(p => new Date((p as any).createdAt) >= lastWeek && !(p as any).isDeleted)
      .map(p => ({
        type: 'post_created',
        user: (p as any).authorName,
        action: 'created a post',
        time: (p as any).createdAt,
        role: 'community',
      }));

    // New comments
    const recentComments = postComments
      .filter(c => new Date((c as any).createdAt) >= lastWeek && !(c as any).isDeleted)
      .map(c => ({
        type: 'comment_created',
        user: (c as any).authorName,
        action: 'commented on a post',
        time: (c as any).createdAt,
        role: 'community',
      }));

    // New courses
    const recentCourses = courses
      .filter(c => new Date((c as any).createdAt) >= lastWeek)
      .map(c => ({
        type: 'course_created',
        user: 'Instructor',
        action: `created course: ${(c as any).title}`,
        time: (c as any).createdAt,
        role: 'formateur',
      }));

    // New enrollment requests
    const recentEnrollmentRequests = enrollmentRequests
      .filter(r => {
        if (!r) return false;
        try {
          return new Date((r as any).createdAt) >= lastWeek;
        } catch (error) {
          console.warn('Error filtering enrollment request:', (r as any).id, error);
          return false;
        }
      })
      .map(r => ({
        type: 'info',
        user: (r as any).studentName || 'Unknown Student',
        action: `requested enrollment in "${(r as any).courseTitle || 'Unknown Course'}"`,
        time: (r as any).createdAt,
        role: 'student',
      }));

    // Combine all activities and sort by time
    recentActivity.push(...recentUsers, ...recentPosts, ...recentComments, ...recentCourses, ...recentEnrollmentRequests);
    recentActivity.sort((a, b) => new Date((b as any).time).getTime() - new Date((a as any).time).getTime());
    recentActivity.splice(10);

    // Calculate top performing users
    console.log('Calculating top performing users...');
    const studentProgress = progress
      .filter(p => (p as any).completed)
      .reduce((acc, p) => {
        acc[(p as any).userId] = (acc[(p as any).userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topPerformingUsers = Object.entries(studentProgress)
      .map(([userId, completedCount]) => {
        const user = users.find(u => u && (u as any).uid === userId);
        return user ? {
          ...user,
          coursesCompleted: completedCount,
          averageScore: Math.floor(Math.random() * 20) + 80,
          badges: Math.floor(completedCount / 2),
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b as any).coursesCompleted - (a as any).coursesCompleted)
      .slice(0, 5);

    console.log('Admin dashboard TEST data prepared successfully');
    return NextResponse.json({ 
      users,
      courses,
      progress,
      communityPosts,
      postComments,
      messages,
      enrollmentRequests,
      stats,
      roleDistribution,
      recentActivity,
      topPerformingUsers,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching admin dashboard TEST data:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    console.error('Error details:', {
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
