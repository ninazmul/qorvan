import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const subscribersFile = path.join(process.cwd(), 'data', 'subscribers.json');

async function readSubscribers(): Promise<string[]> {
  try {
    const data = await fs.readFile(subscribersFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSubscribers(list: string[]): Promise<void> {
  const dir = path.dirname(subscribersFile);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(subscribersFile, JSON.stringify(list, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const list = await readSubscribers();
    return NextResponse.json({ subscribers: list, total: list.length });
  } catch (err) {
    console.error('Subscribers fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    const list = await readSubscribers();
    if (!list.includes(email)) {
      list.push(email);
      await writeSubscribers(list);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    const list = await readSubscribers();
    const updated = list.filter((e) => e !== email);
    await writeSubscribers(updated);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
