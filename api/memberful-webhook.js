import crypto from "crypto";
import { upsertMemberByEmail, deactivateMemberByEmail } from "./store.js";

// Den här filen tar emot signaler från Memberful (t.ex. när någon blir medlem)
export default async function handler(req, res) {
  const sig = req.headers["x-memberful-signature"];
  const body = JSON.stringify(req.body);
  const expected = crypto
    .createHmac("sha256", process.env.MEMBERFUL_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  // Säkerhetskontroll – ser till att bara Memberful får prata med sidan
  if (sig !== expected) return res.status(401).end("Invalid signature");

  const payload = req.body;
  const email = payload?.member?.email;
  const event = payload?.event;
  if (!email) return res.status(400).end("Missing email");

  const ACTIVATE = new Set([
    "member.created",
    "subscription.created",
    "subscription.renewed",
    "subscription.reactivated",
  ]);
  const DEACTIVATE = new Set([
    "subscription.canceled",
    "subscription.expired",
    "subscription.suspended",
  ]);

  if (ACTIVATE.has(event)) await upsertMemberByEmail(email);
  if (DEACTIVATE.has(event)) await deactivateMemberByEmail(email);

  return res.status(200).end("ok");
}
