import { NextRequest, NextResponse } from "next/server";
import { CosmosClient } from "@azure/cosmos";

let cosmosClient: CosmosClient | null = null;
function getCosmosClient() {
  if (!cosmosClient && process.env.COSMOS_CONNECTION_STRING) {
    cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  }
  return cosmosClient;
}

export async function POST(request: NextRequest) {
  try {
    const { email, address } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const client = getCosmosClient();
    if (!client) {
      // If no DB, just log and return success (best effort)
      console.log(`[notify-coverage] Email: ${email}, Address: ${address}`);
      return NextResponse.json({ ok: true });
    }

    // Store in coverage-requests container
    const db = client.database("overtaxed");
    
    // Try to create the container if it doesn't exist
    try {
      await db.containers.createIfNotExists({
        id: "coverage-requests",
        partitionKey: { paths: ["/email"] },
      });
    } catch {
      // Container might already exist, continue
    }

    // Extract IP from headers (best effort)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || null;

    const container = db.container("coverage-requests");
    await container.items.create({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: email.trim().toLowerCase(),
      searched_address: address || "",
      timestamp: new Date().toISOString(),
      ip,
      source: "homepage-miss",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[notify-coverage] Error:", error);
    // Return success anyway — don't expose errors to user
    return NextResponse.json({ ok: true });
  }
}
