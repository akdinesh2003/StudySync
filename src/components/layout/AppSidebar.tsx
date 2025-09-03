"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, BrainCircuit, CalendarClock, Home, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const menuItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/subjects", label: "Subjects", icon: Book },
  { href: "/ai-summary", label: "AI Summary", icon: Sparkles },
  { href: "/break-scheduler", label: "Break Scheduler", icon: CalendarClock },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isSubPath = (base: string) => {
    if (base === '/') return pathname === '/';
    return pathname.startsWith(base);
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold font-headline">StudySync</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isSubPath(item.href)}
                tooltip={{children: item.label, side: "right", align: "center"}}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
