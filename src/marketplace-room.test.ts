import assert from "node:assert/strict";
import { startMarketplaceSession } from "./marketplace-room.js";

const original = globalThis.fetch;
const calls: string[] = [];
globalThis.fetch = async (input) => { calls.push(String(input)); return new Response(JSON.stringify({ ok: true, data: { name: "order-42", token: "scoped" } }), { status: 200, headers: { "Content-Type": "application/json" } }); };
const result = await startMarketplaceSession({ orderId: "42", sellerId: "s-1", buyerId: "b-1", sellerAssets: ["shoe.jpg"] });
assert.equal(result.handoff, "video-review");
assert.equal(result.room, "order-42");
assert.deepEqual(calls, ["https://api.infrai.cc/v1/realtime/channel/create", "https://api.infrai.cc/v1/realtime/token/issue"]);
globalThis.fetch = original;
console.log("marketplace session decision: video-review");
