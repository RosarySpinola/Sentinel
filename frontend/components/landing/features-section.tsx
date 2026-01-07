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
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
          Everything You Need to Build Secure Move Contracts
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Sentinel provides the complete toolkit for Move development on
          Movement Network.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <Link key={feature.title} href={feature.href}>
            <Card
              className="hover:border-primary/50 group h-full cursor-pointer transition-all hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                  <feature.icon className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="group-hover:text-primary text-lg transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
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
