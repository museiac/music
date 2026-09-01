import { redirect } from "next/navigation";

/**
 * middleware.ts (matcher includes "/") normally redirects every request to
 * this route before it ever renders. This is a safety-net fallback for the
 * (unlikely) case that middleware doesn't run, e.g. matcher misconfiguration.
 */
export default function HomePage() {
  redirect("/login");
}
