import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server.js";
import type { ZodType } from "zod";

const DEFAULT_MAX_BODY_BYTES = 256 * 1024;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function parseJson<T>(request: Request, schema: ZodType<T>, maxBytes = DEFAULT_MAX_BODY_BYTES) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  }

  const reader = request.body?.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let raw = "";
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.byteLength;
      if (receivedBytes > maxBytes) {
        await reader.cancel();
        throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body must contain valid JSON.");
  }

  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError(422, "VALIDATION_ERROR", "Request validation failed.", result.error.flatten());
  }

  return result.data;
}

export function assertTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") {
    throw new ApiError(403, "INVALID_ORIGIN", "Cross-site requests are not allowed.");
  }
  if (!origin) return;

  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = process.env.APP_URL ? new URL(process.env.APP_URL).origin : requestOrigin;
  if (origin !== requestOrigin && origin !== configuredOrigin) {
    throw new ApiError(403, "INVALID_ORIGIN", "Request origin is not allowed.");
  }
}

export function requestFingerprint(request: Request, discriminator = "anonymous") {
  const forwardedFor = (
    request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-forwarded-for")
  )?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  return `${ip}:${discriminator.trim().toLowerCase()}`;
}

export function apiJson(body: unknown, init?: ResponseInit) {
  const requestId = randomUUID();
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Request-Id", requestId);
  return NextResponse.json(body, { ...init, headers });
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    const headers = new Headers();
    if (error.status === 429 && typeof error.details === "object" && error.details) {
      const retryAfter = (error.details as { retryAfterSeconds?: number }).retryAfterSeconds;
      if (retryAfter) headers.set("Retry-After", String(retryAfter));
    }
    return apiJson({ error: { code: error.code, message: error.message, details: error.details } }, { status: error.status, headers });
  }

  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Email already registered")) {
    return apiJson({ error: { code: "EMAIL_ALREADY_REGISTERED", message: "An account with this email already exists." } }, { status: 409 });
  }
  if (message.includes("Password reset link is invalid or expired")) {
    return apiJson({ error: { code: "INVALID_RESET_TOKEN", message: "This password reset link is invalid or expired." } }, { status: 400 });
  }
  if (message.includes("AUTHENTICATION_REQUIRED")) {
    return apiJson({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required." } }, { status: 401 });
  }
  if (message.includes("RESOURCE_CONFLICT")) {
    return apiJson({ error: { code: "RESOURCE_CONFLICT", message: "A resource with this identifier already exists." } }, { status: 409 });
  }
  if (message.includes("RATE_LIMITED")) {
    const retryAfterMatch = message.match(/retryAfterSeconds[^0-9]*(\d+)/);
    const retryAfterSeconds = retryAfterMatch ? Number(retryAfterMatch[1]) : 60;
    return apiJson(
      { error: { code: "RATE_LIMITED", message: "Too many requests. Try again later." } },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }
  if (message.includes("Convex is not configured") || message.includes("backend server secret is not configured")) {
    return apiJson({ error: { code: "SERVICE_UNAVAILABLE", message: "The service is temporarily unavailable." } }, { status: 503 });
  }

  console.error("[component-vault-api] unexpected error", error);
  return apiJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } }, { status: 500 });
}
