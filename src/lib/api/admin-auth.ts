import { auth } from "@clerk/nextjs/server";
import { unauthorizedError } from "./errors";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

/**
 * Verify the current user is the admin. Returns userId if admin.
 * Use in API routes: const userId = await requireAdmin();
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();

  if (!userId || userId !== ADMIN_USER_ID) {
    throw new Error("Unauthorized");
  }

  return userId;
}

/**
 * Check if a userId is the admin. For use in Server Components.
 */
export function isAdmin(userId: string | null): boolean {
  return !!userId && userId === ADMIN_USER_ID;
}

/**
 * Return 401 response for unauthorized admin API requests.
 */
export function adminUnauthorized() {
  return unauthorizedError("Not authorized");
}
