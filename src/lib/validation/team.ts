import { z } from "zod";

import { requiredText, teamRoleSchema } from "./common";
import { idField } from "./fields";

export const teamMemberSchema = z.object({
  name: requiredText("Name", 200),
  role: teamRoleSchema,
  email: z.email("Enter a valid email address."),
});

export const teamMemberIdSchema = z.object({ id: idField() });
