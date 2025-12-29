"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="relative rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_50%)]" />

        <div className="relative py-12 md:py-16 px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto text-lg">
            Connect your wallet and start simulating transactions on Movement
            Network today.
          </p>
          <Button size="lg" variant="secondary" className="font-semibold" asChild>
            <Link href="/simulator">
              Launch Simulator
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
