import { NextResponse } from "next/server";
import { getPixelConfig, updatePixelConfig } from "@/lib/actions/pixel.actions";

export async function GET() {
  const res = await getPixelConfig();
  if (res.success) {
    return NextResponse.json(res.data);
  }
  return NextResponse.json({ error: res.error }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await updatePixelConfig(body);
    if (res.success) {
      return NextResponse.json(res.data);
    }
    return NextResponse.json({ error: res.error }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}
