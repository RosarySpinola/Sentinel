"use client";

import Link from "next/link";
import { ShieldCheck, Github, Twitter } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-semibold">Sentinel</span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/simulator"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Simulator
            </Link>
            <Link
              href="/debugger"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Debugger
            </Link>
            <Link
              href="/prover"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Prover
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Built for Movement Network. Open source on GitHub.
          </p>
        </div>
      </div>
    </footer>
  );
}
