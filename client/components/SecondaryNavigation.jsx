"use client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Clock, PlayCircle, Gift, Search } from "lucide-react"

const SecondaryNavigation = ({ activeTab = "HOME" }) => {
    return (
        <div className="bg-slate-800 text-white sticky top-0 z-30 py-2">
            <ScrollArea orientation="horizontal" className="w-full">
                <div className="flex items-center space-x-4 min-w-max px-4">
                    <NavItem
                        icon={<Home className="h-3 w-3" />}
                        label="HOME"
                        active={activeTab === "HOME"}
                    />
                    <NavItem
                        icon={<PlayCircle className="h-3 w-3" />}
                        label="IN-PLAY"
                        active={activeTab === "IN-PLAY"}
                    />
                    <NavItem
                        icon={<Clock className="h-3 w-3" />}
                        label="UPCOMING"
                        active={activeTab === "UPCOMING"}
                    />
                    <NavItem
                        icon={<PlayCircle className="h-3 w-3" />}
                        label="STREAMING"
                        active={activeTab === "STREAMING"}
                    />
                    <NavItem
                        icon={<Gift className="h-3 w-3" />}
                        label="FREE BETS & UNIBOOSTS"
                        mobileLabel="FREEBETS"
                        active={activeTab === "FREE BETS & UNIBOOSTS"}
                    />
                    <div className="flex items-center ml-4">
                        <Search className="h-4 w-4 cursor-pointer" />
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}

const NavItem = ({ icon, label, mobileLabel, active = false }) => {
    return (
        <div
            className={`flex items-center space-x-2 px-3 py-1 rounded-3xl transition-colors ${active ? "bg-emerald-600 text-white" : "hover:bg-slate-700 text-slate-200"
                } cursor-pointer whitespace-nowrap flex-shrink-0`}
        >
            {icon}
            <span className="text-xs font-medium hidden sm:inline">{label}</span>
            {mobileLabel && <span className="text-xs font-medium sm:hidden">{mobileLabel}</span>}
            {!mobileLabel && <span className="text-xs font-medium sm:hidden">{label}</span>}
        </div>
    )
}

export default SecondaryNavigation
