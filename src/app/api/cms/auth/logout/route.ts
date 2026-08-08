import { NextResponse } from "next/server";

import { clearCmsSession } from "@/lib/custom-cms/auth-server";

export async function POST() {
  await clearCmsSession();
  return NextResponse.json({ ok: true });
}
