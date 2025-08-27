import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { auth, db } = getAdminServices();
    
    // Create a demo user
    const demoUser = {
      email: 'demo@example.com',
      password: 'demo123456',
      displayName: 'Demo User',
      role: 'admin'
    };

    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: demoUser.email,
        password: demoUser.password,
        displayName: demoUser.displayName,
      });

      // Set custom claims for role
      await auth.setCustomUserClaims(userRecord.uid, {
        role: demoUser.role
      });

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: demoUser.email,
        displayName: demoUser.displayName,
        role: demoUser.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      });

      return NextResponse.json({
        success: true,
        message: 'Demo user created successfully',
        user: {
          uid: userRecord.uid,
          email: demoUser.email,
          displayName: demoUser.displayName,
          role: demoUser.role
        },
        loginCredentials: {
          email: demoUser.email,
          password: demoUser.password
        }
      });

    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({
          success: true,
          message: 'Demo user already exists',
          loginCredentials: {
            email: demoUser.email,
            password: demoUser.password
          }
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error creating demo user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create demo user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
