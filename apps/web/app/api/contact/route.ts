import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log the data for now (MVP)
    console.log('Contact Form Submission:', data);
    
    // in a real app, you would save to DB or send email here
    // await db.contactSubmissions.create({ data });

    return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 });
  }
}
