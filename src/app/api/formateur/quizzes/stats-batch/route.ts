import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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

    const { quizIds } = await request.json();

    if (!quizIds || !Array.isArray(quizIds)) {
      return NextResponse.json({ error: 'Quiz IDs array is required' }, { status: 400 });
    }

    // Batch fetch all quiz attempts for the given quiz IDs
    const attemptsSnapshot = await db.collection('quizAttempts')
      .where('quizId', 'in', quizIds)
      .get();

    // Group attempts by quiz ID
    const attemptsByQuiz = attemptsSnapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      const quizId = data.quizId;
      if (!acc[quizId]) {
        acc[quizId] = [];
      }
      acc[quizId].push(data);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate statistics for each quiz
    const quizStats = quizIds.map(quizId => {
      const attempts = attemptsByQuiz[quizId] || [];
      
      if (attempts.length === 0) {
        return {
          quizId,
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          averageTimeSpent: 0,
          questionStats: [],
        };
      }

      const totalAttempts = attempts.length;
      const scores = attempts.map(a => a.score || 0);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
      const passedAttempts = attempts.filter(a => (a.score || 0) >= (a.passingScore || 70)).length;
      const passRate = (passedAttempts / totalAttempts) * 100;
      const timeSpent = attempts.map(a => a.timeSpent || 0).filter(t => t > 0);
      const averageTimeSpent = timeSpent.length > 0 ? 
        timeSpent.reduce((sum, time) => sum + time, 0) / timeSpent.length : 0;

      // Calculate question-level statistics
      const questionStats = calculateQuestionStats(attempts);

      return {
        quizId,
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        averageTimeSpent: Math.round(averageTimeSpent),
        questionStats,
      };
    });

    // Add cache headers for better performance
    const response = NextResponse.json({ 
      success: true,
      quizStats 
    });

    // Cache for 2 minutes since quiz stats don't change frequently
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');

    return response;

  } catch (error) {
    console.error('Error fetching batch quiz statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate question-level statistics
function calculateQuestionStats(attempts: any[]): any[] {
  if (attempts.length === 0) return [];

  // Get all unique questions from the first attempt
  const firstAttempt = attempts[0];
  const questions = firstAttempt.questions || [];
  
  return questions.map((question: any, questionIndex: number) => {
    const questionAttempts = attempts.map(attempt => {
      const attemptQuestion = attempt.questions?.[questionIndex];
      return {
        correct: attemptQuestion?.correct || false,
        timeSpent: attemptQuestion?.timeSpent || 0,
        selectedAnswer: attemptQuestion?.selectedAnswer,
      };
    });

    const correctAnswers = questionAttempts.filter(q => q.correct).length;
    const totalAnswers = questionAttempts.length;
    const correctRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const averageTimeSpent = questionAttempts.reduce((sum, q) => sum + q.timeSpent, 0) / totalAnswers;

    return {
      questionIndex,
      correctRate: Math.round(correctRate * 100) / 100,
      averageTimeSpent: Math.round(averageTimeSpent),
      totalAnswers,
      correctAnswers,
    };
  });
}
