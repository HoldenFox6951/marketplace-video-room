import { z } from "zod";
import { infraiRequest, realtime } from "./infrai-client.js";

const sessionBody = z.object({ orderId: z.string().min(1), sellerId: z.string().min(1), buyerId: z.string().min(1), sellerAssets: z.array(z.string()).default([]) });
export type MarketplaceSession = z.infer<typeof sessionBody>;

export async function startMarketplaceSession(input: unknown) {
  const session = sessionBody.parse(input);
  const channelName = `order-${session.orderId}`;
  await infraiRequest("/v1/realtime/channel/create", { channel: channelName, type: "private" });
  const token = await infraiRequest("/v1/realtime/token/issue", { client_id: session.buyerId, channels: [channelName], capabilities: ["publish", "subscribe"], ttl_seconds: 3600 });
  return { orderId: session.orderId, room: channelName, buyerToken: token, sellerAssets: session.sellerAssets, handoff: "video-review" };
}

if (process.argv[1]?.endsWith("marketplace-room.ts")) {
  const raw = process.env.SESSION_JSON ?? "{\"orderId\":\"demo-1\",\"sellerId\":\"seller-1\",\"buyerId\":\"buyer-1\",\"sellerAssets\":[\"listing\"]}";
  startMarketplaceSession(JSON.parse(raw)).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error); process.exitCode = 1; });
}

void realtime.token.issue;
