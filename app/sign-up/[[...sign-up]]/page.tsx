import { SignUp } from "@clerk/nextjs";

// Same story as sign-in: v6 dropped NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL, so a new
// account used to be dropped on the landing page with no sign of being signed in.
const AFTER_SIGN_UP = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/tone-match";

export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#08080C]">
            <SignUp
                path="/sign-up"
                signInUrl="/sign-in"
                fallbackRedirectUrl={AFTER_SIGN_UP}
            />
        </div>
    );
}
