import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // EMERGENCY FIX: Return static data to avoid Firebase issues on Render
    const mockData = {
      stats: {
        totalCourses: 12,
        totalUsers: 45,
        totalEnrollments: 89,
        roleDistribution: {
          admin: 2,
          formateur: 8,
          student: 35
        }
      },
      courses: [
        {
          id: 'course-1',
          title: 'Introduction to Web Development',
          description: 'Learn the basics of HTML, CSS, and JavaScript',
          status: 'Published',
          instructorId: 'instructor-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: 'Programming',
          level: 'Beginner',
          duration: '8 weeks',
          price: 0,
          imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
          lessons: 12,
          students: 25
        },
        {
          id: 'course-2',
          title: 'Advanced React Development',
          description: 'Master React hooks, context, and advanced patterns',
          status: 'Published',
          instructorId: 'instructor-2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: 'Programming',
          level: 'Advanced',
          duration: '10 weeks',
          price: 0,
          imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
          lessons: 15,
          students: 18
        },
        {
          id: 'course-3',
          title: 'Data Science Fundamentals',
          description: 'Introduction to Python, pandas, and data analysis',
          status: 'Draft',
          instructorId: 'instructor-3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: 'Data Science',
          level: 'Intermediate',
          duration: '12 weeks',
          price: 0,
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
          lessons: 20,
          students: 12
        }
      ],
      users: [
        {
          id: 'user-1',
          displayName: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        },
        {
          id: 'user-2',
          displayName: 'Jane Smith',
          email: 'jane@example.com',
          role: 'formateur',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        },
        {
          id: 'user-3',
          displayName: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'student',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }
      ],
      enrollmentRequests: [
        {
          id: 'enrollment-1',
          userId: 'user-3',
          courseId: 'course-1',
          status: 'approved',
          createdAt: new Date().toISOString(),
          completedAt: null
        },
        {
          id: 'enrollment-2',
          userId: 'user-4',
          courseId: 'course-2',
          status: 'pending',
          createdAt: new Date().toISOString(),
          completedAt: null
        }
      ],
      roleDistribution: {
        admin: 2,
        formateur: 8,
        student: 35
      }
    };

    return NextResponse.json(mockData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Status': 'Static Data - Firebase Bypassed'
      }
    });

  } catch (error) {
    console.error('Error in dashboard overview:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
