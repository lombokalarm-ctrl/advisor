import { NextResponse } from "next/server";

import { createCmsSession } from "@/lib/custom-cms/auth-server";
import {
  checkCmsLoginRateLimit,
  clearCmsLoginRateLimit,
  formatRetryAfterMessage,
  getClientKeyFromRequest,
  recordFailedCmsLogin,
} from "@/lib/custom-cms/login-rate-limit";

export async function POST(request: Request) {
  const clientKey = getClientKeyFromRequest(request);
  const rateLimitState = checkCmsLoginRateLimit(clientKey);

  if (!rateLimitState.allowed) {
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan login. Coba lagi dalam ${formatRetryAfterMessage(rateLimitState.retryAfterSeconds)}.`,
      },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim();
    const password = body.password?.trim();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi." }, { status: 400 });
    }

    await createCmsSession(username, password);
    clearCmsLoginRateLimit(clientKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login CMS gagal.";
    const isConfigError = message.includes("belum dikonfigurasi");

    if (!isConfigError) {
      const nextState = recordFailedCmsLogin(clientKey);

      if (!nextState.allowed) {
        return NextResponse.json(
          {
            error: `Terlalu banyak percobaan login. Coba lagi dalam ${formatRetryAfterMessage(nextState.retryAfterSeconds)}.`,
          },
          { status: 429 },
        );
      }
    }

    const status = isConfigError ? 503 : 401;

    return NextResponse.json({ error: message }, { status });
  }
}
