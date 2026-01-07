'use client';

import * as React from 'react';
import Link from 'next/link';

/**
 * CookieConsent Component
 * 
 * Australian Privacy Principles Compliance:
 * - APP 1: Open and transparent management of personal information
 * - APP 5: Notification of collection of personal information
 * 
 * Also compliant with:
 * - WCAG 2.2 AA accessibility requirements
 * - ISO 27001 data protection requirements
 */

type ConsentType = 'necessary' | 'analytics' | 'marketing' | 'preferences';

interface CookieConsentProps {
  /**
   * Called when consent is given or updated
   */
  onConsent?: (consent: Record<ConsentType, boolean>) => void;
  /**
   * Privacy policy URL
   */
  privacyPolicyUrl?: string;
  /**
   * Cookie policy URL (if separate from privacy policy)
   */
  cookiePolicyUrl?: string;
}

const CONSENT_STORAGE_KEY = 'catalyst_cookie_consent';

export function CookieConsent({
  onConsent,
  privacyPolicyUrl = '/privacy',
  cookiePolicyUrl,
}: CookieConsentProps) {
  const [showBanner, setShowBanner] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);
  const [consent, setConsent] = React.useState<Record<ConsentType, boolean>>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Check for existing consent on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConsent(prev => ({ ...prev, ...parsed }));
      } catch {
        // Invalid stored consent, show banner
        setShowBanner(true);
      }
    } else {
      // No consent given yet
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: Record<ConsentType, boolean>) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newConsent));
    setShowBanner(false);
    onConsent?.(newConsent);
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setConsent(allAccepted);
    saveConsent(allAccepted);
  };

  const acceptNecessaryOnly = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setConsent(necessaryOnly);
    saveConsent(necessaryOnly);
  };

  const saveCustomConsent = () => {
    saveConsent(consent);
  };

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
        <div className="p-6">
          {/* Main Banner */}
          <div className={showDetails ? 'hidden' : ''}>
            <h2 
              id="cookie-consent-title" 
              className="text-lg font-semibold text-white mb-2"
            >
              We value your privacy
            </h2>
            <p 
              id="cookie-consent-description" 
              className="text-slate-300 text-sm mb-4"
            >
              We use cookies to enhance your browsing experience, serve personalized content, 
              and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
              {' '}
              <Link 
                href={cookiePolicyUrl || privacyPolicyUrl} 
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Learn more about our cookie policy
              </Link>
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={acceptNecessaryOnly}
                className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Necessary Only
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Customize
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Accept All
              </button>
            </div>
          </div>

          {/* Detailed Preferences */}
          <div className={showDetails ? '' : 'hidden'}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Cookie Preferences
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-white transition-colors p-2"
                aria-label="Back to summary"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                <input
                  type="checkbox"
                  id="cookie-necessary"
                  checked={consent.necessary}
                  disabled
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-violet-500"
                  aria-describedby="necessary-desc"
                />
                <div className="flex-1">
                  <label htmlFor="cookie-necessary" className="font-medium text-white block">
                    Strictly Necessary
                    <span className="ml-2 text-xs text-slate-400">(Required)</span>
                  </label>
                  <p id="necessary-desc" className="text-sm text-slate-400 mt-1">
                    Essential for the website to function. These cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                <input
                  type="checkbox"
                  id="cookie-analytics"
                  checked={consent.analytics}
                  onChange={(e) => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-violet-500 focus:ring-violet-500"
                  aria-describedby="analytics-desc"
                />
                <div className="flex-1">
                  <label htmlFor="cookie-analytics" className="font-medium text-white block">
                    Analytics
                  </label>
                  <p id="analytics-desc" className="text-sm text-slate-400 mt-1">
                    Help us understand how visitors use our website to improve user experience.
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                <input
                  type="checkbox"
                  id="cookie-marketing"
                  checked={consent.marketing}
                  onChange={(e) => setConsent(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-violet-500 focus:ring-violet-500"
                  aria-describedby="marketing-desc"
                />
                <div className="flex-1">
                  <label htmlFor="cookie-marketing" className="font-medium text-white block">
                    Marketing
                  </label>
                  <p id="marketing-desc" className="text-sm text-slate-400 mt-1">
                    Used to deliver relevant advertisements and track campaign performance.
                  </p>
                </div>
              </div>

              {/* Preference Cookies */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                <input
                  type="checkbox"
                  id="cookie-preferences"
                  checked={consent.preferences}
                  onChange={(e) => setConsent(prev => ({ ...prev, preferences: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-violet-500 focus:ring-violet-500"
                  aria-describedby="preferences-desc"
                />
                <div className="flex-1">
                  <label htmlFor="cookie-preferences" className="font-medium text-white block">
                    Preferences
                  </label>
                  <p id="preferences-desc" className="text-sm text-slate-400 mt-1">
                    Remember your settings and preferences for a better experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={acceptNecessaryOnly}
                className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Reject All
              </button>
              <button
                onClick={saveCustomConsent}
                className="px-6 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Save Preferences
              </button>
            </div>
          </div>

          {/* Privacy Links */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-sm">
            <Link 
              href={privacyPolicyUrl} 
              className="text-slate-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            {cookiePolicyUrl && (
              <Link 
                href={cookiePolicyUrl} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
            )}
            <Link 
              href="/terms" 
              className="text-slate-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check cookie consent status
 * 
 * @example
 * ```tsx
 * const { hasConsent, consent } = useCookieConsent();
 * 
 * if (hasConsent('analytics')) {
 *   // Initialize analytics
 * }
 * ```
 */
export function useCookieConsent() {
  const [consent, setConsent] = React.useState<Record<ConsentType, boolean>>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  React.useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      try {
        setConsent(prev => ({ ...prev, ...JSON.parse(stored) }));
      } catch {
        // Invalid consent
      }
    }
  }, []);

  const hasConsent = (type: ConsentType): boolean => consent[type];

  const updateConsent = (newConsent: Partial<Record<ConsentType, boolean>>) => {
    const updated = { ...consent, ...newConsent };
    setConsent(updated);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated));
  };

  return { consent, hasConsent, updateConsent };
}
