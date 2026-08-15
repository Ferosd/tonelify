import { z } from "zod";

/** The five buckets on the form, in the order they are shown. */
export const FEEDBACK_KINDS = [
    { value: "bug", label: "Bug report", hint: "Something is broken or wrong" },
    { value: "feature", label: "Feature request", hint: "Something you wish existed" },
    { value: "improvement", label: "Improvement", hint: "Something that could work better" },
    { value: "praise", label: "Praise", hint: "Something you like" },
    { value: "other", label: "Other", hint: "Anything else" },
] as const;

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]["value"];

/**
 * The floor is what keeps the inbox readable. "doesnt work" is not a bug
 * report anyone can act on, and asking for a sentence costs an honest reporter
 * nothing while filtering out most of the noise.
 */
export const FEEDBACK_MIN = 10;
export const FEEDBACK_MAX = 5000;

export const feedbackSchema = z.object({
    kind: z.enum(["bug", "feature", "improvement", "praise", "other"]),
    message: z
        .string()
        .trim()
        .min(FEEDBACK_MIN, `Please write at least ${FEEDBACK_MIN} characters so we can act on it`)
        .max(FEEDBACK_MAX, `Please keep it under ${FEEDBACK_MAX} characters`),
    // Optional: someone reporting a bug anonymously should not be forced to
    // identify themselves, and a signed-in sender is already identified.
    email: z.string().trim().email("Please enter a valid email address").optional().or(z.literal("")),
    // Where they were when they hit send, which is most of a bug report
    pagePath: z.string().trim().max(300).optional().or(z.literal("")),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;
