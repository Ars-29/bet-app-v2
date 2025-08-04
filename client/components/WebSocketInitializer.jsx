'use client';

import { useEffect } from 'react';
import websocketService from '@/lib/services/websocketService';

const WebSocketInitializer = () => {
  useEffect(() => {
    // Initialize WebSocket connection early
    websocketService.initialize();
    
    // Join live matches room by default
    websocketService.joinLiveMatches();
    
    console.log('🔌 WebSocket initialized and joined live matches room');
    
    // Cleanup on unmount
    return () => {
      // Don't disconnect here as other components might be using the socket
      console.log('🔌 WebSocket initializer unmounted');
    };
  }, []);

  return null; // This component doesn't render anything
};

export default WebSocketInitializer; 