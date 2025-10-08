"use client"
import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronDown, Clock } from "lucide-react"
import MatchDropdown from "./MatchDropdown"
import LiveMatchClock from "./LiveMatchClock"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { Button } from "@/components/ui/button"
import { formatToLocalTime } from '@/lib/utils';

const isMatchLive = (match) => {
    if (!match || !match.start) return false;
    const now = new Date();
    let matchTime;
    if (match.start.includes('T')) {
        matchTime = new Date(match.start.endsWith('Z') ? match.start : match.start + 'Z');
    } else {
        matchTime = new Date(match.start.replace(' ', 'T') + 'Z');
    }
    const matchEnd = new Date(matchTime.getTime() + 120 * 60 * 1000);
    return matchTime <= now && now < matchEnd;
};

// Live Timer Component - Now using LiveMatchClock
const LiveTimer = ({ matchId, isLive, onScoreUpdate }) => {
    return (
        <LiveMatchClock 
            matchId={matchId} 
            isLive={isLive} 
            onScoreUpdate={onScoreUpdate}
        />
    );
};

// Utility function to parse match name and extract home and away teams
const parseTeamsFromName = (matchName) => {
    if (!matchName) {
        return { homeTeam: null, awayTeam: null };
    }

    // Split by "vs" and trim whitespace
    const parts = matchName.split('vs').map(part => part.trim());
    
    if (parts.length === 2) {
        return {
            homeTeam: parts[0],
            awayTeam: parts[1]
        };
    }

    // Fallback if no "vs" found
    return { homeTeam: null, awayTeam: null };
};

const MatchHeader = ({ matchData, onScoreUpdate }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [currentScore, setCurrentScore] = useState('0-0')
    const triggetRef = useRef(null)
    const router = useRouter()

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    if (!matchData) {
        return null;
    }

    // Handle both old and new API data formats
    const isLive = isMatchLive(matchData);
    
    // Get team names - try participants first (new API), then parse from name
    let homeTeam, awayTeam;
    if (matchData.participants && matchData.participants.length >= 2) {
        // New API format with participants
        const homeParticipant = matchData.participants.find(p => p.position === 'home');
        const awayParticipant = matchData.participants.find(p => p.position === 'away');
        homeTeam = homeParticipant?.name || 'Home';
        awayTeam = awayParticipant?.name || 'Away';
    } else {
        // Old API format - parse from name
        const { homeTeam: parsedHome, awayTeam: parsedAway } = parseTeamsFromName(matchData.name);
        homeTeam = parsedHome || 'Home';
        awayTeam = parsedAway || 'Away';
    }

    // Get league name and country
    const leagueName = matchData.league?.name || matchData.league || 'Unknown League';
    const country = matchData?.parentName || '';
    const displayLeagueName = country ? `${leagueName} (${country})` : leagueName;
    
    // Debug logging
    console.log('🔍 MatchHeader Debug:', {
        matchData,
        leagueName,
        country,
        parentName: matchData?.parentName,
        displayLeagueName
    });

    // Get match time/score
    const matchTime = matchData.start ? formatToLocalTime(matchData.start) : 'TBD';
    
    // Get live data if available
    const liveData = matchData.liveData;
    const score = currentScore;
    const period = liveData?.period || '1st Half';
    const minute = liveData?.minute || '0';

    // Handle score updates from live data
    const handleScoreUpdate = (scoreData) => {
        console.log('📊 handleScoreUpdate called with:', scoreData);
        const homeScore = scoreData?.home ?? '0';
        const awayScore = scoreData?.away ?? '0';
        const newScore = `${homeScore} - ${awayScore}`;
        console.log('📊 Setting new score:', newScore);
        setCurrentScore(newScore);
        if (onScoreUpdate) {
            onScoreUpdate(scoreData);
        }
    };

    // Initialize score from matchData
    useEffect(() => {
        console.log('📊 Initializing score from matchData:', matchData);
        console.log('📊 matchData.liveData:', matchData.liveData);
        console.log('📊 matchData.liveData?.score:', matchData.liveData?.score);
        
        if (matchData.liveData?.score) {
            const scoreData = matchData.liveData.score;
            const homeScore = scoreData?.home ?? '0';
            const awayScore = scoreData?.away ?? '0';
            const newScore = `${homeScore} - ${awayScore}`;
            console.log('📊 Initial score set:', newScore);
            setCurrentScore(newScore);
        } else {
            console.log('📊 No live data score, setting default: 0 - 0');
            setCurrentScore('0 - 0');
        }
    }, [matchData.liveData?.score]);

    // Debug current score state
    useEffect(() => {
        console.log('📊 Current score state changed:', currentScore);
    }, [currentScore]);

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            {/* Back button */}
            <div className="flex items-center mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            </div>

            {/* Match info */}
            <div className="text-center mb-4">
                <div className="text-sm font-medium text-gray-600 mb-2">
                    {displayLeagueName}
                </div>
                <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                    {isLive ? (
                        <div className="flex items-center text-red-600 animate-pulse">
                            <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                            LIVE
                        </div>
                    ) : (
                        <div className="flex items-center text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {matchTime}
                        </div>
                    )}
                </div>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between">
                {/* Home team */}
                <div className="flex-1 text-center">
                    <div className="text-xl font-bold text-gray-800">
                        {homeTeam}
                    </div>
                </div>

                {/* Score/Time */}
                <div className="flex-1 text-center">
                    {isLive ? (
                        <div className="space-y-1">
                            <div className="text-4xl font-bold text-gray-800">
                                {score}
                            </div>
                            <LiveTimer matchId={matchData.id} isLive={isLive} onScoreUpdate={handleScoreUpdate} />
                        </div>
                    ) : (
                        <div className="text-4xl font-bold text-gray-800">
                            {score}
                        </div>
                    )}
                </div>

                {/* Away team */}
                <div className="flex-1 text-center">
                    <div className="text-xl font-bold text-gray-800">
                        {awayTeam}
                    </div>
                </div>
            </div>

            {/* Match dropdown - COMMENTED OUT FOR NOW */}
            {/*
            <div className="mt-4 flex justify-center">
                <div className="relative">
                    <Button
                        ref={triggetRef}
                        variant="outline"
                        size="sm"
                        onClick={toggleDropdown}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                        Match Info
                        <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                    
                    {isDropdownOpen && (
                        <MatchDropdown
                            matchData={matchData}
                            isOpen={isDropdownOpen}
                            onClose={() => setIsDropdownOpen(false)}
                            triggerRef={triggetRef}
                            currentLeagueId={matchData?.groupId || matchData?.group}
                        />
                    )}
                </div>
            </div>
            */}
        </div>
    );
};

export default MatchHeader;