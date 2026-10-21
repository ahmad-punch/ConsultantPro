import "server-only";

import { cookies } from "next/headers";

/** The "Acting as" name chosen in Settings, or null (cookie set by setActorAction). */
export async function getActorLabel(): Promise<string | null> {
  const raw = (await cookies()).get("rasta_actor")?.value;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}
