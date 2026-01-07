"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-border relative border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="text-foreground hover:text-primary text-2xl font-bold transition-colors"
        >
          Movement Network
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          <Link
            href="/"
            className="text-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <a
            href="https://docs.movementnetwork.xyz/devs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors"
          >
            Docs
          </a>
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="bg-background border-border absolute top-16 right-0 left-0 border-b shadow-lg md:hidden">
          <nav className="container mx-auto space-y-3 px-4 py-4">
            <Link
              href="/"
              className="text-foreground hover:text-primary block py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <a
              href="https://docs.movementnetwork.xyz/devs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary block py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
