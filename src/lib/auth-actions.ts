"use server";

import { redirect } from "next/navigation";

import {
  LOGIN_PATH,
  createSession,
  destroySession,
  safeNextPath,
  verifyAdminPassword,
} from "@/lib/auth";

export type LoginState = { error?: string };

/** Server action for the login form: fields `password` and optional `next`. */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || !verifyAdminPassword(password)) {
    return { error: "That password is not right." };
  }
  await createSession();
  redirect(safeNextPath(formData.get("next")));
}

/** Server action: clear the session and go to the login page. */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect(LOGIN_PATH);
}
