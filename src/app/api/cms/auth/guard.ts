import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { CMS_SESSION_COOKIE_NAME, isCmsAuthConfigured, readCmsSessionToken } from "@/lib/custom-cms/auth";

export async function ensureCmsApiAuthorized() {
  if (!isCmsAuthConfigured()) {
    return NextResponse.json({ error: "CMS auth belum dikonfigurasi di environment." }, { status: 503 });
  }

  const cookieStore = await cookies();
  const session = readCmsSessionToken(cookieStore.get(CMS_SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized CMS access." }, { status: 401 });
  }

  return null;
}
