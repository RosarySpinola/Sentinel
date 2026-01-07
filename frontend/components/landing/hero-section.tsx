"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Github } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="from-primary/5 via-background to-primary/10 absolute inset-0 -z-10 bg-gradient-to-br" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="container mx-auto px-4 py-24 text-center md:py-32">
        <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-3xl space-y-6 duration-700">
          <div className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            Tenderly for Movement
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Move Transaction Simulator
            <br />
            <span className="text-primary from-primary to-primary/60 bg-gradient-to-r bg-clip-text">
              & Debugger
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
            Simulate transactions, debug execution, and formally verify your
            Move smart contracts — all in one powerful dashboard.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/simulator">
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
