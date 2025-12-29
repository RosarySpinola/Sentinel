"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Zap, Bug, Fuel } from "lucide-react";

const features = [
  {
    title: "Transaction Simulator",
    description:
      "Preview any transaction before execution. See state changes, gas usage, and events before signing.",
    icon: Zap,
    href: "/simulator",
  },
  {
    title: "Visual Debugger",
    description:
      "Step through Move execution with full visibility into the call stack, local variables, and gas consumption.",
    icon: Bug,
    href: "/debugger",
  },
  {
    title: "Move Prover",
    description:
      "Formal verification made accessible. Write specs, catch bugs, and view counterexamples visually.",
    icon: ShieldCheck,
    href: "/prover",
  },
  {
    title: "Gas Profiler",
    description:
      "Identify expensive operations and get optimization suggestions to reduce gas costs.",
    icon: Fuel,
    href: "/gas",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Everything You Need to Build Secure Move Contracts
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Sentinel provides the complete toolkit for Move development on
          Movement Network.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Link key={feature.title} href={feature.href}>
            <Card
              className="h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
