"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletSelectionModal } from "@/components/wallet-selection-modal";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ShieldCheck, ArrowRight, Wallet, Github } from "lucide-react";

export function LandingHeader() {
  const { connected } = useWallet();

  return (
    <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Sentinel</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {connected ? (
            <Button asChild>
              <Link href="/simulator">
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <WalletSelectionModal>
              <Button>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </WalletSelectionModal>
          )}
        </div>
      </div>
    </header>
  );
}
