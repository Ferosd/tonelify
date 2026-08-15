import { auth } from "@clerk/nextjs/server";

/**
 * Who is allowed to read the feedback inbox.
 *
 * A comma separated list of Clerk user ids in ADMIN_USER_IDS. Ids rather than
 * email addresses: an email is a string anyone can put in a form, but a Clerk
 * user id is what the session actually proves.
 *
 * Empty by default, and an empty list denies everyone. A missing environment
 * variable has to lock the door rather than open it, or a deploy that forgets
 * to set it publishes every message the form has ever received.
 */
function adminIds(): string[] {
    return (process.env.ADMIN_USER_IDS || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
}

export function isAdminId(userId: string | null | undefined): boolean {
    if (!userId) return false;
    const ids = adminIds();
    return ids.length > 0 && ids.includes(userId);
}

/** The current caller's id if they are an admin, otherwise null. */
export async function requireAdmin(): Promise<string | null> {
    const { userId } = await auth();
    return isAdminId(userId) ? userId : null;
}
