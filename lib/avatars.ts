/**
 * Which reviewers have a photo in public/avatars.
 *
 * The list is explicit rather than inferred from the name, for two reasons.
 * A reviewer with no file would otherwise be requested, 404, and fall back
 * after a wasted round trip, once per name on the page. And the pairing itself
 * is a judgement call: the names in the table are handles as often as they are
 * first names, so the face beside one is chosen by hand or not at all.
 *
 * Names that are not here render the initials disc, which is the intended look
 * for most of the table, not a failure state. Anonymous never gets a face.
 *
 * Adding one: crop a square photo, save it as public/avatars/<slug>.jpg where
 * <slug> is avatarSlug(name), and add the slug below.
 */
export const AVATAR_SLUGS = new Set([
    "metalhead88",
    "bluesdad",
    "davie504",
    "james-hetfield-fan",
    "adriene",
    "sarah-j",
]);

export function hasAvatar(slug: string) {
    return AVATAR_SLUGS.has(slug);
}
