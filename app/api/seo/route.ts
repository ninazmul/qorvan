import { NextResponse } from "next/server";
import { getAllSeoPages, getSeoPageByRoute, updateSeoPage } from "@/lib/actions/seo.actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const route = searchParams.get("route");

  if (route) {
    const res = await getSeoPageByRoute(route);
    if (res.success) {
      return NextResponse.json(res.data);
    }
    return NextResponse.json({ error: res.error }, { status: 500 });
  }

  const res = await getAllSeoPages();
  if (res.success) {
    return NextResponse.json(res.data);
  }
  return NextResponse.json({ error: res.error }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const { route, ...payload } = await request.json();
    if (!route) {
      return NextResponse.json({ error: "Route parameter is required" }, { status: 400 });
    }
    const res = await updateSeoPage(route, payload);
    if (res.success) {
      return NextResponse.json(res.data);
    }
    return NextResponse.json({ error: res.error }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid request" }, { status: 400 });
  }
}
