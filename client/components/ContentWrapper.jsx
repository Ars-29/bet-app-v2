'use client';

import { useSidebar } from '@/contexts/SidebarContext.js';
import SecondaryNavigation from '@/components/SecondaryNavigation';
import MainContentWrapper from '@/components/MainContentWrapper';

const ContentWrapper = ({ children }) => {
    const { isCollapsed } = useSidebar(); return (
        <div className={`flex-1 overflow-x-hidden overflow-y-auto flex flex-col lg:h-[calc(100vh-120px)] transition-all duration-300 ${isCollapsed ? '' : 'lg:ml-6'}`}>
            <SecondaryNavigation />
            <MainContentWrapper>{children}</MainContentWrapper>
        </div>
    );
};

export default ContentWrapper;
