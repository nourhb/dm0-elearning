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

    // Only allow formateur and admin to access this endpoint
    if (userRole !== 'formateur' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get courseId from query parameters for filtering
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    let quizzes = [];

    if (userRole === 'admin') {
      // Admin sees all quizzes, optionally filtered by courseId
      let query: any = db.collection('quizzes');
      if (courseId) {
        query = query.where('courseId', '==', courseId);
      }
      const quizzesSnapshot = await query.orderBy('createdAt', 'desc').get();
      quizzes = quizzesSnapshot.docs.map((doc: any) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date();
        const updatedAt = data.updatedAt?.toDate?.() || new Date(data.updatedAt) || new Date();
        
        return {
          id: doc.id,
          ...data,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        };
      });
    } else {
      // Formateur sees only their own quizzes, optionally filtered by courseId
      let query: any = db.collection('quizzes').where('createdBy', '==', userId);
      if (courseId) {
        query = query.where('courseId', '==', courseId);
      }
      const quizzesSnapshot = await query.orderBy('createdAt', 'desc').get();
      
      quizzes = quizzesSnapshot.docs.map((doc: any) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date();
        const updatedAt = data.updatedAt?.toDate?.() || new Date(data.updatedAt) || new Date();
        
        return {
          id: doc.id,
          ...data,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        };
      });
    }

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}
