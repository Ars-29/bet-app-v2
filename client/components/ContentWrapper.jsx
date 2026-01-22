'use client';

import { useCustomSidebar } from '@/contexts/SidebarContext.js';

const ContentWrapper = ({ children }) => {
    const { isCollapsed, isMobile } = useCustomSidebar();

    return (
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            !isMobile && !isCollapsed ? 'ml-6' : ''
        }`}>
            {/* SecondaryNavigation removed - now in Header */}
            {/* ✅ FIX: Add iPhone 13 mini padding to scroll container to prevent cut-off when content expands */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-0 pt-0 md:pt-0 max-[390px]:pt-[100px] max-[390px]:pb-[100px]">
                {children}
            </main>
        </div>
    );
};

export default ContentWrapper;


