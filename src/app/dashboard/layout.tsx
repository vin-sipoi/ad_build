// Main layout for the dashboard
import { Sidebar } from '@/components/shared';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background scroll-smooth">
      <Sidebar />
      <main className="flex-1 p-3 md:p-8 pt-16 md:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
