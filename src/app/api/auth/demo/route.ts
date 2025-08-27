import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { role = 'admin' } = await request.json();
    
    // Create a demo user session based on role
    const demoUsers = {
      admin: {
        uid: 'demo-admin-user',
        role: 'admin',
        email: 'admin@dm0-elearning.com',
        displayName: 'Demo Admin',
      },
      formateur: {
        uid: 'demo-formateur-user',
        role: 'formateur',
        email: 'formateur@dm0-elearning.com',
        displayName: 'Demo Formateur',
      },
      student: {
        uid: 'demo-student-user',
        role: 'student',
        email: 'student@dm0-elearning.com',
        displayName: 'Demo Student',
      }
    };

    const demoUser = demoUsers[role as keyof typeof demoUsers] || demoUsers.admin;
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Set demo session cookie with role info
    cookieStore.set('AuthToken', `demo-token-${role}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return NextResponse.json({
      success: true,
      user: { ...demoUser, tokenExpiration },
      message: 'Demo session created successfully'
    });

  } catch (error) {
    console.error('Error creating demo session:', error);
    return NextResponse.json(
      { error: 'Failed to create demo session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Demo authentication endpoint',
    usage: 'POST to create a demo session'
  });
}
