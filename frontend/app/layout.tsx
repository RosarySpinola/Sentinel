import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { WalletProvider } from "@/components/wallet-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sentinel - Move Transaction Simulator & Debugger",
  description:
    "Tenderly for Movement. Simulate, debug, and formally verify your Move smart contracts on Movement Network.",
  openGraph: {
    title: "Sentinel",
    description: "Move Transaction Simulator & Debugger for Movement Network",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#0a0a0a",
          colorInputBackground: "#171717",
          colorInputText: "#ffffff",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WalletProvider>
              {children}
              <Toaster />
            </WalletProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
