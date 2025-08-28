'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TutorialsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to courses page since tutorials are courses
    router.replace('/courses');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Courses...</h1>
        <p className="text-muted-foreground">Our tutorials are available in the courses section.</p>
      </div>
    </div>
  );
}
