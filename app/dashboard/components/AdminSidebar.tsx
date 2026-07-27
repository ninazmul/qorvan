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
  LayoutGrid, BarChart3, Mail, FolderOpen, Settings as SettingsIcon, Bell
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardAccess } from "@/lib/auth/rbac-rules";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { CMS_MODULES, CmsModule, MODULE_LABELS, MODULE_ROUTES } from "@/constants/permissions";
import Image from "next/image";

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
  subscribers: Bell,
};

export default function AdminSidebar({ access }: { access: DashboardAccess }) {
  const currentPath = usePathname();
  const { canAccessModule } = usePermissions(access);

  return (
    <Sidebar className="bg-white text-primary font-semibold shadow-md" collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel className="h-auto py-2">
            <Link href="/" className="w-full">
              <Image src="/assets/images/logo.png" alt="Logo" width={100} height={100} className="w-full h-full object-contain" />
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
                          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${isActive
                            ? "bg-black text-white shadow-sm font-semibold"
                            : "hover:bg-gray-200 hover:text-gray-900 text-gray-700"
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
