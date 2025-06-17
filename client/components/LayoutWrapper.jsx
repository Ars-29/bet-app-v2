'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import SidebarWrapper from "@/components/SidebarWrapper";
import ContentWrapper from "@/components/ContentWrapper";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0">
        <Header />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SidebarWrapper />

        {/* Main Content Area with Secondary Navigation */}
        <ContentWrapper>{children}</ContentWrapper>
      </div>
    </div>
  );
} 