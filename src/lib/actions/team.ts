"use server";

import { eq, not } from "drizzle-orm";
import { cookies } from "next/headers";

import { requirePermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import type { FormState } from "@/lib/validation/fields";
import { teamMemberIdSchema, teamMemberSchema } from "@/lib/validation/team";

import { ACTOR_COOKIE, done, failed, parseForm, revalidateAdmin, unexpected } from "./helpers";

export async function createTeamMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("team.manage");
  const parsed = parseForm(teamMemberSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [row] = await db.insert(teamMembers).values(parsed.data).returning({ id: teamMembers.id });
    revalidateAdmin();
    return done("Team member added.", row.id);
  } catch (error) {
    return unexpected(error, "add the team member");
  }
}

/** Deactivate or reactivate a team member (they stay on past cases). */
export async function toggleTeamMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("team.manage");
  const parsed = parseForm(teamMemberIdSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const [row] = await db
      .update(teamMembers)
      .set({ active: not(teamMembers.active) })
      .where(eq(teamMembers.id, parsed.data.id))
      .returning({ name: teamMembers.name, active: teamMembers.active });
    if (!row) return failed("That team member no longer exists.");
    revalidateAdmin();
    return done(`${row.name} ${row.active ? "reactivated" : "deactivated"}.`, parsed.data.id);
  } catch (error) {
    return unexpected(error, "update the team member");
  }
}

/** Choose whose name goes on case notes from this browser ("Acting as"). */
export async function setActorAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("records.edit");
  const parsed = parseForm(teamMemberIdSchema, formData);
  if (!parsed.ok) return parsed.state;
  const member = await db.query.teamMembers.findFirst({
    where: (t, { eq }) => eq(t.id, parsed.data.id),
  });
  if (!member) return failed("That team member no longer exists.");
  const store = await cookies();
  store.set(ACTOR_COOKIE, encodeURIComponent(member.name), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidateAdmin();
  return done(`Notes will be signed by ${member.name}.`, member.id);
}
