import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { db } = getAdminServices();
    const quizId = id;
    
    // Get the specific quiz from the database
    const quizDoc = await db.collection('quizzes').doc(quizId).get();
    
    if (!quizDoc.exists) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const data = quizDoc.data();
    const createdAt = data?.createdAt?.toDate?.() || new Date(data?.createdAt) || new Date();
    const updatedAt = data?.updatedAt?.toDate?.() || new Date(data?.updatedAt) || new Date();
    
    const quiz = {
      id: quizDoc.id,
      ...data,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}
