"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useTransition,
  type ComponentProps,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/validation/fields";

export type FormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

type Ctx = { errors: Record<string, string[] | undefined>; pending: boolean };
const FormCtx = createContext<Ctx>({ errors: {}, pending: false });
export const useActionFormState = () => useContext(FormCtx);

/** Provided by FormDialog so a successful form closes its dialog. */
export const DialogCloseContext = createContext<(() => void) | null>(null);

/**
 * A form bound to a server action. Shows a toast for the result, exposes
 * field errors to the field components, and optionally resets, closes its
 * dialog, or navigates (`redirectTo` may contain "{id}") on success.
 *
 * The result is handled right after the awaited call rather than in an
 * effect: the action revalidates the page, which can unmount this form in
 * the same commit (e.g. "Convert to case" replaces the form), and an effect
 * would then never run. Submitting via onSubmit also stops React resetting
 * the inputs when validation fails.
 */
export function ActionForm({
  action,
  children,
  className,
  redirectTo,
  resetOnSuccess,
  silent,
}: {
  action: FormAction;
  children: ReactNode;
  className?: string;
  redirectTo?: string;
  resetOnSuccess?: boolean;
  silent?: boolean;
}) {
  const [state, setState] = useState<FormState>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const closeDialog = useContext(DialogCloseContext);

  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <FormCtx.Provider value={{ errors, pending }}>
      <form
        ref={formRef}
        className={className}
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          startTransition(async () => {
            let result: FormState;
            try {
              result = await action(null, data);
            } catch (error) {
              // Let Next handle redirect() (e.g. an expired session).
              if (isRedirectError(error)) throw error;
              toast.error("Something went wrong. Check you are online and try again.");
              return;
            }
            setState(result);
            if (!result) return;
            if (result.ok) {
              if (!silent) toast.success(result.message ?? "Saved.");
              if (resetOnSuccess) form.reset();
              closeDialog?.();
              if (redirectTo) router.push(redirectTo.replace("{id}", result.data?.id ?? ""));
            } else {
              toast.error(result.error);
            }
          });
        }}
      >
        {children}
      </form>
    </FormCtx.Provider>
  );
}

function isRedirectError(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

export function SubmitButton({
  children,
  confirm,
  icon,
  ...props
}: Omit<ComponentProps<typeof Button>, "type"> & { confirm?: string; icon?: ReactNode }) {
  const { pending } = useActionFormState();
  return (
    <Button
      type="submit"
      disabled={pending || props.disabled}
      aria-busy={pending || undefined}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
      {...props}
    >
      {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : icon}
      {children}
    </Button>
  );
}

/** One-click action: hidden fields plus a submit button. */
export function ActionButton({
  action,
  fields,
  children,
  confirm,
  icon,
  variant = "outline",
  size = "sm",
  className,
  redirectTo,
}: {
  action: FormAction;
  fields: Record<string, string>;
  children: ReactNode;
  confirm?: string;
  icon?: ReactNode;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
  redirectTo?: string;
}) {
  return (
    <ActionForm action={action} className="inline-flex" redirectTo={redirectTo}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton variant={variant} size={size} confirm={confirm} icon={icon} className={className}>
        {children}
      </SubmitButton>
    </ActionForm>
  );
}
