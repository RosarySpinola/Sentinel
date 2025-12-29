"use client";

import { Wallet, Play, Bug, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Connect",
    description:
      "Connect your wallet or paste Move code directly into the simulator.",
    icon: Wallet,
  },
  {
    number: "02",
    title: "Simulate",
    description:
      "Preview exactly what will happen before executing. See state changes, events, and gas costs.",
    icon: Play,
  },
  {
    number: "03",
    title: "Debug",
    description:
      "Step through execution to find and fix issues. View call stack, variables, and gas at each step.",
    icon: Bug,
  },
  {
    number: "04",
    title: "Verify",
    description:
      "Use the Move Prover to formally verify your contracts meet their specifications.",
    icon: CheckCircle,
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-muted/30 border-y border-border py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Get started in minutes with our simple workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[calc(100%-60%+2rem)] h-[2px] bg-gradient-to-r from-primary/50 to-primary/20" />
              )}

              <div className="text-center">
                <div className="relative inline-flex">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step.number.replace("0", "")}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
