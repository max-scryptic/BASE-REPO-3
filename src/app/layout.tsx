import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { EmDashGuard } from "@/components/em-dash-guard";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Base UI Component System",
  description: "A Base UI dashboard for shaping the app component library.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <EmDashGuard />
        <div className="isolate flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
