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
      className="bg-muted/30 border-border border-y py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Get started in minutes with our simple workflow.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="from-primary/50 to-primary/20 absolute top-8 left-[60%] hidden h-[2px] w-[calc(100%-60%+2rem)] bg-gradient-to-r lg:block" />
              )}

              <div className="text-center">
                <div className="relative inline-flex">
                  <div className="bg-primary/10 border-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border">
                    <step.icon className="text-primary h-8 w-8" />
                  </div>
                  <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    {step.number.replace("0", "")}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm">
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
