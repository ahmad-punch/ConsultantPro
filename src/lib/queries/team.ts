import "server-only";

import { asc, desc, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { cases, teamMembers } from "@/lib/db/schema";

export async function listTeam() {
  return db
    .select({
      member: teamMembers,
      openCases: sql<number>`(select count(*)::int from ${cases} where ${cases.caseManagerId} = ${teamMembers.id} and ${cases.stage} not in ('closed', 'declined'))`,
    })
    .from(teamMembers)
    .orderBy(desc(teamMembers.active), asc(teamMembers.name));
}
