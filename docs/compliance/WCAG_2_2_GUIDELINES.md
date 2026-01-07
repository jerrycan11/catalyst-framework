# WCAG 2.2 AA Compliance Guidelines for Catalyst Framework

**Version:** 1.0  
**Last Updated:** January 7, 2026  
**Standard:** Web Content Accessibility Guidelines (WCAG) 2.2 Level AA

---

## Overview

This document provides detailed guidelines for ensuring WCAG 2.2 Level AA compliance in the Catalyst framework. All developers (human and AI) MUST follow these guidelines when creating or modifying UI components, pages, or user-facing features.

---

## 1. PERCEIVABLE

Content must be presentable to users in ways they can perceive.

### 1.1 Text Alternatives (Level A)

**Requirement:** All non-text content must have text alternatives.

```tsx
// ❌ WRONG - No alt text
<img src="/hero.png" />

// ✅ CORRECT - Meaningful alt text
<img src="/hero.png" alt="Developer collaborating on code in modern office" />

// ✅ CORRECT - Decorative images use empty alt
<img src="/decorative-pattern.png" alt="" role="presentation" />

// ✅ CORRECT - Icons with text labels
<button aria-label="Close dialog">
  <X className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Close</span>
</button>
```

### 1.2 Time-based Media (Level A & AA)

**Requirement:** Provide alternatives for time-based media.

- Video content MUST have captions
- Audio content MUST have transcripts
- Video descriptions for important visual information

### 1.3 Adaptable Content (Level A & AA)

**Requirement:** Content can be presented in different ways without losing information.

```tsx
// Use semantic HTML structure
<main>
  <article>
    <header>
      <h1>Page Title</h1>
    </header>
    <section aria-labelledby="intro-heading">
      <h2 id="intro-heading">Introduction</h2>
      <p>Content...</p>
    </section>
  </article>
</main>

// Form labels must be properly associated
<div>
  <label htmlFor="email">Email Address</label>
  <input 
    id="email" 
    type="email" 
    aria-required="true"
    aria-describedby="email-hint"
  />
  <span id="email-hint" className="text-sm text-muted">
    We'll never share your email
  </span>
</div>
```

### 1.4 Distinguishable Content (Level AA)

**Requirement:** Make it easy for users to see and hear content.

#### Color Contrast Requirements

| Element Type | Minimum Ratio | Tool to Check |
|-------------|---------------|---------------|
| Normal text (<18pt) | 4.5:1 | Browser DevTools |
| Large text (≥18pt or ≥14pt bold) | 3:1 | WebAIM Contrast Checker |
| UI Components & Graphics | 3:1 | Colour Contrast Analyser |

```css
/* Catalyst Color Tokens with WCAG-compliant contrast */
:root {
  /* These combinations meet 4.5:1 ratio */
  --text-on-dark: #ffffff;       /* Use on backgrounds darker than #595959 */
  --text-on-light: #1f2937;      /* Use on backgrounds lighter than #a0a0a0 */
  
  /* High contrast mode additions */
  --focus-ring: 2px solid #4f46e5; /* Visible focus indicator */
}
```

#### Text Spacing Requirements (WCAG 2.2 - 1.4.12)

Users must be able to override text spacing:
- Line height minimum: 1.5 times font size
- Paragraph spacing: 2 times font size
- Letter spacing: 0.12 times font size
- Word spacing: 0.16 times font size

```css
/* Ensure content doesn't break with text spacing overrides */
.content-container {
  overflow-wrap: break-word;
  word-wrap: break-word;
}
```

---

## 2. OPERABLE

User interface components must be operable.

### 2.1 Keyboard Accessible (Level A)

**Requirement:** All functionality must be available via keyboard.

```tsx
// Skip Link Component (REQUIRED on all pages)
export function SkipLink() {
  return (
    <a 
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md"
    >
      Skip to main content
    </a>
  );
}

// Usage in layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <nav>...</nav>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
```

#### Keyboard Navigation Requirements

| Key | Action |
|-----|--------|
| Tab | Move to next focusable element |
| Shift + Tab | Move to previous focusable element |
| Enter | Activate buttons, links |
| Space | Toggle checkboxes, activate buttons |
| Arrow keys | Navigate within components (menus, tabs) |
| Escape | Close dialogs, menus |

### 2.2 Enough Time (Level A & AA)

**Requirement:** Provide users enough time to read and use content.

```tsx
// Session timeout warning (minimum 20 seconds before timeout)
function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false);
  
  return (
    <Dialog open={showWarning}>
      <DialogContent role="alertdialog" aria-describedby="timeout-desc">
        <DialogTitle>Session Expiring</DialogTitle>
        <p id="timeout-desc">
          Your session will expire in 2 minutes. Would you like to continue?
        </p>
        <Button onClick={extendSession}>Continue Session</Button>
      </DialogContent>
    </Dialog>
  );
}
```

### 2.3 Seizures and Physical Reactions (Level A)

**Requirement:** Do not design content that causes seizures.

- No content flashes more than 3 times per second
- Provide pause controls for auto-playing content
- Respect `prefers-reduced-motion`

```css
/* REQUIRED: Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 2.4 Navigable (Level A & AA)

**Requirement:** Help users navigate and find content.

#### Page Titles
Every page MUST have a unique, descriptive title:

```tsx
// Next.js Metadata
export const metadata: Metadata = {
  title: 'Login | Catalyst', // Format: "Page Name | Site Name"
  description: 'Sign in to your Catalyst account',
};
```

#### Focus Order
Focus order MUST be logical and intuitive:

```tsx
// Modal focus trap example
function Modal({ isOpen, onClose, children }) {
  const firstFocusRef = useRef(null);
  const lastFocusRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      firstFocusRef.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

### 2.5 Input Modalities (Level A & AA) - WCAG 2.2 NEW

**Requirement:** Accommodate various input methods.

#### Target Size (WCAG 2.2 - 2.5.8 Level AA)
Minimum target size: **24x24 CSS pixels**  
Recommended target size: **44x44 CSS pixels**

```css
/* Minimum touch targets */
.btn,
button,
[role="button"],
a[href] {
  min-height: 44px;
  min-width: 44px;
}

/* Inline links exception - ensure adequate spacing */
p a {
  padding: 2px 4px;
  margin: -2px -4px;
}
```

#### Dragging Movements (WCAG 2.2 - 2.5.7 Level AA)
Provide alternatives to dragging:

```tsx
// Sortable list with keyboard alternative
function SortableItem({ item, onMoveUp, onMoveDown }) {
  return (
    <div>
      <span>{item.name}</span>
      {/* Drag handle for mouse users */}
      <button aria-label={`Drag ${item.name}`} className="drag-handle">
        ⠿
      </button>
      {/* Keyboard alternatives */}
      <button onClick={onMoveUp} aria-label={`Move ${item.name} up`}>▲</button>
      <button onClick={onMoveDown} aria-label={`Move ${item.name} down`}>▼</button>
    </div>
  );
}
```

---

## 3. UNDERSTANDABLE

Information and UI operation must be understandable.

### 3.1 Readable (Level A & AA)

**Requirement:** Make text content readable and understandable.

```tsx
// Page language declaration
<html lang="en">

// Language changes within page
<p>
  The French phrase <span lang="fr">c'est la vie</span> means "that's life."
</p>
```

### 3.2 Predictable (Level A & AA)

**Requirement:** Web pages appear and operate predictably.

```tsx
// ❌ WRONG - Auto-submits on focus
<input onFocus={handleSubmit} />

// ✅ CORRECT - Explicit action required
<form onSubmit={handleSubmit}>
  <input />
  <button type="submit">Submit</button>
</form>
```

### 3.3 Input Assistance (Level A & AA)

**Requirement:** Help users avoid and correct mistakes.

```tsx
// Comprehensive form validation
function FormField({ label, error, hint, required, ...props }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  
  return (
    <div>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
        {required && <span className="sr-only">(required)</span>}
      </label>
      
      <input
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`.trim() || undefined}
        {...props}
      />
      
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

#### Error Suggestion (WCAG 2.2 - 3.3.8 Level A) NEW
For fields with known formats, suggest corrections:

```tsx
// Email error with suggestion
{emailError && (
  <p role="alert">
    Invalid email format. Please enter an email like: name@example.com
  </p>
)}
```

#### Accessible Authentication (WCAG 2.2 - 3.3.8 Level AA) NEW
Authentication MUST NOT rely on cognitive function tests:

```tsx
// ✅ CORRECT - Allow password managers
<input 
  type="password" 
  autoComplete="current-password"
  // Don't block paste
/>

// ✅ CORRECT - Offer authentication alternatives
<div>
  <Button>Sign in with Password</Button>
  <Button>Sign in with Passkey</Button>
  <Button>Sign in with Magic Link</Button>
</div>
```

---

## 4. ROBUST

Content must be robust enough to be interpreted by a wide variety of user agents.

### 4.1 Compatible (Level A & AA)

**Requirement:** Maximize compatibility with current and future tools.

```tsx
// Valid HTML with proper ARIA
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/">Home</a></li>
    <li><a href="/about" aria-current="page">About</a></li>
  </ul>
</nav>

// Status messages announced by screen readers
<div role="status" aria-live="polite" aria-atomic="true">
  {successMessage && <p>{successMessage}</p>}
</div>

// Error messages that need immediate attention
<div role="alert" aria-live="assertive">
  {criticalError && <p>{criticalError}</p>}
</div>
```

---

## WCAG 2.2 New Success Criteria Summary

| Criterion | Level | Summary |
|-----------|-------|---------|
| 2.4.11 Focus Not Obscured (Minimum) | AA | Focused element not fully hidden |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | Focused element not partially hidden |
| 2.4.13 Focus Appearance | AAA | Enhanced focus indicator requirements |
| 2.5.7 Dragging Movements | AA | Alternatives to drag operations |
| 2.5.8 Target Size (Minimum) | AA | 24x24px minimum targets |
| 3.2.6 Consistent Help | A | Help mechanisms consistently located |
| 3.3.7 Redundant Entry | A | Don't re-ask for info already entered |
| 3.3.8 Accessible Authentication (Minimum) | AA | No cognitive tests for auth |
| 3.3.9 Accessible Authentication (Enhanced) | AAA | No object/image recognition for auth |

---

## Testing Checklist

### Automated Testing
- [ ] Run axe-core or similar tool
- [ ] Validate HTML with W3C validator
- [ ] Check with eslint-plugin-jsx-a11y

### Manual Testing
- [ ] Navigate entire page with keyboard only
- [ ] Test with screen reader (VoiceOver, NVDA, JAWS)
- [ ] Check at 200% zoom
- [ ] Check with reduced motion enabled
- [ ] Verify color contrast with DevTools
- [ ] Test form error states

### Screen Reader Testing Commands (VoiceOver)
- **Start/Stop:** Command + F5
- **Navigate:** Control + Option + Arrow Keys
- **Read All:** Control + Option + A
- **Rotor:** Control + Option + U

---

## Component Requirements Quick Reference

| Component | Requirements |
|-----------|-------------|
| Button | `aria-label` for icon-only, visible focus, 44px min |
| Link | Descriptive text, underlined or distinct style |
| Input | Associated label, error messages, aria-describedby |
| Dialog | Focus trap, aria-modal, Escape to close |
| Menu | Arrow key navigation, Escape to close |
| Tab | Arrow key navigation, aria-selected |
| Table | Headers, scope attributes, caption |
| Image | Meaningful alt text or empty alt for decorative |
| Icon | `aria-hidden="true"` + sr-only label or aria-label |
