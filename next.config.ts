import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // PGlite ships WASM and data files that must be loaded from node_modules at
  // runtime, not bundled. See docs/LEARNINGS.md.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Markdown read with fs at request time (/admin/project, /admin/help,
  // guides) is not traced automatically, so ship it with every server route.
  // drizzle/ ships too: demo mode (no DATABASE_URL) migrates an in-memory
  // PGlite at startup. Keys are route globs; "/*" matches all routes.
  outputFileTracingIncludes: {
    "/*": ["./docs/**/*", "./content/**/*", "./drizzle/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
