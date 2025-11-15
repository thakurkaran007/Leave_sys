"use client";
import { useEffect, useState } from "react";

import SidebarItem from "./_components/SidebarItem";
import { signOut } from "next-auth/react";
import { Home, ArrowLeftRight, Bell, Users, Menu, X } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}):any {
  const [isOpen, setIsOpen] = useState(true);


  return (
    <div className="flex min-h-screen ">
      {/* Toggle button */}
      <div className="fixed top-5 left-5 z-50">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full shadow-md"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 pt-28 transition-all duration-300 ${
          isOpen ? "w-72 px-4" : "w-0 px-0"
        } overflow-hidden`}
      >
        <SidebarItem href="/home/dashboard" icon={<Home />} title="Home" />
        <SidebarItem href="/home/leaves" icon={<Users />} title="Leaves" />
        <SidebarItem href="/home/replacements" icon={<ArrowLeftRight />} title="Replacements" />
        <Button onClick={() => signOut()} className="mt-4 w-full">
          Log Out
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-4">{children}</main>
    </div>
  );
}
