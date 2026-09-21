import Script from "next/script";

/**
 * Paths pa.js must not report, as the comma-separated regular expressions the
 * script expects. The dashboard is staff and member workspace, not the public
 * site — counting it would mix internal work into the visitor figures.
 *
 * The exclusion lives in the script rather than in what we render because the
 * App Router navigates on the client: once pa.js is on the page it keeps
 * reporting history changes, so unmounting this component on /dashboard would
 * not stop anything. pa.js applies this list per page view instead.
 */
const EXCLUDED_PATHS = "^\/dashboard";

/**
 * Pirsch Analytics — anonymous visitor counting. It stores nothing in the
 * visitor's browser, so it needs no consent banner (Brevo and HelloBar, from
 * the same snippet collection, do — they are deliberately left out).
 *
 * No code, no script: local development sets no `PIRSCH_CODE` and so sends
 * nothing, rather than leaning on pa.js's own localhost guard. Each Vercel
 * environment carries its own code, which is what keeps staging figures out of
 * production's.
 */
export function PirschAnalytics() {
  const code = process.env.PIRSCH_CODE;
  if (!code) return null;

  return (
    <Script
      id="pianjs"
      src="https://api.pirsch.io/pa.js"
      strategy="afterInteractive"
      data-code={code}
      data-exclude={EXCLUDED_PATHS}
    />
  );
}
