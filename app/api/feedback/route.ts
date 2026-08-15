import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { checkRateLimit, callerIp } from "@/lib/rate-limit";
import { feedbackSchema } from "@/lib/validations/feedback";

// The form is open to signed-out visitors, so this counter is the only thing
// between it and a scripted flood.
const MESSAGES_PER_HOUR = 5;

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        const { allowed } = await checkRateLimit(
            "feedback",
            userId || callerIp(request),
            MESSAGES_PER_HOUR,
            60 * 60
        );
        if (!allowed) {
            return NextResponse.json(
                { error: "That's a lot of feedback. Please try again in an hour." },
                { status: 429 }
            );
        }

        const result = feedbackSchema.safeParse(await request.json());
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }
        const { kind, message, gearName, email, pagePath } = result.data;

        // Gear requests carry the make and model as its own field on the form.
        // It goes into the stored message as a labelled first line so the inbox
        // shows it without the row needing a column only one kind ever uses.
        const body = kind === "gear" && gearName ? `Gear: ${gearName}\n\n${message}` : message;

        // feedback.user_id references profiles(id); signed-out visitors store
        // null there, which the foreign key allows.
        const rowUserId = userId && (await ensureProfile(userId)) ? userId : null;

        // A signed-in sender's own address beats a typed one: it is verified,
        // and it means a reply reaches them even if they left the field blank.
        const user = userId ? await currentUser() : null;
        const senderEmail =
            user?.emailAddresses?.[0]?.emailAddress || (email ? email : null);

        // The table is the inbox. There is no mail step on purpose: a mail
        // provider is one more key to keep alive and one more thing that can
        // silently stop delivering, and the row is the thing that actually
        // matters. It is read at /admin/feedback.
        const { data, error } = await getSupabaseAdmin()
            .from("feedback")
            .insert({
                user_id: rowUserId,
                kind,
                message: body,
                email: senderEmail,
                page_path: pagePath || null,
            })
            .select("id")
            .single();

        if (error) {
            console.error("feedback insert failed:", error);
            return NextResponse.json({ error: "That didn't send. Please try again." }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            id: data.id,
            message: "Thanks. That went straight to the person who builds this.",
        });
    } catch (error) {
        console.error("Feedback error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
