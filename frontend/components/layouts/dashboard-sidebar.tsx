"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Zap,
  Bug,
  ShieldCheck,
  Fuel,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  History,
  Users,
  Key,
  Settings,
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
        "h-full bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Sentinel</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{item.title}</span>
                  <span
                    className={cn(
                      "text-xs",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
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
        <div className="pt-4 mt-4 border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{item.title}</span>
                    <span
                      className={cn(
                        "text-xs",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
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
      <div className="p-4 border-t border-border">
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
