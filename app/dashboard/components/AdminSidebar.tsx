"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, ShoppingBag, Layers, Sparkles, Award, Boxes,
  ShoppingCart, Users, Ticket, Truck, Star, Undo2, Newspaper,
  LayoutGrid, BarChart3, Mail, FolderOpen, Settings as SettingsIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardAccess } from "@/lib/auth/rbac-rules";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { CMS_MODULES, CmsModule, MODULE_LABELS, MODULE_ROUTES } from "@/constants/permissions";

const iconMap: Record<CmsModule, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  products: ShoppingBag,
  categories: Layers,
  collections: Sparkles,
  brands: Award,
  inventory: Boxes,
  orders: ShoppingCart,
  customers: Users,
  coupons: Ticket,
  "delivery-zones": Truck,
  reviews: Star,
  "return-requests": Undo2,
  blog: Newspaper,
  "homepage-cms": LayoutGrid,
  reports: BarChart3,
  "contact-messages": Mail,
  media: FolderOpen,
  settings: SettingsIcon,
  users: Users,
};

export default function AdminSidebar({ access }: { access: DashboardAccess }) {
  const currentPath = usePathname();
  const { canAccessModule } = usePermissions(access);

  return (
    <Sidebar className="bg-white text-primary font-semibold shadow-md" collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel className="h-auto py-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 w-full">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-amber-600/10 flex items-center justify-center border border-amber-600/20">
                <span className="text-xl font-extrabold text-amber-700 tracking-wider">Q</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 tracking-widest uppercase truncate">
                  QORVAN
                </span>
                <span className="text-[10px] text-amber-700 font-medium tracking-wide">
                  LUXURY FASHION
                </span>
              </div>
            </Link>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {CMS_MODULES
                .filter((module) => canAccessModule(module))
                .map((module) => {
                  const title = MODULE_LABELS[module];
                  const url = MODULE_ROUTES[module];
                  const Icon = iconMap[module];

                  const isActive =
                    url === "/dashboard"
                      ? currentPath === url
                      : currentPath === url || currentPath.startsWith(`${url}/`);

                  return (
                    <SidebarMenuItem key={module}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={url}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                            isActive
                              ? "bg-amber-950 text-amber-400 shadow-sm font-semibold"
                              : "hover:bg-amber-50 hover:text-amber-900 text-gray-700"
                          }`}
                        >
                          {Icon && <Icon className="w-5 h-5" />}
                          <span className="truncate">{title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
