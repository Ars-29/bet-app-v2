"use client"
import MatchHeader from "./MatchHeader"
import BettingTabs from "./BettingTabs"
import MatchVisualization from "./MatchVisualization"
import { useSidebar } from "@/contexts/SidebarContext.js"

const MatchDetailPage = ({ matchId }) => {
    const { isCollapsed } = useSidebar(); return (
        <div className="bg-slate-100 min-h-screen">
            <div className={`transition-all duration-300 `}>
                <div className="flex flex-col lg:flex-row lg:gap-2">
                    {/* Main content */}
                    <div className="flex-1 p-2 sm:p-3 md:p-4 lg:pr-2">
                        <MatchHeader matchId={matchId} />
                        <BettingTabs />
                    </div>

                    {/* Right sidebar */}
                    <div className="w-full lg:w-80 xl:w-96 lg:flex-shrink-0">
                        <div className="lg:sticky lg:top-4 p-2 sm:p-3 md:p-4 lg:p-2">
                            <MatchVisualization />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MatchDetailPage
