import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password === process.env.DASHBOARD_PASSWORD) {
    const session = await getSession();
    session.isAuthenticated = true;
    await session.save();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ isAuthenticated: session.isAuthenticated || false });
}

export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
}
