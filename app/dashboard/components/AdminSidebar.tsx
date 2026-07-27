"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Sparkles,
  Award,
  Boxes,
  ShoppingCart,
  Users,
  Ticket,
  Truck,
  Star,
  Undo2,
  Newspaper,
  LayoutGrid,
  BarChart3,
  Mail,
  FolderOpen,
  Settings as SettingsIcon,
  Bell,
  ChevronDown,
  Package,
  Megaphone,
  Wrench,
  ExternalLink,
  Target,
  Radio,
  Search as SearchIcon,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardAccess } from "@/lib/auth/rbac-rules";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { CmsModule, CMS_MODULES, MODULE_LABELS, MODULE_ROUTES } from "@/constants/permissions";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";

// ─── Icon Map ───────────────────────────────────────────
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
  pixel: Target,
  ads: Radio,
  seo: SearchIcon,
};

// ─── Sidebar Groups ────────────────────────────────────
interface SidebarSection {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  modules: CmsModule[];
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: "Catalog",
    icon: Package,
    modules: ["products", "categories", "collections", "brands", "inventory"],
  },
  {
    label: "Sales & Customers",
    icon: ShoppingCart,
    modules: ["orders", "customers", "coupons", "delivery-zones", "reviews", "return-requests"],
  },
  {
    label: "Marketing & Growth",
    icon: TrendingUp,
    modules: ["pixel", "ads", "seo"],
  },
  {
    label: "Content",
    icon: Megaphone,
    modules: ["blog", "homepage-cms", "media"],
  },
  {
    label: "Communication",
    icon: Mail,
    modules: ["contact-messages", "subscribers"],
  },
  {
    label: "System",
    icon: Wrench,
    modules: ["reports", "settings", "users"],
  },
];

// ─── Helper: check active route ────────────────────────
function isModuleActive(module: CmsModule, currentPath: string) {
  const url = MODULE_ROUTES[module];
  return url === "/dashboard"
    ? currentPath === url
    : currentPath === url || currentPath.startsWith(`${url}/`);
}

// ─── Collapsible Section (expanded mode only) ───────────
function CollapsibleSection({
  section,
  canAccessModule,
  currentPath,
}: {
  section: SidebarSection;
  canAccessModule: (module: CmsModule) => boolean;
  currentPath: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  const hasActiveChild = section.modules.some((m) => isModuleActive(m, currentPath));
  const [isOpen, setIsOpen] = useState(hasActiveChild);
  const SectionIcon = section.icon;

  // Measure content height for animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  const visibleModules = section.modules.filter((m) => canAccessModule(m));
  if (visibleModules.length === 0) return null;

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel
        className="h-auto cursor-pointer select-none group/label"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <SectionIcon className="w-4 h-4 text-neutral-500" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 group-hover/label:text-neutral-400 transition-colors">
              {section.label}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-600 transition-transform duration-300 ease-out ${
              isOpen ? "rotate-0" : "-rotate-90"
            }`}
          />
        </div>
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <div
          ref={contentRef}
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: isOpen ? `${contentHeight}px` : "0px",
            opacity: isOpen ? 1 : 0,
          }}
        >
          <SidebarMenu className="px-2 pb-1 space-y-0.5">
            {visibleModules.map((module) => (
              <NavItem key={module} module={module} currentPath={currentPath} />
            ))}
          </SidebarMenu>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// ─── Nav Item (expanded mode) ───────────────────────────
function NavItem({ module, currentPath }: { module: CmsModule; currentPath: string }) {
  const title = MODULE_LABELS[module];
  const url = MODULE_ROUTES[module];
  const Icon = iconMap[module];
  const isActive = isModuleActive(module, currentPath);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={title}>
        <Link
          href={url}
          className={`group/item relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
            isActive
              ? "bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] font-semibold"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06]"
          }`}
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-neutral-900 rounded-r-full" />
          )}
          {Icon && (
            <Icon
              className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${
                isActive ? "text-neutral-900" : "text-neutral-500 group-hover/item:text-neutral-300"
              }`}
            />
          )}
          <span className="truncate">{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ─── Collapsed Nav Item (icon-only) ─────────────────────
function CollapsedNavItem({ module, currentPath }: { module: CmsModule; currentPath: string }) {
  const title = MODULE_LABELS[module];
  const url = MODULE_ROUTES[module];
  const Icon = iconMap[module];
  const isActive = isModuleActive(module, currentPath);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={title}>
        <Link
          href={url}
          className={`relative flex items-center justify-center !size-8 !p-0 rounded-lg transition-all duration-200 ${
            isActive
              ? "bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
              : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.08]"
          }`}
        >
          {Icon && <Icon className="w-[18px] h-[18px] shrink-0" />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ─── Main Sidebar ───────────────────────────────────────
export default function AdminSidebar({ access }: { access: DashboardAccess }) {
  const currentPath = usePathname();
  const { canAccessModule } = usePermissions(access);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r-0"
      collapsible="icon"
      style={{
        ["--sidebar-background" as string]: "0 0% 8%",
        ["--sidebar-foreground" as string]: "0 0% 95%",
        ["--sidebar-accent" as string]: "0 0% 14%",
        ["--sidebar-accent-foreground" as string]: "0 0% 95%",
        ["--sidebar-border" as string]: "0 0% 15%",
      }}
    >
      {/* ─── Header / Logo ─── */}
      <SidebarHeader className={isCollapsed ? "px-0 pt-3 pb-2 flex items-center justify-center" : "px-4 pt-5 pb-2"}>
        <Link
          href="/"
          className={`flex items-center group/logo ${isCollapsed ? "justify-center" : "gap-3"}`}
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0 flex items-center justify-center ring-1 ring-white/[0.08]">
            <Image
              src="/assets/images/logo-icon.png"
              alt="Qorvan"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white tracking-tight truncate">
                Qorvan
              </span>
              <span className="text-[10px] text-neutral-500 font-medium tracking-wide">
                Admin Panel
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {!isCollapsed && <SidebarSeparator className="mx-4 bg-white/[0.06]" />}

      {/* ─── Content ─── */}
      <SidebarContent className={`pt-2 gap-1 ${isCollapsed ? "px-0 overflow-y-auto overflow-x-hidden" : "px-2"}`}>
        {isCollapsed ? (
          /* ─── COLLAPSED: flat icon list ─── */
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col items-center gap-1 px-1">
                {CMS_MODULES
                  .filter((m) => canAccessModule(m))
                  .map((module) => (
                    <CollapsedNavItem key={module} module={module} currentPath={currentPath} />
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          /* ─── EXPANDED: grouped sections ─── */
          <>
            {canAccessModule("dashboard") && (
              <SidebarGroup className="p-0 pb-1">
                <SidebarGroupContent>
                  <SidebarMenu className="px-2">
                    <NavItem module="dashboard" currentPath={currentPath} />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarSeparator className="mx-4 bg-white/[0.06]" />

            {SIDEBAR_SECTIONS.map((section) => (
              <CollapsibleSection
                key={section.label}
                section={section}
                canAccessModule={canAccessModule}
                currentPath={currentPath}
              />
            ))}
          </>
        )}
      </SidebarContent>

      {/* ─── Footer ─── */}
      <SidebarFooter className={isCollapsed ? "px-0 pb-3 pt-2 flex items-center" : "px-4 pb-4 pt-2"}>
        {!isCollapsed && <SidebarSeparator className="mb-3 bg-white/[0.06]" />}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-1"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center text-[11px] font-bold text-white uppercase ring-1 ring-white/[0.08] shrink-0">
            {access.name?.charAt(0) || "A"}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">
                {access.name || "Admin"}
              </span>
              <span className="text-[10px] text-neutral-500 truncate">
                {access.isSuperAdmin ? "Super Admin" : "Staff"}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Link
            href="/"
            target="_blank"
            className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200 group/visit"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover/visit:text-neutral-300 transition-colors" />
            <span className="text-[11px] font-medium text-neutral-500 group-hover/visit:text-neutral-300 transition-colors">
              Visit Store
            </span>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
