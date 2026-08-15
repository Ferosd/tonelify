import { LandingClient } from "./LandingClient"
import { getReviewSummary } from "@/lib/reviews"
import { isPlanConfigured } from "@/lib/stripe"

/**
 * The landing page needs a server component in front of it purely so the
 * reviews can be read before the HTML is sent. An hour keeps the markup close
 * to the real table without giving up the cached render, and matches /plans so
 * the rating an engine reads on one page agrees with the other.
 */
export const revalidate = 3600

export default async function Home() {
    // A failed read comes back as an empty list, and every review block already
    // has an honest empty state, so the page still renders in full.
    const { reviews } = await getReviewSummary()
    // Stripe price ids are server-only, so whether each tier is on sale has to
    // be resolved here and handed down.
    return (
        <LandingClient
            initialReviews={reviews}
            stageAvailable={isPlanConfigured("stage")}
            playerAvailable={isPlanConfigured("player")}
        />
    )
}
