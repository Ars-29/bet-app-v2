"use client";

import React, { useEffect } from "react";
import { CalendarDays } from "lucide-react";
import MatchListPage from "@/components/shared/MatchListPage";
import { useDispatch, useSelector } from "react-redux";
import { fetchLiveMatches, selectUpcomingMatchesGrouped, selectLiveMatchesLoading, selectLiveMatchesError } from "@/lib/features/matches/liveMatchesSlice";
import { formatToLocalTime } from '@/lib/utils';
import { getFotmobLogoByUnibetId } from '@/lib/leagueUtils';

const UpcomingMatchesPage = () => {
  const upcomingMatchesRaw = useSelector(selectUpcomingMatchesGrouped);
  const loading = useSelector(selectLiveMatchesLoading);
  const error = useSelector(selectLiveMatchesError);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLiveMatches());
  }, [dispatch]);

  // Debug: Log when upcomingMatchesRaw changes
  useEffect(() => {
    console.log('🔍 UpcomingMatchesPage: Data updated:', {
      upcomingMatchesRaw: upcomingMatchesRaw,
      upcomingMatchesRawLength: upcomingMatchesRaw?.length,
      loading: loading,
      error: error,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [upcomingMatchesRaw, loading, error]);

  // Transform Unibet API data to match MatchListPage expected format
  const upcomingMatches = upcomingMatchesRaw?.map(leagueData => {
    console.log('🔍 UpcomingMatchesPage: Processing league data:', {
      league: leagueData.league,
      matchesCount: leagueData.matches?.length,
      firstMatch: leagueData.matches?.[0]
    });
    // Get groupId from the first match to use for Fotmob logo
    const firstMatch = leagueData.matches?.[0];
    const groupId = firstMatch?.groupId;
    
    return {
      id: leagueData.league || Math.random().toString(36).substr(2, 9),
      name: leagueData.league || 'Unknown League',
      league: {
        id: leagueData.league,
        name: leagueData.league,
        imageUrl: getFotmobLogoByUnibetId(groupId) || null,
      },
      icon: "⚽",
    matches: (leagueData.matches || []).map(match => {
      // Extract team names from Unibet API format
      const team1 = match.homeName || match.team1 || 'Home Team';
      const team2 = match.awayName || match.team2 || 'Away Team';
      
      // Extract odds from Unibet API format
      let odds = {};
      if (match.mainBetOffer && match.mainBetOffer.outcomes) {
        match.mainBetOffer.outcomes.forEach(outcome => {
          // Convert Unibet API odds format (divide by 1000)
          const convertedOdds = outcome.oddsDecimal || (parseFloat(outcome.odds) / 1000).toFixed(2);
          
          if (outcome.label === '1' || outcome.label === 'Home') {
            odds.home = {
              value: convertedOdds,
              oddId: outcome.id || outcome.outcomeId,
              suspended: false
            };
          } else if (outcome.label === 'X' || outcome.label === 'Draw') {
            odds.draw = {
              value: convertedOdds,
              oddId: outcome.id || outcome.outcomeId,
              suspended: false
            };
          } else if (outcome.label === '2' || outcome.label === 'Away') {
            odds.away = {
              value: convertedOdds,
              oddId: outcome.id || outcome.outcomeId,
              suspended: false
            };
          }
        });
      }
      
      // Format start time - ensure it's in the expected format
      let startTime = match.start || match.starting_at;
      
      // If startTime is an ISO string, convert it to the expected format
      if (startTime && typeof startTime === 'string') {
        try {
          const date = new Date(startTime);
          if (!isNaN(date.getTime())) {
            // Format as "YYYY-MM-DD HH:MM:SS" for MatchListPage compatibility
            startTime = date.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
          }
        } catch (e) {
          console.warn('Invalid start time format:', startTime);
          startTime = null;
        }
      }
      
      return {
        id: match.id || match.eventId,
        team1: team1,
        team2: team2,
        starting_at: startTime,
        odds: odds,
        isLive: false, // Upcoming matches are not live
        league: {
          name: leagueData.league
        }
      };
    }),
    matchCount: leagueData.matches?.length || 0,
    };
  }) || [];

  // Debug: Log final transformed data
  console.log('🔍 UpcomingMatchesPage: Final transformed data:', {
    upcomingMatches: upcomingMatches,
    upcomingMatchesLength: upcomingMatches?.length,
    timestamp: new Date().toLocaleTimeString()
  });

  const formatUpcomingTime = (startTime, match) => {
    if (!startTime) return "TBD";
    return formatToLocalTime(startTime, { format: 'default' });
  };

  const upcomingConfig = {
    pageTitle: "Upcoming Matches",
    breadcrumbText: "Football | Upcoming Matches",
    leagues: upcomingMatches || [],
    loading,
    error,
    retryFunction: () => dispatch(fetchLiveMatches()),
    matchTimeFormatter: formatUpcomingTime,
    PageIcon: CalendarDays,
    noMatchesConfig: {
      title: "No Upcoming Matches",
      message: "There are no upcoming matches scheduled for today.",
      buttonText: "View All Leagues",
      buttonLink: "/leagues",
      Icon: CalendarDays,
    },
    viewAllMatchesLink: "/matches",
  };

  return <MatchListPage config={upcomingConfig} />;
};

export default UpcomingMatchesPage;
