"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Building2,
  Plug,
  Bell,
  Settings,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

interface PartnerSideNavProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { label: "Dashboard", route: "/partner", icon: LayoutDashboard },
  { label: "Campaigns", route: "/partner/campaigns", icon: Megaphone },
  { label: "Companies", route: "/partner/companies", icon: Building2 },
  { label: "Integrations", route: "/partner/integrations", icon: Plug },
  { label: "Notifications", route: "/partner/notifications", icon: Bell },
  // { label: "Profile & Settings", route: "/partner/settings", icon: Settings },
];

function NavContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === "/partner") {
      return pathname === "/partner";
    }
    return pathname.startsWith(route);
  };

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.route);

        return (
          <Link
            key={item.route}
            href={item.route}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PartnerSideNav({ mobileOpen, onMobileClose }: PartnerSideNavProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <NavContent />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose()}>
        <SheetContent side="left" showCloseButton={true} className="p-0 w-64">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <Logo />
          </div>
          <NavContent onItemClick={onMobileClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}
