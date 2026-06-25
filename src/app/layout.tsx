import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/shared/providers";
import { ThemeScript } from "@/components/shared/theme-script";
import { siteConfig } from "@/config/site";
import { i2paBrand } from "@/config/i2pa-brand";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: i2paBrand.appMarkUrl, type: "image/png", sizes: "512x512" },
      { url: "/logos/i2pa.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: i2paBrand.appMarkUrl, type: "image/png" }],
    shortcut: [{ url: i2paBrand.appMarkUrl, type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: i2paBrand.primary },
    { media: "(prefers-color-scheme: dark)", color: i2paBrand.primaryDark },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning className={fontSans.variable}>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen min-h-[100dvh] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
