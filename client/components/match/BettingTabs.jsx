"use client"

import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronDown } from "lucide-react"

const BettingTabs = () => {
    const [selectedTab, setSelectedTab] = useState("all")

    const tabs = [
        { id: "all", label: "All" },
        { id: "bet-builder", label: "Bet Builder" },
        { id: "pre-packs", label: "Pre-packs" },
        { id: "full-time", label: "Full Time" },
        { id: "player-shots", label: "Player Shots on Target" },
        { id: "player-shots-2", label: "Player Shots" },
        { id: "player-cards", label: "Player Cards" },
        { id: "goal-scorer", label: "Goal Scorer" },
        { id: "player-goals", label: "Player Goals" },
        { id: "player-assists", label: "Player Assists" },
    ]

    // Sample betting data - in real app this would come from props or API
    const bettingData = [
        {
            id: "full-time",
            title: "Full Time",
            options: [
                { label: "Finland", odds: "3.70" },
                { label: "Draw", odds: "3.20" },
                { label: "Poland", odds: "2.08" },
            ],
        },
        {
            id: "total-goals",
            title: "Total Goals",
            options: [
                { label: "Over 2.5", odds: "2.23" },
                { label: "Under 2.5", odds: "1.63" },
                { label: "Over 1.5", odds: "1.45" },
                { label: "Under 1.5", odds: "2.85" },
                { label: "Over 3.5", odds: "3.10" },
                { label: "Under 3.5", odds: "1.35" },
            ],
        },
        {
            id: "double-chance",
            title: "Double Chance",
            options: [
                { label: "1X", odds: "1.70" },
                { label: "X2", odds: "1.25" },
                { label: "12", odds: "1.28" },
            ],
        },
        {
            id: "both-teams-score",
            title: "Both Teams to Score",
            options: [
                { label: "Yes", odds: "1.85" },
                { label: "No", odds: "1.95" },
            ],
        },
        {
            id: "correct-score",
            title: "Correct Score",
            options: [
                { label: "1-0", odds: "8.50" },
                { label: "2-0", odds: "12.00" },
                { label: "2-1", odds: "9.75" },
                { label: "1-1", odds: "6.25" },
                { label: "0-0", odds: "9.00" },
                { label: "0-1", odds: "15.00" },
            ],
        },
    ]

    return (
        <div className="mb-6  -mt-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full ">                {/* Clean tab navigation */}
                <div className="mb-4 sm:mb-6 bg-white pb-2 pl-2 sm:pl-[13px] p-1">
                    <ScrollArea orientation="horizontal" className="w-full">
                        <div className="flex gap-1 sm:gap-1.5 min-w-max pr-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`px-2 py-1.5 sm:px-3 sm:py-1 text-xs  rounded-2xl sm:rounded-3xl whitespace-nowrap transition-all duration-200 flex-shrink-0 ${selectedTab === tab.id
                                        ? "bg-emerald-500 text-white shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <TabsContent value="all" className="space-y-4">
                    <BettingAccordionGroup bettingData={bettingData} />
                </TabsContent>

                {/* Other tab contents */}
                {tabs.slice(1).map((tab) => (
                    <TabsContent key={tab.id} value={tab.id}>
                        <BettingAccordionGroup
                            bettingData={bettingData.filter(
                                (section) =>
                                    section.title.toLowerCase().includes(tab.label.toLowerCase()) ||
                                    tab.id === "bet-builder" ||
                                    tab.id === "pre-packs",
                            )}
                            emptyMessage={`${tab.label} betting options will be displayed here`}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

// Modular Betting Accordion Component
const BettingAccordionGroup = ({ bettingData, emptyMessage }) => {
    if (!bettingData || bettingData.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <div className="text-lg font-medium mb-2">No betting options available</div>
                <div className="text-sm">{emptyMessage || "Betting options will be displayed here"}</div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Accordion type="multiple" className="space-y-3  ">
                {bettingData.map((section) => (
                    <AccordionItem
                        key={section.id}
                        value={section.id}
                        className="bg-white border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200 "
                    >                        <AccordionTrigger className="px-3 py-3 sm:px-6 sm:py-4 hover:no-underline hover:bg-gray-50/50 transition-colors duration-200 [&[data-state=open]]:bg-gray-50/80 [&[data-state=open]]:border-b [&[data-state=open]]:border-gray-200">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">{section.title}</h4>
                                    <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        {section.options.length}
                                    </span>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 py-4 sm:px-6 sm:py-5 bg-gray-50/30">
                            <BettingOptionsGrid options={section.options} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

// Betting Options Grid Component
const BettingOptionsGrid = ({ options }) => {
    const getGridCols = (optionsCount) => {
        if (optionsCount <= 2) return "grid-cols-2"
        if (optionsCount === 3) return "grid-cols-3"
        if (optionsCount <= 4) return "grid-cols-2 sm:grid-cols-4"
        if (optionsCount <= 6) return "grid-cols-2 sm:grid-cols-3"
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
    }

    return (
        <div className={`grid ${getGridCols(options.length)} gap-2 sm:gap-3`}>
            {options.map((option, index) => (
                <BettingOption key={`${option.label}-${index}`} label={option.label} odds={option.odds} />
            ))}
        </div>
    )
}

const BettingSection = ({ title, children }) => {
    return (
        <div>
            <h4 className="text-base font-semibold mb-3 text-gray-800">{title}</h4>
            {children}
        </div>
    )
}

const BettingOption = ({ label, odds }) => {
    return (
        <div className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl text-center py-2.5 sm:py-3 px-2 font-medium transition-all duration-200 cursor-pointer group shadow-sm">
            <div className="text-xs sm:text-sm mb-0.5 opacity-90">{label}</div>
            <div className="text-base sm:text-lg font-bold group-hover:scale-105 transition-transform duration-200">{odds}</div>
        </div>
    )
}

export default BettingTabs
