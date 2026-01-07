'use client';

import * as React from 'react';

/**
 * SkipLink Component
 * 
 * WCAG 2.2 Requirement: 2.4.1 Bypass Blocks (Level A)
 * 
 * Provides a mechanism to bypass blocks of content that are repeated on multiple pages.
 * The skip link is visually hidden until focused, then becomes visible.
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * <body>
 *   <SkipLink />
 *   <nav>...</nav>
 *   <main id="main-content" tabIndex={-1}>
 *     {children}
 *   </main>
 * </body>
 * ```
 */
export function SkipLink({ 
  href = '#main-content',
  children = 'Skip to main content'
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="
        sr-only
        focus:not-sr-only
        focus:fixed
        focus:top-4
        focus:left-4
        focus:z-[9999]
        focus:px-4
        focus:py-2
        focus:bg-white
        focus:text-slate-900
        focus:rounded-md
        focus:shadow-lg
        focus:ring-2
        focus:ring-violet-500
        focus:outline-none
        font-medium
        transition-all
      "
    >
      {children}
    </a>
  );
}

/**
 * VisuallyHidden Component
 * 
 * WCAG 2.2 Requirement: 1.1.1 Non-text Content (Level A)
 * 
 * Hides content visually but keeps it accessible to screen readers.
 * Use for:
 * - Labels for icon-only buttons
 * - Additional context for screen readers
 * - Skip link targets
 * 
 * @example
 * ```tsx
 * <button>
 *   <IconX aria-hidden="true" />
 *   <VisuallyHidden>Close dialog</VisuallyHidden>
 * </button>
 * ```
 */
export function VisuallyHidden({
  children,
  asChild = false,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const Component = asChild ? React.Fragment : 'span';
  
  return (
    <Component
      {...props}
      className="sr-only"
      // CSS equivalent:
      // position: absolute;
      // width: 1px;
      // height: 1px;
      // padding: 0;
      // margin: -1px;
      // overflow: hidden;
      // clip: rect(0, 0, 0, 0);
      // white-space: nowrap;
      // border: 0;
    >
      {children}
    </Component>
  );
}

/**
 * Announce Component
 * 
 * WCAG 2.2 Requirement: 4.1.3 Status Messages (Level AA)
 * 
 * Creates a live region that announces content changes to screen readers.
 * 
 * @param politeness - 'polite' waits for user to stop, 'assertive' interrupts
 * @param atomic - If true, entire region is announced, not just changes
 * 
 * @example
 * ```tsx
 * <Announce>
 *   {saveSuccess && "Your changes have been saved"}
 * </Announce>
 * ```
 */
export function Announce({
  children,
  politeness = 'polite',
  atomic = true,
}: {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive';
  atomic?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

/**
 * FocusTrap Component
 * 
 * WCAG 2.2 Requirement: 2.4.3 Focus Order (Level A)
 * 
 * Traps focus within a container (like a modal) until explicitly released.
 * Focus will cycle within the trapped region when using Tab/Shift+Tab.
 * 
 * @example
 * ```tsx
 * <Dialog open={isOpen}>
 *   <FocusTrap active={isOpen}>
 *     <DialogContent>
 *       ...
 *     </DialogContent>
 *   </FocusTrap>
 * </Dialog>
 * ```
 */
export function FocusTrap({
  children,
  active = true,
  onEscape,
}: {
  children: React.ReactNode;
  active?: boolean;
  onEscape?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!active) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the trap
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    // Restore focus when trap is deactivated
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [active]);

  React.useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab: going backward
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: going forward
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, onEscape]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}

/**
 * Helper function to get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement | null): NodeListOf<Element> {
  if (!container) return document.querySelectorAll(''); // Empty nodelist
  
  return container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
}

/**
 * ReducedMotion Hook
 * 
 * WCAG 2.2 Requirement: 2.3.3 Animation from Interactions (Level AAA)
 * 
 * Returns true if the user prefers reduced motion.
 * Use to disable or simplify animations.
 * 
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * 
 * return (
 *   <div className={prefersReducedMotion ? '' : 'animate-bounce'}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * FormFieldWrapper Component
 * 
 * WCAG 2.2 Requirements:
 * - 1.3.1 Info and Relationships (Level A)
 * - 3.3.1 Error Identification (Level A)
 * - 3.3.2 Labels or Instructions (Level A)
 * 
 * Provides accessible form field structure with label, hint, and error support.
 * 
 * @example
 * ```tsx
 * <FormFieldWrapper
 *   label="Email Address"
 *   hint="We'll never share your email"
 *   error={errors.email}
 *   required
 * >
 *   {({ id, ariaDescribedBy, ariaInvalid, ariaRequired }) => (
 *     <input
 *       id={id}
 *       type="email"
 *       aria-describedby={ariaDescribedBy}
 *       aria-invalid={ariaInvalid}
 *       aria-required={ariaRequired}
 *     />
 *   )}
 * </FormFieldWrapper>
 * ```
 */
interface FormFieldWrapperProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    ariaDescribedBy: string | undefined;
    ariaInvalid: boolean;
    ariaRequired: boolean;
  }) => React.ReactNode;
}

export function FormFieldWrapper({
  label,
  hint,
  error,
  required = false,
  children,
}: FormFieldWrapperProps) {
  const id = React.useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const ariaDescribedBy = [
    hint && !error ? hintId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-destructive ml-1">*</span>
            <VisuallyHidden>(required)</VisuallyHidden>
          </>
        )}
      </label>

      {children({
        id,
        ariaDescribedBy,
        ariaInvalid: !!error,
        ariaRequired: required,
      })}

      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-foreground">
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

/**
 * HeadingLevel Context
 * 
 * WCAG 2.2 Requirement: 1.3.1 Info and Relationships (Level A)
 * 
 * Automatically manages heading levels in nested components.
 * Prevents skipping heading levels (e.g., h1 directly to h3).
 * 
 * @example
 * ```tsx
 * <HeadingLevelProvider>
 *   <Heading>Page Title (h1)</Heading>
 *   <Section>
 *     <Heading>Section Title (h2)</Heading>
 *     <Section>
 *       <Heading>Subsection (h3)</Heading>
 *     </Section>
 *   </Section>
 * </HeadingLevelProvider>
 * ```
 */
const HeadingLevelContext = React.createContext(1);

export function HeadingLevelProvider({
  children,
  startLevel = 1,
}: {
  children: React.ReactNode;
  startLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}) {
  return (
    <HeadingLevelContext.Provider value={startLevel}>
      {children}
    </HeadingLevelContext.Provider>
  );
}

export function Section({ children }: { children: React.ReactNode }) {
  const currentLevel = React.useContext(HeadingLevelContext);
  const nextLevel = Math.min(currentLevel + 1, 6);

  return (
    <HeadingLevelContext.Provider value={nextLevel}>
      <section>{children}</section>
    </HeadingLevelContext.Provider>
  );
}

export function Heading({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const level = React.useContext(HeadingLevelContext);
  // TypeScript-safe dynamic heading tag
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return React.createElement(
    Tag,
    { className, ...props },
    children
  );
}
