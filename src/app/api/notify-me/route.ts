import { NextRequest, NextResponse } from "next/server";
import { CosmosClient } from "@azure/cosmos";

let cosmosClient: CosmosClient | null = null;
function getCosmosClient() {
  if (!cosmosClient) {
    cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING || "");
  }
  return cosmosClient;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, pin, address } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const client = getCosmosClient();
    const database = client.database("overtaxed");
    
    // Create notify-waitlist container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({
      id: "notify-waitlist",
      partitionKey: { paths: ["/email"] },
    });

    await container.items.upsert({
      id: `${email}:${pin || "unknown"}`,
      email: email.toLowerCase().trim(),
      pin: pin || null,
      address: address || null,
      source: "coverage-gap",
      createdAt: new Date().toISOString(),
    });

    console.log(`[notify-me] Captured: ${email} for PIN ${pin} (${address})`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[notify-me] Error:", error?.message);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
