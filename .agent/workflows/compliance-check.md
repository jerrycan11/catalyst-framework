---
description: How to verify and maintain WCAG 2.2, Australian Privacy Principles (APP), and ISO 27001 compliance
---

# Compliance Check Workflow

This workflow ensures all code changes meet WCAG 2.2 AA, Australian Privacy Principles (APP), and ISO 27001 requirements.

## Pre-Development Checklist

Before writing any code, review the relevant compliance documentation:

// turbo
1. Read the WCAG 2.2 guidelines: `cat docs/compliance/WCAG_2_2_GUIDELINES.md`

// turbo
2. Read the Australian Privacy Principles: `cat docs/compliance/AUSTRALIAN_PRIVACY_PRINCIPLES.md`

// turbo
3. Read the ISO 27001 guidelines: `cat docs/compliance/ISO_27001_GUIDELINES.md`

4. Review the master compliance checklist: `cat docs/compliance/COMPLIANCE_CHECKLIST.md`

## During Development

### Accessibility (WCAG 2.2 AA)

For every UI component or page, ensure:

1. **Perceivable**
   - All images have meaningful `alt` text
   - Color contrast ratio is at least 4.5:1 for normal text, 3:1 for large text
   - All forms have visible labels
   - Content is readable without CSS

2. **Operable**
   - All functionality is keyboard accessible
   - Skip links are provided for navigation
   - Focus indicators are visible
   - No content flashes more than 3 times per second
   - Touch targets are at least 44x44 CSS pixels

3. **Understandable**
   - Page language is declared (`lang` attribute)
   - Form inputs have clear labels and error messages
   - Error messages are descriptive and suggest corrections
   - Consistent navigation across pages

4. **Robust**
   - Valid HTML (no duplicate IDs, proper nesting)
   - ARIA used correctly when needed
   - Tested with screen readers

### Privacy (Australian Privacy Principles)

For any feature that collects or handles personal information:

1. **Collection Notice**
   - Is the user informed what data is being collected?
   - Is the purpose clearly stated?
   - Can the user access the privacy policy easily?

2. **Consent**
   - Is consent explicit for sensitive information?
   - Can users withdraw consent easily?
   - Is there a cookie consent mechanism?

3. **Cross-Border Disclosure**
   - If data goes overseas, is this disclosed?
   - Are appropriate protections in place?

4. **Data Minimization**
   - Are you only collecting necessary data?
   - Is data anonymized where possible?

### Security (ISO 27001)

For all features:

1. **Input Validation**
   - All user inputs are validated and sanitized
   - Use parameterized queries for databases
   - Validate on both client and server

2. **Authentication & Authorization**
   - Sessions are properly managed
   - Passwords are hashed with strong algorithms
   - principle of least privilege applied

3. **Data Protection**
   - Sensitive data is encrypted at rest and in transit
   - Secure cookies used (HttpOnly, Secure, SameSite)
   - No sensitive data in URLs or logs

4. **Error Handling**
   - Errors don't expose system details
   - All errors are logged securely
   - Users see friendly error messages

## Post-Development Verification

// turbo-all
### Automated Checks

1. Run accessibility linter:
   ```bash
   npx eslint --ext .tsx,.ts src/ --rule "@typescript-eslint/no-unused-vars: warn"
   ```

2. Build the application to verify no breaking changes:
   ```bash
   npm run build
   ```

### Manual Testing Checklist

- [ ] Navigate the entire feature using keyboard only
- [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Check color contrast with browser dev tools
- [ ] Verify all form fields have labels and error states
- [ ] Check reduced motion is respected
- [ ] Verify privacy notices are visible where data is collected
- [ ] Check security headers are present in responses

## Remediation Process

If compliance issues are found:

1. **WCAG Issues**: Fix immediately, document in commit message
2. **APP Issues**: Create a privacy impact assessment, escalate if needed
3. **ISO 27001 Issues**: Document risk, implement fix, verify with security review

## Required Components

When building new features, use these compliance-ready components:

- `<SkipLink />` - For skip navigation
- `<VisuallyHidden />` - For screen-reader only content
- `<Input />` with `aria-describedby` for form fields
- `<Button />` with proper `aria-label` for icon buttons
- `<CookieConsent />` - For cookie consent banner

## Compliance Documentation Location

- WCAG 2.2: `docs/compliance/WCAG_2_2_GUIDELINES.md`
- APP: `docs/compliance/AUSTRALIAN_PRIVACY_PRINCIPLES.md`
- ISO 27001: `docs/compliance/ISO_27001_GUIDELINES.md`
- Checklist: `docs/compliance/COMPLIANCE_CHECKLIST.md`
