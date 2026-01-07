import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../css/globals.css";
import { SkipLink } from "@/resources/components/ui/accessibility";
import { ThemeProvider } from "@/resources/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catalyst | Enterprise Next.js Framework",
  description: "Build like Laravel, Ship like Next.js. Catalyst brings enterprise patterns to the modern web — Service Container, Active Record ORM, CLI generators, and full TypeScript support.",
  keywords: ["Next.js", "Laravel", "TypeScript", "Framework", "React", "Full-Stack", "Enterprise"],
  authors: [{ name: "Catalyst Team" }],
  openGraph: {
    title: "Catalyst | Enterprise Next.js Framework",
    description: "Build like Laravel, Ship like Next.js. Enterprise patterns for the modern web.",
    type: "website",
    locale: "en_US",
    siteName: "Catalyst",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catalyst | Enterprise Next.js Framework",
    description: "Build like Laravel, Ship like Next.js. Enterprise patterns for the modern web.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SkipLink />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
