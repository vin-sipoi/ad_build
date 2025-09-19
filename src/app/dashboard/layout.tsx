// Main layout for the dashboard
import { Sidebar } from '@/components/shared';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
        {children}
      </main>
    </div>
  );
}
