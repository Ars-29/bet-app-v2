'use client';



const MainContentWrapper = ({ children }) => {
    return (
        <main className="flex-1 w-full lg:h-[calc(100vh-120px)]">
            {children}
        </main>
    );
};

export default MainContentWrapper;
