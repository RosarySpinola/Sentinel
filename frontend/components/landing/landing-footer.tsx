"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-border bg-muted/20 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center">
            <Image
              src="/sentinel-logo-text.png"
              alt="Sentinel"
              width={120}
              height={28}
              className="h-7 w-auto"
            />
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/simulator"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Simulator
            </Link>
            <Link
              href="/debugger"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Debugger
            </Link>
            <Link
              href="/prover"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
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

        <div className="border-border mt-6 border-t pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Built for Movement Network. Open source on GitHub.
          </p>
        </div>
      </div>
    </footer>
  );
}
