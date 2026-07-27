import { NextResponse } from "next/server";
import { getAdCampaigns, createAdCampaign } from "@/lib/actions/ad.actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || undefined;
  const status = searchParams.get("status") || undefined;

  const res = await getAdCampaigns({ platform, status });
  if (res.success) {
    return NextResponse.json(res.data);
  }
  return NextResponse.json({ error: res.error }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await createAdCampaign(body);
    if (res.success) {
      return NextResponse.json(res.data);
    }
    return NextResponse.json({ error: res.error }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}
