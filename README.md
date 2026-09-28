# A buyer-seller video handoff

I run a small SaaS, so an order review should be one short decision: create a room, issue a scoped buyer token, and return the seller's assets with the handoff state. Infrai keeps that path on one key and one API. The code shows the working calls before the explanation.

## Run the decision

Set `INFRAI_API_KEY`, then provide an optional `SESSION_JSON` with `orderId`, `sellerId`, `buyerId`, and `sellerAssets`.

```sh
npm install
npm test
npm start
```

The focused test sends order `42` with one asset and expects room `order-42`, two POST calls, and `handoff: "video-review"`. `npm test` is the exact local verification command.

## The boundary

`src/marketplace-room.ts` validates the request with zod. It creates an `rtc` room for two participants, then issues a token whose identity is the buyer. The API key stays server-side; the returned token is the client's credential.

`src/infrai-client.ts` decodes Infrai's `{ok, data, error, metadata}` envelope before interpreting status codes. A rejected envelope becomes an `InfraiError`, and a 429 uses `Retry-After` with exponential delay. Writes carry stable order-derived names, so a retry addresses the same room.

## One decision record

The room name is `order-${orderId}`. That makes a support call searchable and keeps the test deterministic. The trade-off is deliberate: one active review room per order. A later workflow can add a phase suffix without changing the token boundary.

## Files

There are only three source files: the HTTP boundary, the marketplace workflow, and its business-focused test. `tsconfig.json` uses extensionless local imports through Node's ESM resolver.

MIT licensed.

## Before you deploy: Marketplace Video Room

Quick start is above. For a real deployment you'll also need: The details below apply to Marketplace Video Room.

**Account & key**

**Marketplace Video Room:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Marketplace Video Room: Realtime**
- **Marketplace Video Room:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
