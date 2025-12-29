import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Get the Svix headers
  const headersList = await headers();
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Verify the webhook signature
  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Handle the event
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address || "";
    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    // Sync to database via API
    const apiUrl = process.env.API_URL || "http://localhost:3001";
    try {
      await fetch(`${apiUrl}/api/v1/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: id,
          email,
          name,
        }),
      });
    } catch (err) {
      console.error("Error syncing user to database:", err);
      // Don't fail the webhook, just log the error
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // Delete from database via API
    const apiUrl = process.env.API_URL || "http://localhost:3001";
    try {
      await fetch(`${apiUrl}/api/v1/users/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting user from database:", err);
    }
  }

  return NextResponse.json({ received: true });
}
