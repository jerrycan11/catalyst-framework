# Australian Privacy Principles (APP) Compliance Guidelines

**Version:** 1.0  
**Last Updated:** January 7, 2026  
**Legislation:** Privacy Act 1988 (Cth), Privacy Amendment (Notifiable Data Breaches) Act 2017

---

## Overview

The Australian Privacy Principles (APPs) are contained in Schedule 1 of the Privacy Act 1988 and regulate the handling of personal information by Australian Government agencies and organisations with an annual turnover of more than $3 million (and some smaller organisations in specific circumstances).

This document provides guidelines for ensuring APP compliance in the Catalyst framework.

---

## The 13 Australian Privacy Principles

### APP 1: Open and Transparent Management of Personal Information

**Requirement:** Have a clearly expressed and up-to-date privacy policy about the management of personal information.

#### Implementation Requirements

```tsx
// Privacy Policy page must include:
const privacyPolicyRequiredSections = [
  'Types of personal information collected',
  'How personal information is collected and held',
  'Purposes for collecting personal information',
  'How individuals can access their information',
  'How individuals can seek correction of information',
  'How to complain about privacy breaches',
  'Whether information is disclosed overseas',
  'Countries where information may be disclosed',
];

// Required footer links on all pages
<footer>
  <a href="/privacy">Privacy Policy</a>
  <a href="/terms">Terms of Service</a>
  <a href="/contact">Contact Us</a>
</footer>
```

#### Privacy Policy Accessibility
- Must be freely available
- Must be in clear, simple language
- Should be available in accessible formats
- Must be updated when practices change

---

### APP 2: Anonymity and Pseudonymity

**Requirement:** Give individuals the option to deal with you anonymously or using a pseudonym where practicable.

#### Implementation Guidelines

```tsx
// Guest checkout option (where lawful and practicable)
function CheckoutPage() {
  return (
    <div>
      <h2>Checkout Options</h2>
      <Button onClick={guestCheckout}>
        Continue as Guest
      </Button>
      <Button onClick={login}>
        Sign In
      </Button>
    </div>
  );
}

// Preference for anonymous feedback
<form>
  <legend>Feedback Form</legend>
  <fieldset>
    <input type="radio" id="anon" name="identity" value="anonymous" />
    <label htmlFor="anon">Submit anonymously</label>
    
    <input type="radio" id="identified" name="identity" value="identified" />
    <label htmlFor="identified">Include my contact details</label>
  </fieldset>
</form>
```

#### Exceptions
Anonymity is NOT required when:
- Required by law to identify individuals
- Impracticable to deal with anonymous individuals
- Explicitly prohibited by another law

---

### APP 3: Collection of Solicited Personal Information

**Requirement:** Only collect personal information that is reasonably necessary for your functions or activities.

#### Data Minimization Principles

```tsx
// ❌ WRONG - Collecting unnecessary information
const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  // Not necessary for account creation:
  dateOfBirth: z.date(),
  phoneNumber: z.string(),
  address: z.string(),
  occupation: z.string(),
});

// ✅ CORRECT - Minimal collection
const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  // Optional with clear purpose
  name: z.string().optional(), // For personalization
});
```

#### Sensitive Information Requirements

Sensitive information requires CONSENT and includes:
- Racial or ethnic origin
- Political opinions
- Religious beliefs
- Sexual orientation
- Health information
- Genetic/biometric information
- Criminal record

```tsx
// Consent for sensitive information
<div>
  <h3>Health Information</h3>
  <p>We need to collect health information to provide you with appropriate services.</p>
  <label>
    <input 
      type="checkbox" 
      required
      aria-describedby="consent-explanation"
    />
    I consent to the collection of my health information for the purposes described
  </label>
  <p id="consent-explanation" className="text-sm">
    You can withdraw consent at any time by contacting privacy@catalyst.dev
  </p>
</div>
```

---

### APP 4: Dealing with Unsolicited Personal Information

**Requirement:** If you receive personal information you did not request, determine if you could have collected it under APP 3. If not, destroy or de-identify it as soon as practicable.

#### Implementation

```typescript
// Unsolicited information handling
async function handleContactFormSubmission(data: ContactFormData) {
  // Check for unsolicited sensitive information
  const sensitivePatterns = [
    /\b(health|medical|diagnosis)\b/i,
    /\b(political|religious|racial)\b/i,
    // Add other patterns
  ];
  
  const containsSensitiveInfo = sensitivePatterns.some(
    pattern => pattern.test(data.message)
  );
  
  if (containsSensitiveInfo) {
    // Log for compliance review
    await logUnsolicitedSensitiveInfo({
      timestamp: new Date(),
      type: 'unsolicited_sensitive',
      action: 'flagged_for_review',
    });
  }
}
```

---

### APP 5: Notification of Collection of Personal Information

**Requirement:** At or before collection, notify individuals about the collection.

#### Collection Notice Requirements

```tsx
// Collection notice component
function CollectionNotice({ 
  purpose,
  consequences,
  thirdParties = [],
  overseas = false,
  overseasCountries = []
}: CollectionNoticeProps) {
  return (
    <div role="region" aria-label="Privacy Collection Notice">
      <h3>Privacy Collection Notice</h3>
      
      <section>
        <h4>What we collect and why</h4>
        <p>{purpose}</p>
      </section>
      
      <section>
        <h4>What happens if you don't provide this information</h4>
        <p>{consequences}</p>
      </section>
      
      {thirdParties.length > 0 && (
        <section>
          <h4>Who we share with</h4>
          <ul>
            {thirdParties.map(party => (
              <li key={party}>{party}</li>
            ))}
          </ul>
        </section>
      )}
      
      {overseas && (
        <section>
          <h4>Overseas disclosure</h4>
          <p>
            Your information may be disclosed to entities in: 
            {overseasCountries.join(', ')}
          </p>
        </section>
      )}
      
      <p>
        For more information, see our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </div>
  );
}

// Usage
<CollectionNotice
  purpose="We collect your email to create your account and send you important updates."
  consequences="Without your email, we cannot create your account."
  thirdParties={['Email service provider (SendGrid)']}
  overseas={true}
  overseasCountries={['United States']}
/>
```

---

### APP 6: Use or Disclosure of Personal Information

**Requirement:** Only use or disclose personal information for the purpose for which it was collected (primary purpose), unless an exception applies.

#### Permitted Uses/Disclosures

```typescript
// Types of permitted disclosures
type DisclosureType =
  | 'primary_purpose'        // Original purpose of collection
  | 'related_secondary'      // Secondary purpose individual would expect
  | 'consent'                // Individual consented
  | 'legal_requirement'      // Required by law
  | 'enforcement'            // Law enforcement purposes
  | 'serious_threat'         // Health/safety threat
  | 'research'               // Impracticable to get consent, stats/research

// Disclosure audit log
interface DisclosureLog {
  timestamp: Date;
  dataSubjectId: string;
  disclosedTo: string;
  purpose: string;
  disclosureType: DisclosureType;
  legalBasis: string;
}

async function logDisclosure(disclosure: DisclosureLog) {
  await db.insert(disclosureLogs).values(disclosure);
}
```

---

### APP 7: Direct Marketing

**Requirement:** Do not use personal information for direct marketing unless specific conditions are met.

#### Opt-Out Implementation

```tsx
// Every marketing email must include unsubscribe
const marketingEmailFooter = `
  <p>You received this email because you subscribed to our newsletter.</p>
  <p>
    <a href="{{{unsubscribe_url}}}">Unsubscribe</a> | 
    <a href="{{{preferences_url}}}">Manage Preferences</a>
  </p>
`;

// User preferences UI
function MarketingPreferences() {
  const [preferences, setPreferences] = useState({
    newsletter: true,
    productUpdates: true,
    promotions: false,
    partnerOffers: false,
  });

  return (
    <form onSubmit={updatePreferences}>
      <fieldset>
        <legend>Email Preferences</legend>
        
        <label>
          <input 
            type="checkbox"
            checked={preferences.newsletter}
            onChange={e => setPreferences(p => ({...p, newsletter: e.target.checked}))}
          />
          Newsletter (monthly updates)
        </label>
        
        <label>
          <input 
            type="checkbox"
            checked={preferences.productUpdates}
            onChange={e => setPreferences(p => ({...p, productUpdates: e.target.checked}))}
          />
          Product updates (new features, releases)
        </label>
        
        {/* ... more options */}
        
        <Button type="button" onClick={unsubscribeFromAll}>
          Unsubscribe from all marketing emails
        </Button>
      </fieldset>
    </form>
  );
}
```

---

### APP 8: Cross-Border Disclosure of Personal Information

**Requirement:** Before disclosing personal information overseas, take reasonable steps to ensure the overseas recipient complies with the APPs.

#### Implementation Requirements

```typescript
// Cross-border disclosure register
interface CrossBorderDisclosure {
  country: string;
  recipient: string;
  purpose: string;
  dataTypes: string[];
  safeguards: string[];
}

const crossBorderDisclosures: CrossBorderDisclosure[] = [
  {
    country: 'United States',
    recipient: 'Amazon Web Services (AWS)',
    purpose: 'Cloud hosting and data storage',
    dataTypes: ['Account data', 'Usage data'],
    safeguards: [
      'AWS DPA Agreement',
      'Standard Contractual Clauses',
      'ISO 27001 certified'
    ],
  },
  {
    country: 'United States',
    recipient: 'SendGrid (Twilio)',
    purpose: 'Email delivery',
    dataTypes: ['Email addresses', 'Names'],
    safeguards: [
      'Data Processing Agreement',
      'SOC 2 Type II certified'
    ],
  },
];

// Display in privacy policy
function CrossBorderDisclosureSection() {
  return (
    <section>
      <h2>Overseas Disclosure</h2>
      <p>We may disclose your personal information to the following overseas recipients:</p>
      <table>
        <thead>
          <tr>
            <th>Country</th>
            <th>Recipient</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          {crossBorderDisclosures.map((d, i) => (
            <tr key={i}>
              <td>{d.country}</td>
              <td>{d.recipient}</td>
              <td>{d.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

---

### APP 9: Adoption, Use or Disclosure of Government Identifiers

**Requirement:** Do not adopt, use, or disclose government identifiers (TFN, Medicare, Passport) unless required by law.

```typescript
// Government identifier handling
const governmentIdentifiers = [
  'taxFileNumber',
  'medicareNumber',
  'passportNumber',
  'driversLicense',
  'centrelinkCRN',
];

// Never store unnecessarily
async function handleIdentityVerification(docType: string, docNumber: string) {
  // Verify with government service
  const verified = await verifyWithGovernment(docType, docNumber);
  
  // Store only verification status, NOT the identifier
  await db.update(users)
    .set({
      identityVerified: true,
      identityVerifiedAt: new Date(),
      // Do NOT store: identifierType, identifierNumber
    })
    .where(eq(users.id, userId));
  
  return verified;
}
```

---

### APP 10: Quality of Personal Information

**Requirement:** Take reasonable steps to ensure personal information collected is accurate, up-to-date, complete and relevant.

```tsx
// Data quality features
function ProfilePage() {
  return (
    <div>
      <h1>Your Profile</h1>
      
      {/* Last updated notice */}
      <p className="text-sm text-muted">
        Last updated: {lastUpdated.toLocaleDateString()}
      </p>
      
      {/* Prompt for review if old */}
      {isOlderThan6Months && (
        <Alert>
          <AlertTitle>Review your information</AlertTitle>
          <AlertDescription>
            It's been a while since you updated your profile. 
            Please review your information to ensure it's still accurate.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={updateProfile}>
        {/* Profile fields */}
      </form>
    </div>
  );
}
```

---

### APP 11: Security of Personal Information

**Requirement:** Take reasonable steps to protect personal information from misuse, interference, loss, unauthorized access, modification, or disclosure.

See: **ISO 27001 Guidelines** for detailed security requirements.

```typescript
// Data at rest encryption
const encryptedFields = [
  'phoneNumber',
  'dateOfBirth',
  'address',
];

// Data destruction
async function destroyUserData(userId: string) {
  // Soft delete with anonymization
  await db.update(users)
    .set({
      email: `deleted_${userId}@anonymized.local`,
      name: 'Deleted User',
      phoneNumber: null,
      dateOfBirth: null,
      deletedAt: new Date(),
    })
    .where(eq(users.id, userId));
  
  // Audit log
  await logDataDeletion({
    userId,
    deletedAt: new Date(),
    reason: 'user_request',
  });
}
```

---

### APP 12: Access to Personal Information

**Requirement:** Give individuals access to their personal information upon request.

```tsx
// Data access request handler
async function handleDataAccessRequest(userId: string) {
  // Collect all user data
  const userData = {
    profile: await getProfile(userId),
    orders: await getOrders(userId),
    preferences: await getPreferences(userId),
    activityLog: await getActivityLog(userId),
    // Include all stored data
  };
  
  // Generate downloadable report
  return generateDataExportPDF(userData);
}

// UI Component
function DataAccessSection() {
  return (
    <section>
      <h2>Your Data</h2>
      <p>
        You have the right to access the personal information we hold about you.
      </p>
      <Button onClick={requestDataExport}>
        Download My Data
      </Button>
      <p className="text-sm">
        We will provide your data within 30 days of your request. 
        For complex requests, we may need up to 60 days.
      </p>
    </section>
  );
}
```

---

### APP 13: Correction of Personal Information

**Requirement:** Take reasonable steps to correct personal information to ensure it is accurate, up-to-date, complete, relevant and not misleading.

```tsx
// Self-service correction
function CorrectionRequest() {
  return (
    <form onSubmit={submitCorrection}>
      <h2>Request Data Correction</h2>
      <p>
        If any information we hold about you is incorrect, 
        you can update it directly in your profile settings or 
        submit a correction request below.
      </p>
      
      <label>
        What information needs correction?
        <select name="field">
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="other">Other</option>
        </select>
      </label>
      
      <label>
        What should the correct information be?
        <textarea name="correction" required />
      </label>
      
      <Button type="submit">Submit Correction Request</Button>
    </form>
  );
}
```

---

## Notifiable Data Breaches (NDB) Scheme

Under the Privacy Amendment (Notifiable Data Breaches) Act 2017, you MUST notify the OAIC and affected individuals if there is an eligible data breach.

### Requirements

```typescript
// Breach assessment criteria
interface DataBreach {
  description: string;
  dataTypesAffected: string[];
  numberOfRecordsAffected: number;
  discoveredAt: Date;
  containedAt?: Date;
}

function assessBreachSeverity(breach: DataBreach): 'low' | 'medium' | 'high' {
  // High if:
  // - Sensitive information involved
  // - Large number of records
  // - Identity fraud risk
  // - Financial harm risk
  
  const sensitiveData = ['healthInfo', 'financialInfo', 'governmentId'];
  const hasSensitive = breach.dataTypesAffected.some(t => sensitiveData.includes(t));
  
  if (hasSensitive || breach.numberOfRecordsAffected > 1000) {
    return 'high';
  }
  
  return 'medium';
}

// Notification template
const breachNotificationTemplate = {
  toOAIC: {
    deadline: '30 days (or as soon as practicable)',
    includes: [
      'Entity details',
      'Description of breach',
      'Types of information involved',
      'Recommendations for affected individuals',
    ],
  },
  toIndividuals: {
    deadline: 'As soon as practicable',
    includes: [
      'Description of breach',
      'Types of information involved',
      'Recommended steps to take',
      'Contact information for support',
    ],
  },
};
```

---

## Privacy Policy Template Sections

Your privacy policy MUST include:

1. **Identity and Contact Details** of the organization
2. **Types of Personal Information** collected
3. **How Information is Collected** (direct, third parties, cookies)
4. **Purposes** of collection, use, and disclosure
5. **Third Party Disclosure** categories
6. **Overseas Disclosure** countries and recipients
7. **Access and Correction** procedures
8. **Complaint Process** and OAIC contact information
9. **Cookie Policy** and tracking technologies
10. **Data Retention** periods
11. **Security Measures** overview
12. **Updates to Policy** and notification process

---

## Compliance Checklist

### Collection
- [ ] Collection notice displayed at point of collection
- [ ] Only necessary information collected
- [ ] Consent obtained for sensitive information
- [ ] Option for anonymity where practicable

### Use & Disclosure
- [ ] Information used only for stated purposes
- [ ] Marketing opt-out easy to find and use
- [ ] Cross-border disclosures documented
- [ ] Third-party agreements in place

### Security & Quality
- [ ] Encryption for sensitive data
- [ ] Access controls implemented
- [ ] Regular data quality reviews
- [ ] Secure destruction procedures

### Individual Rights
- [ ] Access request process documented
- [ ] Correction process documented
- [ ] Complaints process documented
- [ ] Data export functionality available

### Governance
- [ ] Privacy policy publicly available
- [ ] Privacy policy regularly updated
- [ ] Breach response plan documented
- [ ] Staff privacy training completed
