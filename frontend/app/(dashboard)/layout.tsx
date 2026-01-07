import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { DashboardHeader } from "@/components/layouts/dashboard-header";
import { ProjectProvider } from "@/lib/contexts/project-context";
import { NetworkProvider } from "@/lib/contexts/network-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NetworkProvider>
      <ProjectProvider>
        <div className="bg-background flex min-h-screen">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
      </ProjectProvider>
    </NetworkProvider>
  );
}
