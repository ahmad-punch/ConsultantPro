import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { HelpMarkdown } from "@/components/admin/help/help-markdown";
import { HelpSheet } from "@/components/admin/help/help-sheet";
import { getHelpSection } from "@/lib/help";

/**
 * Contextual help: a small question-mark icon that opens a side sheet with
 * `docs/help/screens/<topic>.md` (or one section of it). Content is read and
 * rendered on the server; the markdown in the repo is the source of truth.
 *
 *   <HelpButton topic="cases" section="advance-stage" />
 *
 * `topic` is the screen file name; `section` is the kebab-case slug of an H3
 * under "Buttons and actions" or of any H2. Missing docs or sections show a
 * friendly "not written yet" message instead of failing.
 */
export function HelpButton({
  topic,
  section,
  label,
  className,
}: {
  topic: string;
  /** Section slug, or candidates tried in order (first heading found wins). */
  section?: string | string[];
  /** Overrides the accessible name ("Help: <label>"). Defaults to the section heading or the topic. */
  label?: string;
  className?: string;
}) {
  const help = getHelpSection(topic, section);
  const { doc } = help;
  const firstSlug = [section].flat()[0];
  const name = label ?? help.section?.title ?? (firstSlug ? titleCase(firstSlug) : (doc?.title ?? titleCase(topic)));

  if (!doc) {
    return (
      <HelpSheet label={`Help: ${name}`} title={titleCase(topic)} className={className}>
        <Missing>
          Help for this screen is not written yet. Add <code className="font-mono text-xs">docs/help/screens/{topic}.md</code>.
        </Missing>
      </HelpSheet>
    );
  }

  return (
    <HelpSheet
      label={`Help: ${name}`}
      title={doc.title}
      subtitle={help.section ? help.section.title : doc.summary || undefined}
      className={className}
    >
      <div className="space-y-6">
        {help.sectionMissing ? (
          <Missing>
            The help for this part (<code className="font-mono text-xs">{firstSlug}</code>) is not written yet. Add a heading
            with that name to <code className="font-mono text-xs">{help.expectedFile}</code>.
          </Missing>
        ) : null}

        {help.section ? (
          help.section.markdown ? (
            <HelpMarkdown source={help.section.markdown} file={doc.file} compact />
          ) : (
            <Missing>This section has a heading but no text yet.</Missing>
          )
        ) : help.intro ? (
          <div>
            <h3 className="mb-2 text-sm font-semibold">{help.intro.title}</h3>
            <HelpMarkdown source={help.intro.markdown} file={doc.file} compact />
          </div>
        ) : !firstSlug ? (
          <HelpMarkdown source={doc.content} file={doc.file} compact />
        ) : null}

        {help.related?.markdown ? (
          <div className="rounded-lg border bg-muted/40 p-3">
            <h3 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Related</h3>
            <HelpMarkdown source={help.related.markdown} file={doc.file} compact />
          </div>
        ) : null}

        <Link
          href={help.href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Open full help page <ArrowRightIcon className="size-3.5" aria-hidden />
        </Link>
      </div>
    </HelpSheet>
  );
}

function Missing({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">{children}</p>;
}

function titleCase(topic: string): string {
  return topic.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
