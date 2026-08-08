import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  CMS_SESSION_COOKIE_NAME,
  createCmsSessionToken,
  getCmsSessionMaxAgeSeconds,
  isCmsAuthConfigured,
  readCmsSessionToken,
  validateCmsCredentials,
} from "@/lib/custom-cms/auth";

export async function getCmsSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CMS_SESSION_COOKIE_NAME)?.value;

  return readCmsSessionToken(sessionToken);
}

export async function requireCmsPageAuth(nextPath: string) {
  const session = await getCmsSession();

  if (!session) {
    redirect(`/cms/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}

export async function createCmsSession(username: string, password: string) {
  if (!isCmsAuthConfigured()) {
    throw new Error("CMS auth belum dikonfigurasi di environment.");
  }

  if (!validateCmsCredentials(username, password)) {
    throw new Error("Username atau password salah.");
  }

  const cookieStore = await cookies();
  cookieStore.set(CMS_SESSION_COOKIE_NAME, createCmsSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getCmsSessionMaxAgeSeconds(),
  });
}

export async function clearCmsSession() {
  const cookieStore = await cookies();
  cookieStore.set(CMS_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
