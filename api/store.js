import crypto from "crypto";

// En superenkel minnesdatabas – tillfällig lagring av medlems-token
const mem = new Map(); // email -> { email, token, active }

export async function upsertMemberByEmail(email) {
  const cur = mem.get(email);
  const token = cur?.token || crypto.randomBytes(20).toString("hex");
  mem.set(email, { email, token, active: true });
  return mem.get(email);
}

export async function deactivateMemberByEmail(email) {
  const cur = mem.get(email) || {};
  mem.set(email, { ...cur, email, active: false });
}

export async function getMemberByToken(token) {
  for (const m of mem.values()) if (m.token === token) return m;
  return null;
}
