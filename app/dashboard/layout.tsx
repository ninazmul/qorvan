export const dynamic = "force-dynamic";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireDashboardAccess } from "@/lib/auth/rbac";
import AdminSidebar from "./components/AdminSidebar";
import { cookies } from "next/headers";
import { Show, UserButton } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  const access = await requireDashboardAccess("/");

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar access={access} />
      <Toaster />
      <main className="flex-1 h-screen mx-auto overflow-y-auto">
        <div className="flex justify-between items-center px-5 py-3 w-full border-b border-neutral-200 bg-white">
          <SidebarTrigger className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100" />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden md:inline text-neutral-700">
              {access.name}
            </span>
            <Show when="signed-in">
              <UserButton afterSwitchSessionUrl="/" />
            </Show>
          </div>
        </div>
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
