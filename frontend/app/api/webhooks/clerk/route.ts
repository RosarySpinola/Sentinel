import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// In-memory store for demo - in production, sync to your database
const usersStore = new Map<string, { id: string; email: string; name: string | null; createdAt: string }>();

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Handle the event
  const eventType = evt.type;

  switch (eventType) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id);
      
      const user = {
        id,
        email: primaryEmail?.email_address || "",
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        createdAt: new Date().toISOString(),
      };

      usersStore.set(id, user);
      console.log(`User created: ${user.email}`);

      // TODO: In production, sync to your database
      // await db.users.create(user);
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id);
      
      const existingUser = usersStore.get(id);
      if (existingUser) {
        existingUser.email = primaryEmail?.email_address || existingUser.email;
        existingUser.name = [first_name, last_name].filter(Boolean).join(" ") || existingUser.name;
        usersStore.set(id, existingUser);
        console.log(`User updated: ${existingUser.email}`);
      }

      // TODO: In production, sync to your database
      // await db.users.update(id, { email, name });
      break;
    }

    case "user.deleted": {
      const { id } = evt.data;
      if (id) {
        usersStore.delete(id);
        console.log(`User deleted: ${id}`);
      }

      // TODO: In production, soft delete or cascade
      // await db.users.delete(id);
      break;
    }

    default:
      console.log(`Unhandled webhook event: ${eventType}`);
  }

  return NextResponse.json({ received: true });
}
