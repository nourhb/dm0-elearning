
import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';

export async function POST() {
  try {
    // Instruct the browser to delete the cookie
    const cookieStore = await cookies();
    cookieStore.set('AuthToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: -1, // Expire the cookie immediately
    });
    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {success: false, message: 'An unknown error occurred.'},
      {status: 500}
    );
  }
}
