import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Catalyst',
  description: 'Terms of Service for the Catalyst Framework - rules and guidelines for using our services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <span className="text-xl">⚗️</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Catalyst</span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
            
            <div className="relative">
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-slate-400 mb-8">Last updated: January 7, 2026</p>

              <div className="prose prose-invert prose-violet max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                  <p className="text-slate-300 leading-relaxed">
                    By accessing or using the Catalyst framework and related services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Catalyst is an open-source enterprise Next.js framework that provides tools, libraries, and services for building web applications. Our services include but are not limited to:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
                    <li>The Catalyst framework and CLI tools</li>
                    <li>Documentation and tutorials</li>
                    <li>Community forums and support</li>
                    <li>Premium features and services (if applicable)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">3. License</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Catalyst is released under the MIT License. You are free to use, modify, and distribute the framework in accordance with the license terms. Commercial use is permitted.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">4. User Responsibilities</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">When using our services, you agree to:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Not use the services for any illegal purposes</li>
                    <li>Not attempt to disrupt or compromise our systems</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
                  <p className="text-slate-300 leading-relaxed">
                    The Catalyst name, logo, and branding are trademarks of the Catalyst project. While the framework code is open-source, you may not use our trademarks in a way that suggests endorsement without permission.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimer of Warranties</h2>
                  <p className="text-slate-300 leading-relaxed">
                    THE SERVICES ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                  <p className="text-slate-300 leading-relaxed">
                    IN NO EVENT SHALL CATALYST BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICES.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
                  <p className="text-slate-300 leading-relaxed">
                    We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes through our website or email. Continued use of the services after changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">9. Contact</h2>
                  <p className="text-slate-300 leading-relaxed">
                    For questions about these Terms of Service, please contact us at{' '}
                    <a href="mailto:legal@catalyst.dev" className="text-violet-400 hover:text-violet-300">
                      legal@catalyst.dev
                    </a>
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
