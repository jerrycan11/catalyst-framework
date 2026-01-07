import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Catalyst',
  description: 'Privacy Policy for the Catalyst Framework - how we collect, use, and protect your data in compliance with Australian Privacy Principles.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <nav className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4" aria-label="Privacy page navigation">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <span className="text-xl" role="img" aria-label="Catalyst logo">⚗️</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Catalyst</span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Back to home
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="relative pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" aria-hidden="true" />
            
            <div className="relative">
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-slate-400 mb-4">Last updated: January 7, 2026</p>
              
              {/* APP Compliance Notice */}
              <div className="mb-8 p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <p className="text-sm text-violet-300">
                  This Privacy Policy complies with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth) 
                  and the Privacy Amendment (Notifiable Data Breaches) Act 2017.
                </p>
              </div>

              <div className="prose prose-invert prose-violet max-w-none space-y-8">
                {/* Section 1: Introduction */}
                <section aria-labelledby="section-intro">
                  <h2 id="section-intro" className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Catalyst (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy in accordance with the 
                    Australian Privacy Principles (APPs). This Privacy Policy explains how we collect, use, disclose, 
                    and safeguard your personal information when you use our framework and related services.
                  </p>
                </section>

                {/* Section 2: APP 2 - Anonymity */}
                <section aria-labelledby="section-anonymity">
                  <h2 id="section-anonymity" className="text-2xl font-bold text-white mb-4">2. Anonymity and Pseudonymity (APP 2)</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Where lawful and practicable, you have the option to deal with us anonymously or using a pseudonym. 
                    For example, you may browse our documentation without providing personal information. However, some 
                    services (such as account creation) require identification for us to provide the service.
                  </p>
                </section>

                {/* Section 3: Collection - APP 3 & 5 */}
                <section aria-labelledby="section-collection">
                  <h2 id="section-collection" className="text-2xl font-bold text-white mb-4">3. Information We Collect (APP 3 & 5)</h2>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    We only collect personal information that is reasonably necessary for our functions. We may collect:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                    <li><strong>Identity information:</strong> Name, email address when you register</li>
                    <li><strong>Contact information:</strong> Email for support requests</li>
                    <li><strong>Technical information:</strong> IP address, browser type, device information</li>
                    <li><strong>Usage information:</strong> Pages visited, features used, time spent</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-white mt-6 mb-2">Purpose of Collection</h3>
                  <p className="text-slate-300 leading-relaxed mb-4">We collect this information to:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Provide and maintain our services</li>
                    <li>Improve and personalize your experience</li>
                    <li>Send updates and service communications</li>
                    <li>Respond to inquiries and provide support</li>
                    <li>Analyze usage patterns for improvement</li>
                    <li>Detect and prevent security issues</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-white mt-6 mb-2">Consequences of Not Providing Information</h3>
                  <p className="text-slate-300 leading-relaxed">
                    If you choose not to provide certain personal information, we may not be able to:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                    <li>Create an account for you</li>
                    <li>Provide personalized support</li>
                    <li>Send you important service updates</li>
                  </ul>
                </section>

                {/* Section 4: Use and Disclosure - APP 6 */}
                <section aria-labelledby="section-use">
                  <h2 id="section-use" className="text-2xl font-bold text-white mb-4">4. Use and Disclosure of Personal Information (APP 6)</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    We will only use or disclose your personal information for the primary purpose for which it was collected, 
                    or for a secondary purpose that you would reasonably expect, or with your consent.
                  </p>
                  <p className="text-slate-300 leading-relaxed mb-4">We may disclose to:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Service providers who assist in our operations (under confidentiality agreements)</li>
                    <li>Law enforcement or government agencies when required by law</li>
                    <li>Professional advisors (lawyers, accountants) under professional duties</li>
                  </ul>
                </section>

                {/* Section 5: Direct Marketing - APP 7 */}
                <section aria-labelledby="section-marketing">
                  <h2 id="section-marketing" className="text-2xl font-bold text-white mb-4">5. Direct Marketing (APP 7)</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    With your consent, we may send you marketing communications about our products and services. 
                    You can opt out at any time by:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Clicking the unsubscribe link in any marketing email</li>
                    <li>Contacting us at{' '}
                      <a href="mailto:privacy@catalyst.dev" className="text-violet-400 hover:text-violet-300">
                        privacy@catalyst.dev
                      </a>
                    </li>
                    <li>Updating your preferences in your account settings</li>
                  </ul>
                  <p className="text-slate-300 leading-relaxed mt-4">
                    We will action your request within a reasonable timeframe, typically within 5 business days.
                  </p>
                </section>

                {/* Section 6: Cross-Border Disclosure - APP 8 */}
                <section aria-labelledby="section-overseas">
                  <h2 id="section-overseas" className="text-2xl font-bold text-white mb-4">6. Cross-Border Disclosure (APP 8)</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    We may disclose your personal information to overseas recipients in the following countries:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-300 mb-4">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 font-semibold text-white">Country</th>
                          <th className="text-left py-2 font-semibold text-white">Recipient</th>
                          <th className="text-left py-2 font-semibold text-white">Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/10">
                          <td className="py-2">United States</td>
                          <td className="py-2">Cloud service providers (AWS)</td>
                          <td className="py-2">Data hosting and processing</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-2">United States</td>
                          <td className="py-2">Email service providers</td>
                          <td className="py-2">Sending transactional emails</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-2">European Union</td>
                          <td className="py-2">Analytics providers</td>
                          <td className="py-2">Website analytics (if consented)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    We take reasonable steps to ensure overseas recipients handle your information in accordance with 
                    the APPs through contractual arrangements and due diligence.
                  </p>
                </section>

                {/* Section 7: Data Security - APP 11 */}
                <section aria-labelledby="section-security">
                  <h2 id="section-security" className="text-2xl font-bold text-white mb-4">7. Data Security (APP 11)</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    We take reasonable steps to protect your personal information through:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Encryption of data in transit (TLS/HTTPS) and at rest</li>
                    <li>Access controls and authentication requirements</li>
                    <li>Regular security assessments and monitoring</li>
                    <li>Staff training on privacy and security</li>
                    <li>ISO 27001 aligned security practices</li>
                  </ul>
                  <p className="text-slate-300 leading-relaxed mt-4">
                    We will destroy or de-identify personal information when it is no longer needed for the purposes 
                    for which it was collected, unless we are required to retain it by law.
                  </p>
                </section>

                {/* Section 8: Data Breach Notification */}
                <section aria-labelledby="section-breach">
                  <h2 id="section-breach" className="text-2xl font-bold text-white mb-4">8. Notifiable Data Breaches</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    In accordance with the Privacy Amendment (Notifiable Data Breaches) Act 2017, if we experience 
                    an eligible data breach that is likely to result in serious harm to affected individuals, we will:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Notify the Office of the Australian Information Commissioner (OAIC)</li>
                    <li>Notify affected individuals as soon as practicable</li>
                    <li>Provide information about the breach and recommended steps</li>
                    <li>Take steps to contain and remediate the breach</li>
                  </ul>
                </section>

                {/* Section 9: Access - APP 12 */}
                <section aria-labelledby="section-access">
                  <h2 id="section-access" className="text-2xl font-bold text-white mb-4">9. Access to Your Information (APP 12)</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    You have the right to request access to the personal information we hold about you. To make a request:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Email us at{' '}
                      <a href="mailto:privacy@catalyst.dev" className="text-violet-400 hover:text-violet-300">
                        privacy@catalyst.dev
                      </a>
                    </li>
                    <li>Use the data export feature in your account settings</li>
                  </ul>
                  <p className="text-slate-300 leading-relaxed mt-4">
                    We will respond to your request within 30 days. There is no fee for making a request, but we may 
                    charge a reasonable fee for providing access if your request requires substantial resources.
                  </p>
                </section>

                {/* Section 10: Correction - APP 13 */}
                <section aria-labelledby="section-correction">
                  <h2 id="section-correction" className="text-2xl font-bold text-white mb-4">10. Correction of Information (APP 13)</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    You have the right to request correction of your personal information if it is inaccurate, 
                    out-of-date, incomplete, irrelevant, or misleading. You can:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Update your information directly in your account settings</li>
                    <li>Contact us at{' '}
                      <a href="mailto:privacy@catalyst.dev" className="text-violet-400 hover:text-violet-300">
                        privacy@catalyst.dev
                      </a>
                    </li>
                  </ul>
                  <p className="text-slate-300 leading-relaxed mt-4">
                    We will respond to correction requests within 30 days and notify you if we refuse to correct 
                    your information (with reasons).
                  </p>
                </section>

                {/* Section 11: Cookies */}
                <section aria-labelledby="section-cookies">
                  <h2 id="section-cookies" className="text-2xl font-bold text-white mb-4">11. Cookies and Tracking Technologies</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    We use cookies and similar technologies to enhance your experience. Our cookie categories include:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li><strong>Strictly Necessary:</strong> Essential for website function (always active)</li>
                    <li><strong>Analytics:</strong> Help us understand usage patterns (with consent)</li>
                    <li><strong>Marketing:</strong> Deliver relevant advertisements (with consent)</li>
                    <li><strong>Preferences:</strong> Remember your settings (with consent)</li>
                  </ul>
                  <p className="text-slate-300 leading-relaxed mt-4">
                    You can manage cookie preferences through our cookie consent banner or your browser settings.
                  </p>
                </section>

                {/* Section 12: Complaints */}
                <section aria-labelledby="section-complaints">
                  <h2 id="section-complaints" className="text-2xl font-bold text-white mb-4">12. Making a Complaint</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    If you believe we have breached the APPs or mishandled your personal information, you can:
                  </p>
                  <ol className="list-decimal list-inside text-slate-300 space-y-2">
                    <li>Contact our Privacy Officer at{' '}
                      <a href="mailto:privacy@catalyst.dev" className="text-violet-400 hover:text-violet-300">
                        privacy@catalyst.dev
                      </a>
                    </li>
                    <li>We will investigate and respond within 30 days</li>
                    <li>If unsatisfied, you may lodge a complaint with the OAIC at{' '}
                      <a 
                        href="https://www.oaic.gov.au/privacy/privacy-complaints" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300"
                      >
                        www.oaic.gov.au
                      </a>
                    </li>
                  </ol>
                </section>

                {/* Section 13: Contact */}
                <section aria-labelledby="section-contact">
                  <h2 id="section-contact" className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    For privacy-related inquiries or to exercise your rights:
                  </p>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-slate-300">
                      <strong className="text-white">Privacy Officer</strong><br />
                      Email:{' '}
                      <a href="mailto:privacy@catalyst.dev" className="text-violet-400 hover:text-violet-300">
                        privacy@catalyst.dev
                      </a><br />
                      Postal: [Your Business Address]
                    </p>
                  </div>
                </section>

                {/* Section 14: Changes */}
                <section aria-labelledby="section-changes">
                  <h2 id="section-changes" className="text-2xl font-bold text-white mb-4">14. Changes to This Policy</h2>
                  <p className="text-slate-300 leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of significant changes 
                    by posting the new policy on our website and, where appropriate, by email. We encourage you to 
                    review this page periodically.
                  </p>
                </section>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
