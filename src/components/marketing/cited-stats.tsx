import { stats } from "./data/stats";

/** Four cited figures with numbered footnotes and a Sources list. */
export function CitedStats() {
  return (
    <div>
      <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.value} className="border-t-2 border-highlight pt-5">
            <dt className="font-display text-4xl font-medium tracking-tight whitespace-nowrap text-primary sm:text-[2.75rem]">
              {stat.value}
              <sup className="ml-1 align-super font-sans text-sm font-semibold text-highlight">
                <a
                  href={`#source-${i + 1}`}
                  className="rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label={`Source ${i + 1}`}
                >
                  {i + 1}
                </a>
              </sup>
            </dt>
            <dd className="mt-3">
              <p className="text-base leading-relaxed text-foreground/80">{stat.label}</p>
              {stat.note ? <p className="mt-2 text-sm text-muted-foreground">{stat.note}</p> : null}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-12 border-t pt-6">
        <h3 className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">Sources</h3>
        <ol className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {stats.map((stat, i) => (
            <li key={stat.source.url} id={`source-${i + 1}`} className="flex gap-2 scroll-mt-24">
              <span className="font-mono text-xs leading-5 text-highlight">{i + 1}.</span>
              <span>
                {stat.source.name},{" "}
                <a
                  href={stat.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary"
                >
                  {stat.source.title}
                </a>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
