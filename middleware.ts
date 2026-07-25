import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define routes that should be protected
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/collection(.*)',
    '/settings(.*)',
    '/api/tone-match(.*)', // Protect API endpoints
    '/api/subscription(.*)',
])

// Stripe webhook must not be protected
const isPublicApiRoute = createRouteMatcher([
    '/api/stripe/webhook',
])

export default clerkMiddleware(async (auth, req) => {
    if (isPublicApiRoute(req)) return
    if (!isProtectedRoute(req)) return

    const { userId, redirectToSignIn } = await auth()
    if (userId) return

    // auth.protect() answers signed-out requests with a 404, so tapping
    // "Collection" while logged out looked like a broken link. Pages now go to
    // sign-in and come back afterwards; API callers get a JSON 401.
    if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return redirectToSignIn({ returnBackUrl: req.url })
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
