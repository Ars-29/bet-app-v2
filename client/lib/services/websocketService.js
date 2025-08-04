import { io } from 'socket.io-client';
import { store } from '../store';
import { 
  setConnectionStatus, 
  updateLiveOdds, 
  updateLiveMatches
} from '../features/websocket/websocketSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;

    // Create Socket.IO connection
    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', this.socket.id);
      store.dispatch(setConnectionStatus('connected'));
      
      // Join live matches room by default
      this.socket.emit('joinLiveMatches');
      console.log('👥 Joined live matches room');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      store.dispatch(setConnectionStatus('disconnected'));
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      store.dispatch(setConnectionStatus('error'));
    });

    // Live odds updates
    this.socket.on('liveOddsUpdate', (data) => {
      console.log('📡 [WebSocket] Received liveOddsUpdate for match:', data.matchId);
      store.dispatch(updateLiveOdds({
        matchId: data.matchId,
        odds: data.odds,
        classification: data.classification,
        timestamp: data.timestamp
      }));
    });

    // Live matches updates
    this.socket.on('liveMatchesUpdate', (data) => {
      console.log('📡 [WebSocket] Received liveMatchesUpdate:', data);
      console.log('📡 [WebSocket] Data structure:', {
        hasMatches: !!data.matches,
        matchesLength: data.matches?.length,
        isArray: Array.isArray(data.matches),
        firstItem: data.matches?.[0]
      });
      store.dispatch(updateLiveMatches(data));
      
      // Automatically join match rooms for all live matches
      const leagueGroups = data.matches || [];
      leagueGroups.forEach(leagueGroup => {
        if (leagueGroup.matches && Array.isArray(leagueGroup.matches)) {
          leagueGroup.matches.forEach(match => {
            if (match.id) {
              this.socket.emit('joinMatch', match.id);
            }
          });
        }
      });
    });

    // Multiple odds updates (for initial connection)
    this.socket.on('multipleOddsUpdate', (updates) => {
      console.log('📡 [WebSocket] Received multipleOddsUpdate:', updates.length, 'updates');
      // Dispatch individual updates instead of using updateMultipleOdds
      updates.forEach(update => {
        console.log('📡 [WebSocket] Dispatching odds update for match:', update.matchId);
        store.dispatch(updateLiveOdds({
          matchId: update.matchId,
          odds: update.odds,
          classification: update.classification,
          timestamp: update.timestamp
        }));
      });
    });



    this.isInitialized = true;
    console.log('🔌 WebSocket service initialized');
  }

  // Join specific match room
  joinMatch(matchId) {
    if (this.socket) {
      this.socket.emit('joinMatch', matchId);
      console.log(`👥 Joined match room: ${matchId}`);
    }
  }

  // Leave specific match room
  leaveMatch(matchId) {
    if (this.socket) {
      this.socket.emit('leaveMatch', matchId);
      console.log(`👋 Left match room: ${matchId}`);
    }
  }

  // Join live matches room
  joinLiveMatches() {
    if (this.socket) {
      this.socket.emit('joinLiveMatches');
      console.log('👥 Joined live matches room');
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      console.log('🧹 Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
    }
  }

  // Get connection status
  isConnected() {
    return this.socket?.connected || false;
  }


}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService; 