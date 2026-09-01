const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/**
 * The backend owns the Google OAuth flow end to end — this is a plain link,
 * not a client-side OAuth implementation. It navigates the whole page to
 * the backend's Google auth endpoint, which is expected to redirect back
 * into the app once the backend establishes a session.
 *
 * The backend does not register a Google route yet (no passport/OAuth
 * dependency exists in backend/package.json), so this currently 404s —
 * left wired up to the conventional path so it "just works" the moment the
 * backend adds it.
 */
export function GoogleButton() {
  return (
    <div>
      <a
        href={`${API_BASE_URL}/auth/google`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <GoogleIcon />
        Continue with Google
      </a>
      <p className="mt-1.5 text-center text-xs text-gray-400">
        Requires Google sign-in to be enabled on the backend.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 01-2.39 3.6v3h3.86c2.26-2.08 3.58-5.15 3.58-8.63z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.86-3c-1.07.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0012 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.3a7.2 7.2 0 010-4.6v-3.1H1.29a12 12 0 000 10.8z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 001.29 6.6l3.98 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
