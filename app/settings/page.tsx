import { auth } from "@clerk/nextjs/server";
import { getUserSubscription } from "@/lib/subscription";
import { SettingsContent } from "@/components/SettingsContent";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const subscription = await getUserSubscription(userId);

    return <SettingsContent subscription={subscription} />;
}
