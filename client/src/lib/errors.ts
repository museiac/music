/**
 * Turns a raw HTTP status + backend message into something safe to show a
 * user. The backend sometimes returns technical text (a stringified Zod
 * issue array from registerSchema.parse, a Prisma error, etc.) — those are
 * replaced with a generic message instead of being shown as-is.
 */
export function toDisplayMessage(
  status: number,
  backendMessage?: string | null
): string {
  if (backendMessage && !looksLikeRawTechnicalError(backendMessage)) {
    return backendMessage;
  }

  switch (status) {
    case 400:
      return "Please check your input and try again.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You do not have permission to do that.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 409:
      return "That already exists.";
    case 429:
      return "Too many attempts. Please wait a moment and try again.";
    case 500:
      return "Something went wrong. Please try again.";
    case 0:
      return "Unable to reach the server. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function looksLikeRawTechnicalError(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  return (
    trimmed.startsWith("[") ||
    trimmed.startsWith("{") ||
    trimmed.includes("PrismaClient") ||
    trimmed.includes("\n") ||
    trimmed.length > 200
  );
}
