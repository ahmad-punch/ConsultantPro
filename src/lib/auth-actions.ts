"use server";

import { redirect } from "next/navigation";

import {
  LOGIN_PATH,
  createSession,
  destroySession,
  safeNextPath,
  verifyCredentials,
} from "@/lib/auth";

export type LoginState = { error?: string; email?: string };

/** Server action for the login form: fields `email`, `password` and optional `next`. */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const emailText = typeof email === "string" ? email.trim().slice(0, 254) : "";
  const user =
    typeof password === "string" ? verifyCredentials(emailText, password) : null;
  if (!user) {
    return { error: "That email and password do not match.", email: emailText };
  }
  await createSession(user);
  redirect(safeNextPath(formData.get("next")));
}

/** Server action: clear the session and go to the login page. */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect(LOGIN_PATH);
}
