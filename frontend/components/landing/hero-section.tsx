"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Github } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)] -z-10" />

      <div className="container mx-auto px-4 py-24 md:py-32 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <ShieldCheck className="h-4 w-4" />
            Tenderly for Movement
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Move Transaction Simulator
            <br />
            <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text">
              & Debugger
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Simulate transactions, debug execution, and formally verify your
            Move smart contracts — all in one powerful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
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
