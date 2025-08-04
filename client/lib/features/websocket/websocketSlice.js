import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnected: false,
  liveOdds: {}, // { matchId: { odds: [], classification: {}, timestamp: string } }
  liveMatches: [],
  lastUpdate: null,
  connectionStatus: 'disconnected', // 'connecting', 'connected', 'disconnected', 'error'
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    // Connection status
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
    },
    
    // Live odds updates
    updateLiveOdds: (state, action) => {
      const { matchId, odds, classification, timestamp } = action.payload;
      console.log('🔄 [WebSocket Slice] updateLiveOdds called for match:', matchId, 'with odds:', odds);
      state.liveOdds[matchId] = {
        odds: odds || [],
        classification: classification || {},
        timestamp: timestamp || new Date().toISOString()
      };
      state.lastUpdate = new Date().toISOString();
      console.log('🔄 [WebSocket Slice] Updated liveOdds for match:', matchId, 'Total odds entries:', Object.keys(state.liveOdds).length);
    },
    
    // Live matches updates
    updateLiveMatches: (state, action) => {
      console.log('🔄 [WebSocket Slice] updateLiveMatches called with:', action.payload);
      
      // Backend now sends league-grouped data, store it directly
      const leagueGroups = action.payload.matches || [];
      state.liveMatches = leagueGroups;
      state.lastUpdate = new Date().toISOString();
      
      console.log('🔄 [WebSocket Slice] Updated liveMatches:', leagueGroups);
      console.log('🔄 [WebSocket Slice] liveMatches structure:', {
        length: leagueGroups.length,
        isArray: Array.isArray(leagueGroups),
        firstItem: leagueGroups[0],
        hasLeague: leagueGroups[0]?.league,
        hasMatches: leagueGroups[0]?.matches,
        matchesLength: leagueGroups[0]?.matches?.length
      });
    },
    
    // Clear specific match odds
    clearMatchOdds: (state, action) => {
      const matchId = action.payload;
      delete state.liveOdds[matchId];
    },
    
    // Clear all data
    clearAllData: (state) => {
      state.liveOdds = {};
      state.liveMatches = [];
      state.lastUpdate = null;
    },
    

  }
});

export const {
  setConnectionStatus,
  updateLiveOdds,
  updateLiveMatches,
  clearMatchOdds,
  clearAllData
} = websocketSlice.actions;

// Selectors
export const selectWebSocketConnection = (state) => state.websocket.connectionStatus;
export const selectIsConnected = (state) => state.websocket.isConnected;
export const selectLiveOdds = (state) => state.websocket.liveOdds;
export const selectLiveMatches = (state) => state.websocket.liveMatches;
export const selectLastUpdate = (state) => state.websocket.lastUpdate;

// Selector for specific match odds
export const selectMatchOdds = (state, matchId) => {
  return state.websocket.liveOdds[matchId] || {
    odds: [],
    classification: {},
    timestamp: null
  };
};

// Selector for match odds classification
export const selectMatchOddsClassification = (state, matchId) => {
  return state.websocket.liveOdds[matchId]?.classification || {};
};

// Selector for main odds (1X2) from live odds
export const selectMainOdds = (state, matchId) => {
  const matchOdds = state.websocket.liveOdds[matchId];
  if (!matchOdds || !matchOdds.odds) return {};
  
  // The backend now sends extracted main odds directly
  return {
    home: matchOdds.odds.home || null,
    draw: matchOdds.odds.draw || null,
    away: matchOdds.odds.away || null
  };
};

export default websocketSlice.reducer; 