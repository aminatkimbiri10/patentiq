import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/shared/providers";
import { ThemeScript } from "@/components/shared/theme-script";
import { siteConfig } from "@/config/site";
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
