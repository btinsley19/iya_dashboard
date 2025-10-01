import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://iya-dashboard-1eaz.vercel.app'),
  title: "IYA Networking Tool",
  description: "Connect, collaborate, and grow with fellow USC students. Find cofounders, collaborators, and friends in the IYA community.",
  keywords: ["USC", "IYA", "networking", "students", "collaboration", "Iovine Young Academy"],
  authors: [{ name: "USC Iovine & Young Academy" }],
  openGraph: {
    title: "IYA Networking Tool",
    description: "Connect, collaborate, and grow with fellow USC students. Find cofounders, collaborators, and friends in the IYA community.",
    url: "https://iya-dashboard-1eaz.vercel.app",
    siteName: "IYA Networking Tool",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "IYA Networking Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IYA Networking Tool",
    description: "Connect, collaborate, and grow with fellow USC students. Find cofounders, collaborators, and friends in the IYA community.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
