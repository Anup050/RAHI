import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log the data for now (MVP)
    console.log('Newsletter Subscription:', data);
    
    // in a real app, you would save to DB or add to mailing list
    // await db.subscribers.create({ data });

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing subscription:', error);
    return NextResponse.json({ message: 'Failed to subscribe' }, { status: 500 });
  }
}
