import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Tonelify Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white pt-20 pb-16">
            <div className="container max-w-3xl mx-auto px-4 md:px-6">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
                <p className="text-sm text-slate-400 mb-10">Last updated: February 10, 2026</p>

                <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to Tonelify (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring
                            the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and
                            safeguard your information when you use our website and services at tonelify.com (the &quot;Service&quot;).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
                        <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">2.1 Personal Information</h3>
                        <p>When you create an account or use our Service, we may collect:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Name and email address (via Clerk authentication)</li>
                            <li>Profile picture (if provided through your authentication provider)</li>
                            <li>Payment information (processed securely through Stripe — we do not store card details)</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">2.2 Usage Data</h3>
                        <p>We automatically collect certain information when you use the Service:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Guitar and amp equipment configurations you save</li>
                            <li>Tone match queries and results</li>
                            <li>Device and browser information</li>
                            <li>IP address and approximate location</li>
                            <li>Usage patterns and feature interactions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
                        <p>We use the collected information to:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Provide, maintain, and improve the Service</li>
                            <li>Process your tone matching requests using AI</li>
                            <li>Save your equipment profiles and tone history</li>
                            <li>Process payments and manage subscriptions</li>
                            <li>Send transactional emails (account verification, password resets)</li>
                            <li>Analyze usage patterns to improve our algorithms</li>
                            <li>Prevent fraud and ensure security</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Sharing and Disclosure</h2>
                        <p>We do not sell your personal information. We may share data with:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li><strong>Service Providers:</strong> Clerk (authentication), Stripe (payments), Supabase (database), OpenAI (AI processing), Vercel (hosting)</li>
                            <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your data, including encryption in transit (TLS/SSL),
                            secure authentication via Clerk, and encrypted database storage via Supabase. However, no method of electronic
                            transmission or storage is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Data Retention</h2>
                        <p>
                            We retain your personal information for as long as your account is active or as needed to provide the Service.
                            You may request deletion of your account and associated data at any time by contacting us at{" "}
                            <a href="mailto:contact@tonelify.com" className="text-blue-600 hover:underline">contact@tonelify.com</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">7. Cookies and Tracking</h2>
                        <p>
                            We use essential cookies for authentication and session management through Clerk. We may also use analytics
                            cookies to understand how users interact with the Service. You can control cookie settings through your browser preferences.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">8. Your Rights</h2>
                        <p>Depending on your jurisdiction, you may have the right to:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Access, correct, or delete your personal information</li>
                            <li>Object to or restrict processing of your data</li>
                            <li>Data portability (receive your data in a structured format)</li>
                            <li>Withdraw consent at any time</li>
                            <li>Lodge a complaint with a data protection authority</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">9. Children&apos;s Privacy</h2>
                        <p>
                            The Service is not intended for children under 13 years of age. We do not knowingly collect personal
                            information from children under 13. If we discover that a child under 13 has provided us with personal
                            information, we will delete it promptly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">10. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
                            the updated policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service
                            after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:{" "}
                            <a href="mailto:contact@tonelify.com" className="text-blue-600 hover:underline">contact@tonelify.com</a>
                        </p>
                    </section>

                </div>

                <div className="mt-12 pt-8 border-t border-slate-100">
                    <Link href="/" className="text-sm text-blue-600 hover:underline font-medium">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
