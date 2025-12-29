import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { DashboardHeader } from "@/components/layouts/dashboard-header";
import { ProjectProvider } from "@/lib/contexts/project-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ProjectProvider>
  );
}
