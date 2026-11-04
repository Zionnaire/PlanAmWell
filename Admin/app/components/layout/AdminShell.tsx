"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  ShoppingBag,
  Building2,
  LogOut,
  ChevronDown,
  ChevronUp,
  Bell,
  UserCircle,
  Search,
  Settings,
  CalendarHeart,
} from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";

type NavLeaf = { label: string; href: string };
type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavLeaf[];
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/users", icon: Users },
  {
    label: "Doctors",
    href: "/dashboard/doctors",
    icon: Stethoscope,
    children: [{ label: "All Doctors", href: "/dashboard/doctors" }],
  },
  {
    label: "Advocacy",
    href: "/dashboard/advocacy",
    icon: FileText,
    children: [
      { label: "All Articles", href: "/dashboard/advocacy" },
      { label: "Create New Article", href: "/dashboard/advocacy/create" },
    ],
  },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Partners", href: "/dashboard/partners", icon: Building2 },
  {
    label: "Community Hub",
    href: "/dashboard/events",
    icon: CalendarHeart,
    children: [
      { label: "All Events", href: "/dashboard/events" },
      { label: "Create Event", href: "/dashboard/events/create" },
    ],
  },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(active);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
          active
            ? "bg-primary-container text-on-primary-container"
            : "text-on-surface-variant hover:bg-surface-variant"
        }`}
      >
        <item.icon size={18} />
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-3 rounded-full px-4 py-3 text-left text-sm font-semibold transition-colors ${
          active
            ? "bg-primary-container text-on-primary-container"
            : "text-on-surface-variant hover:bg-surface-variant"
        }`}
      >
        <span className="flex items-center gap-3">
          <item.icon size={18} />
          {item.label}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <div
        className={`flex flex-col gap-1 overflow-hidden pl-12 transition-all duration-300 ${
          open ? "mt-1 max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {item.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            className="rounded-md py-1 text-sm text-on-surface-variant transition-colors hover:text-primary"
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col justify-between border-r border-surface-variant bg-surface-container-low p-6 md:flex">
        <div>
          <h1 className="mb-8 text-xl font-bold text-primary">PlanAmWell Admin</h1>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-error transition-colors hover:bg-error-container"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="flex flex-1 flex-col md:ml-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-surface-variant bg-surface px-6">
          <div className="relative hidden sm:block">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search..."
              className="h-11 w-64 rounded-full border-none bg-surface-container-low pl-11 pr-4 text-sm outline-none transition-all focus:w-80 focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <Bell size={20} />
            </button>
            <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <UserCircle size={22} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
