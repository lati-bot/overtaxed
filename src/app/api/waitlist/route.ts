import { NextRequest, NextResponse } from "next/server";
import { CosmosClient } from "@azure/cosmos";

const COSMOS_CONNECTION = process.env.COSMOS_CONNECTION_STRING || "";

let cosmosClient: CosmosClient | null = null;
function getCosmosClient() {
  if (!cosmosClient && COSMOS_CONNECTION) {
    cosmosClient = new CosmosClient(COSMOS_CONNECTION);
  }
  return cosmosClient;
}

export async function POST(request: NextRequest) {
  try {
    const { email, pin, jurisdiction } = await request.json();

    if (!email || !pin || !jurisdiction) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const client = getCosmosClient();
    if (!client) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const database = client.database("overtaxed");

    // Create container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({
      id: "waitlist",
      partitionKey: { paths: ["/jurisdiction"] },
    });

    // Deduplicate by email+pin
    const id = `${email.toLowerCase()}_${pin}`;

    await container.items.upsert({
      id,
      email: email.toLowerCase(),
      pin,
      jurisdiction,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
