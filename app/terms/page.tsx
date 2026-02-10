import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Tonelify Terms of Service — rules and guidelines for using our platform.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white pt-20 pb-16">
            <div className="container max-w-3xl mx-auto px-4 md:px-6">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
                <p className="text-sm text-slate-400 mb-10">Last updated: February 10, 2026</p>

                <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Agreement to Terms</h2>
                        <p>
                            By accessing or using Tonelify (&quot;the Service&quot;), you agree to be bound by these Terms of Service
                            (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service. The Service is
                            operated by Tonelify (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
                        <p>
                            Tonelify is an AI-powered guitar tone matching platform that helps musicians adapt legendary guitar tones
                            to their specific equipment. The Service includes tone analysis, gear-specific settings recommendations,
                            equipment profile management, and related features.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. Account Registration</h2>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>You must create an account to access certain features of the Service.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You must provide accurate and complete information during registration.</li>
                            <li>You must be at least 13 years of age to create an account.</li>
                            <li>You are responsible for all activity that occurs under your account.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. Subscriptions and Payments</h2>
                        <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">4.1 Free Tier</h3>
                        <p>
                            The free tier provides limited access to the Service, including a restricted number of tone matches per month.
                        </p>

                        <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">4.2 Paid Subscriptions</h3>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Paid subscriptions are billed on a monthly or annual basis, as selected at the time of purchase.</li>
                            <li>All subscriptions include a 7-day free trial for new users.</li>
                            <li>Payment is processed securely through Stripe. We do not store your payment card details.</li>
                            <li>Subscriptions automatically renew unless canceled before the renewal date.</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">4.3 Cancellation and Refunds</h3>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>You may cancel your subscription at any time through your account settings.</li>
                            <li>Cancellation takes effect at the end of the current billing period.</li>
                            <li>All sales are final. No refunds will be issued for partial billing periods.</li>
                            <li>If you cancel during the free trial period, you will not be charged.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Acceptable Use</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>Use the Service for any illegal or unauthorized purpose</li>
                            <li>Attempt to reverse-engineer, decompile, or disassemble the Service</li>
                            <li>Use automated scripts, bots, or scrapers to access the Service</li>
                            <li>Interfere with or disrupt the Service or its infrastructure</li>
                            <li>Share your account credentials with third parties</li>
                            <li>Circumvent any rate limits or usage restrictions</li>
                            <li>Upload malicious code or attempt to compromise the security of the Service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Intellectual Property</h2>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>The Service, including its design, algorithms, content, and branding, is owned by Tonelify and protected by copyright and intellectual property laws.</li>
                            <li>You retain ownership of your equipment configurations and saved data.</li>
                            <li>AI-generated tone settings and recommendations are provided for personal, non-commercial use only.</li>
                            <li>Song titles, artist names, and equipment brand names referenced in the Service are trademarks of their respective owners.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">7. AI-Generated Content Disclaimer</h2>
                        <p>
                            The tone settings and recommendations provided by Tonelify are generated by artificial intelligence and are
                            based on publicly available information. Results are approximate and may vary based on your specific equipment,
                            room acoustics, playing style, and other factors. We do not guarantee exact replication of any specific
                            artist&apos;s tone. The Service is intended as a helpful starting point for tone exploration.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">8. Limitation of Liability</h2>
                        <p>
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, TONELIFY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                            CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT
                            OF OR RELATED TO YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE
                            SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">9. Disclaimer of Warranties</h2>
                        <p>
                            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
                            INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                            NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">10. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account at any time, with or without cause, including for
                            violation of these Terms. Upon termination, your right to use the Service will immediately cease. Sections
                            regarding intellectual property, limitation of liability, and disclaimers will survive termination.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">11. Changes to Terms</h2>
                        <p>
                            We may modify these Terms at any time. We will provide notice of material changes by posting the updated
                            Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after changes
                            constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">12. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict
                            of law principles. Any disputes arising under these Terms shall be resolved through binding arbitration or
                            in the courts of competent jurisdiction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">13. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at:{" "}
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
