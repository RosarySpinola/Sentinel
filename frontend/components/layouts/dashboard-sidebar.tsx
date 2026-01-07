"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Zap,
  Bug,
  Fuel,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  History,
  Users,
  Key,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  {
    title: "Projects",
    href: "/projects",
    icon: FolderOpen,
    description: "Manage projects",
  },
  {
    title: "Teams",
    href: "/teams",
    icon: Users,
    description: "Team workspaces",
  },
  {
    title: "Simulate",
    href: "/simulator",
    icon: Zap,
    description: "Preview transactions",
  },
  {
    title: "Debug",
    href: "/debugger",
    icon: Bug,
    description: "Step through execution",
  },
  {
    title: "Prover",
    href: "/prover",
    icon: ShieldCheck,
    description: "Formal verification",
  },
  {
    title: "Gas",
    href: "/gas",
    icon: Fuel,
    description: "Analyze gas usage",
  },
  {
    title: "History",
    href: "/history",
    icon: History,
    description: "View past runs",
  },
];

const settingsItems = [
  {
    title: "API Keys",
    href: "/settings/api-keys",
    icon: Key,
    description: "Manage API keys",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-card border-border flex h-full flex-col border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="border-border flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center">
            <Image
              src="/sentinel-logo-text.png"
              alt="Sentinel"
              width={180}
              height={44}
              className="h-11 w-auto"
              priority
            />
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <Image
              src="/sentinel-logo.png"
              alt="Sentinel"
              width={32}
              height={32}
              className="h-7 w-7"
              priority
            />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span
                    className={cn(
                      "text-xs",
                      isActive
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.description}
                  </span>
                </div>
              )}
            </Link>
          );
        })}

        {/* Settings Section */}
        <div className="border-border mt-4 border-t pt-4">
          {!collapsed && (
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-xs font-medium tracking-wider uppercase">
              <Settings className="h-3 w-3" />
              Settings
            </div>
          )}
          {settingsItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span
                      className={cn(
                        "text-xs",
                        isActive
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.description}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse button */}
      <div className="border-border border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
