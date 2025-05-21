// src/utils/jwt.js
export function decodeJwt(token) {
  try {
    // 1. Grab the payload section
    const payload = token.split(".")[1];
    if (!payload) return null;

    // 2. Convert Base64URL → Base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    // 3. Pad with '=' to make length a multiple of 4
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    // 4. Decode & parse
    const json     = atob(padded);
    const decoded  = JSON.parse(json);
    return decoded;
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}
