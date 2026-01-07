# Master Compliance Checklist

**Version:** 1.0  
**Last Updated:** January 7, 2026

---

## Quick Reference

This checklist combines WCAG 2.2 AA, Australian Privacy Principles (APP), and ISO 27001 requirements for a comprehensive compliance review.

---

## Pre-Development Review

### Project Setup
- [ ] Review WCAG 2.2 Guidelines (`docs/compliance/WCAG_2_2_GUIDELINES.md`)
- [ ] Review Australian Privacy Principles (`docs/compliance/AUSTRALIAN_PRIVACY_PRINCIPLES.md`)
- [ ] Review ISO 27001 Guidelines (`docs/compliance/ISO_27001_GUIDELINES.md`)

---

## WCAG 2.2 AA Checklist

### Perceivable (Can users perceive the content?)

#### Text Alternatives
- [ ] All images have appropriate alt text
- [ ] Decorative images have `alt=""` and `role="presentation"`
- [ ] Icon buttons have `aria-label` or visually hidden text
- [ ] Complex images have long descriptions

#### Time-Based Media
- [ ] Videos have captions
- [ ] Audio has transcripts
- [ ] Auto-playing media can be paused

#### Adaptable
- [ ] Content uses proper heading hierarchy (one h1 per page)
- [ ] Lists use `<ul>`, `<ol>`, or `<dl>` elements
- [ ] Data tables have proper headers with `scope`
- [ ] Form fields have associated labels
- [ ] Landmark regions used (`<main>`, `<nav>`, `<aside>`)

#### Distinguishable
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Color contrast ratio ≥ 3:1 for large text
- [ ] Color is not the only means of conveying information
- [ ] Text can be resized to 200% without loss
- [ ] Content is responsive and works on zoom

### Operable (Can users operate the interface?)

#### Keyboard Accessible
- [ ] Skip link is present and functional
- [ ] All functionality available via keyboard
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] No keyboard traps

#### Enough Time
- [ ] Session timeouts have warnings
- [ ] Timeouts can be extended
- [ ] Auto-updating content can be paused

#### Seizures
- [ ] No content flashes more than 3 times per second
- [ ] `prefers-reduced-motion` is respected

#### Navigable
- [ ] Page has descriptive title
- [ ] Link text is descriptive
- [ ] Multiple ways to navigate (nav, search, sitemap)
- [ ] Focus visible on all interactive elements

#### Input Modalities (WCAG 2.2)
- [ ] Touch targets are at least 24x24px (44x44px recommended)
- [ ] Drag operations have keyboard alternatives
- [ ] Consistent help location across pages

### Understandable (Can users understand content?)

#### Readable
- [ ] Page language is declared (`<html lang="en">`)
- [ ] Language changes are marked in content

#### Predictable
- [ ] Navigation is consistent across pages
- [ ] Components behave consistently
- [ ] No unexpected context changes on focus/input

#### Input Assistance
- [ ] Form errors are identified and described
- [ ] Error messages suggest corrections
- [ ] Labels and instructions are provided
- [ ] Required fields are marked
- [ ] Authentication doesn't require cognitive tests (WCAG 2.2)
- [ ] Redundant entry is avoided (WCAG 2.2)

### Robust (Is content compatible with tools?)

#### Compatible
- [ ] HTML is valid (no duplicate IDs)
- [ ] ARIA is used correctly
- [ ] Status messages use appropriate roles
- [ ] Name, role, value can be programmatically determined

---

## Australian Privacy Principles Checklist

### APP 1: Transparency
- [ ] Privacy policy is publicly available
- [ ] Privacy policy is in clear, simple language
- [ ] Privacy policy covers all required sections
- [ ] Privacy policy is up to date

### APP 2: Anonymity
- [ ] Option for anonymity/pseudonymity where practicable
- [ ] Justification documented where anonymity not possible

### APP 3: Collection
- [ ] Only necessary information is collected
- [ ] Collection methods are lawful and fair
- [ ] Sensitive information has explicit consent
- [ ] Collection is directly from the individual (or exception applies)

### APP 4: Unsolicited Information
- [ ] Process for handling unsolicited personal information
- [ ] Destruction/de-identification procedures documented

### APP 5: Notification
- [ ] Collection notices displayed at point of collection
- [ ] Purpose of collection is clearly stated
- [ ] Consequences of not providing information are explained
- [ ] Third party disclosures are identified

### APP 6: Use and Disclosure
- [ ] Use limited to primary purpose
- [ ] Secondary use only with consent or exception
- [ ] Disclosure register maintained

### APP 7: Direct Marketing
- [ ] Easy opt-out mechanism provided
- [ ] Opt-out requests honored promptly
- [ ] Marketing preferences can be managed

### APP 8: Cross-Border Disclosure
- [ ] Overseas recipients documented
- [ ] Appropriate safeguards in place
- [ ] Countries disclosed in privacy policy

### APP 9: Government Identifiers
- [ ] Government IDs only used when required by law
- [ ] Government IDs not stored unnecessarily

### APP 10: Data Quality
- [ ] Mechanisms for keeping data accurate
- [ ] Regular data quality reviews conducted
- [ ] Users can update their information

### APP 11: Data Security
- [ ] Encryption for sensitive data
- [ ] Access controls implemented
- [ ] Secure destruction procedures
- [ ] Data breach response plan in place

### APP 12: Access to Information
- [ ] Process for access requests documented
- [ ] Access requests fulfilled within 30 days
- [ ] Data export functionality available

### APP 13: Correction
- [ ] Correction request process documented
- [ ] Self-service correction where possible
- [ ] Correction requests fulfilled promptly

### Notifiable Data Breaches
- [ ] Breach response plan documented
- [ ] OAIC notification process defined
- [ ] Individual notification templates ready

---

## ISO 27001 Checklist

### Security Headers
- [ ] HSTS header configured (Strict-Transport-Security)
- [ ] X-Frame-Options set to SAMEORIGIN
- [ ] X-Content-Type-Options set to nosniff
- [ ] X-XSS-Protection enabled
- [ ] Content-Security-Policy configured
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured

### Authentication
- [ ] Strong password policy enforced
- [ ] Account lockout implemented
- [ ] MFA option available
- [ ] Secure session management
- [ ] Session timeout configured
- [ ] Session rotation on auth state change

### Input Validation
- [ ] All user input validated server-side
- [ ] Parameterized queries used (no SQL injection)
- [ ] Output encoding implemented (no XSS)
- [ ] File upload validation
- [ ] Rate limiting implemented

### Cookies
- [ ] Session cookies are HttpOnly
- [ ] Session cookies are Secure
- [ ] SameSite attribute set
- [ ] Appropriate cookie expiration
- [ ] Cookie consent mechanism in place

### Error Handling
- [ ] Errors don't expose system details
- [ ] Errors are logged securely
- [ ] Users see friendly error messages
- [ ] Error logging includes request context

### Logging
- [ ] Security events are logged
- [ ] Sensitive data is not logged
- [ ] Log retention policy defined
- [ ] Alerting for critical events

### Data Protection
- [ ] Encryption at rest for sensitive data
- [ ] Encryption in transit (TLS 1.2+)
- [ ] Key management procedures
- [ ] Data classification scheme

### Development Security
- [ ] Code review required for all changes
- [ ] Dependency scanning in CI/CD
- [ ] No hard-coded secrets
- [ ] Security testing included

---

## Per-Feature Checklist

Use this for each new feature/page:

### UI/UX
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] Color contrast passes
- [ ] Focus indicators visible
- [ ] Touch targets adequate
- [ ] Reduced motion respected

### Forms
- [ ] Labels associated with inputs
- [ ] Required fields marked
- [ ] Error messages descriptive
- [ ] Validation on client and server
- [ ] Autocomplete attributes set

### Privacy
- [ ] Collection notice if collecting data
- [ ] Only necessary data collected
- [ ] Purpose clearly stated
- [ ] Consent obtained where required

### Security
- [ ] Input validated
- [ ] Output encoded
- [ ] Authentication checked
- [ ] Authorization enforced
- [ ] Logging for security events

---

## Automated Testing Commands

```bash
# Build check
npm run build

# TypeScript check
npm run lint

# Run tests
npm run test

# Accessibility audit (using axe-core)
npx @axe-core/cli http://localhost:3000

# Security audit
npm audit
```

---

## Review Sign-Off

| Compliance Area | Reviewer | Date | Status |
|-----------------|----------|------|--------|
| WCAG 2.2 AA | | | ☐ Pass ☐ Fail |
| Australian Privacy | | | ☐ Pass ☐ Fail |
| ISO 27001 | | | ☐ Pass ☐ Fail |

**Notes:**

---

**Next Review Date:** _________________________
