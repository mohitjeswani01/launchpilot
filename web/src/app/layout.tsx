import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#080808",
};

export const metadata: Metadata = {
  title: "LaunchPilot — Launch Intelligence Dashboard",
  description:
    "Know if your product launch is succeeding or failing — before your CEO asks. Multi-source analytics powered by Coral SQL.",
  keywords: ["launch analytics", "product intelligence", "SaaS", "Coral SQL", "DevOps"],
  authors: [{ name: "LaunchPilot" }],
  openGraph: {
    title: "LaunchPilot",
    description: "Launch Intelligence Dashboard powered by Coral SQL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
        style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
      >
        {children}
      </body>
    </html>
  );
}
