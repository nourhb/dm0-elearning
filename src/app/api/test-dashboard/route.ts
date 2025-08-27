import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock data for testing
    const mockData = {
      stats: {
        totalCourses: 15,
        totalUsers: 42,
        totalEnrollments: 128,
        roleDistribution: {
          admin: 3,
          formateur: 8,
          student: 31
        }
      },
      courses: [
        {
          id: 'course-1',
          title: 'Introduction to Web Development',
          description: 'Learn the basics of HTML, CSS, and JavaScript',
          status: 'Published',
          instructorId: 'instructor-1',
          studentCount: 25,
          createdAt: new Date('2024-01-15')
        },
        {
          id: 'course-2',
          title: 'Advanced React Development',
          description: 'Master React hooks, context, and advanced patterns',
          status: 'Published',
          instructorId: 'instructor-2',
          studentCount: 18,
          createdAt: new Date('2024-01-20')
        },
        {
          id: 'course-3',
          title: 'Node.js Backend Development',
          description: 'Build scalable backend applications with Node.js',
          status: 'Draft',
          instructorId: 'instructor-1',
          studentCount: 0,
          createdAt: new Date('2024-01-25')
        }
      ],
      users: [
        {
          uid: 'user-1',
          displayName: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          status: 'active',
          createdAt: new Date('2024-01-01')
        },
        {
          uid: 'user-2',
          displayName: 'Jane Smith',
          email: 'jane@example.com',
          role: 'formateur',
          status: 'active',
          createdAt: new Date('2024-01-05')
        },
        {
          uid: 'user-3',
          displayName: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'student',
          status: 'active',
          createdAt: new Date('2024-01-10')
        }
      ],
      enrollmentRequests: [
        {
          id: 'enrollment-1',
          courseId: 'course-1',
          userId: 'user-3',
          status: 'pending',
          createdAt: new Date('2024-01-28')
        },
        {
          id: 'enrollment-2',
          courseId: 'course-2',
          userId: 'user-4',
          status: 'approved',
          createdAt: new Date('2024-01-27')
        }
      ],
      roleDistribution: {
        admin: 3,
        formateur: 8,
        student: 31
      }
    };

    return NextResponse.json(mockData);

  } catch (error) {
    console.error('Error in test dashboard:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
