import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return new NextResponse(null, { status: 404 });
  }

  const url = `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${encodeURIComponent(address)}&key=${key}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=604800, immutable", // cache 7 days
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
