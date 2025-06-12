'use client';

import { useSidebar } from '@/contexts/SidebarContext.js';
import Sidebar from '@/components/home/Sidebar';

const SidebarWrapper = () => {
    const { isCollapsed } = useSidebar(); return (
        <div className={`hidden lg:block   lg:h-[calc(100vh-108px)]  lg:z-10 transition-all duration-300 ${isCollapsed ? 'lg:w-16' : 'lg:w-48'
            }`}>
            <Sidebar />
        </div>
    );
};

export default SidebarWrapper;
