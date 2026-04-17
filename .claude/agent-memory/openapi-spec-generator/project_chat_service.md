---
name: chat-service source location and structure
description: Where chat-service source lives, framework used, and where its OpenAPI contract is stored
type: project
---

The chat-service source is compiled-only at `D:/kvint-for-contracts/chat-service/` (no TypeScript source files, only `dist/`).

**Why:** The service repo ships only compiled output. All type information is extracted from `.d.ts` declaration files and compiled `.js` files (for decorator metadata).

**How to apply:** When analyzing chat-service always read from `apps/chat-service/dist/` and `packages/chat-kit/dist/`. The `@kvint/chat-kit` package at `packages/chat-kit/dist/` is the shared type library — all response and input schemas are defined there as Zod schemas exported via `.d.ts` files.

The OpenAPI contract file lives at:
`D:/kvint-for-contracts/contract-service/packages/chat-service-module/openapi/openapi.yaml`

Framework: NestJS with `nestjs-zod` (ZodValidationPipe). Auth via JwtAuthGuard on all `/chats` routes. Error responses use RFC 7807 ProblemDetails format with a `code` enum field.
