# Match Detail Page - API and Data Flow Documentation

## Overview
This document provides a comprehensive analysis of the APIs, data flow, and file structure involved in displaying odds and market data on the match detail page of the betting application.

## Page URL Structure
- **Route**: `/matches/[id]` (e.g., `/matches/19425618`)
- **Component**: `MatchDetailPage.jsx`
- **Page File**: `client/app/matches/[id]/page.js`

---

## 🎯 Main APIs Used

### 1. **Pre-Match Data API**
**Endpoint**: `GET /fixtures/:matchId`
- **Purpose**: Fetches match details with pre-match odds and betting data
- **Parameters**:
  - `includeOdds=true` - Include betting odds
  - `includeLeague=true` - Include league information
  - `includeParticipants=true` - Include team/participant data

**Response Format**:
```json
{
  "success": true,
  "message": "Match details fetched successfully",
  "data": {
    "id": 19425618,
    "name": "Odense BK vs Fredericia",
    "starting_at": "2025-09-19T22:00:00.000Z",
    "state_id": 1,
    "league_id": 564,
    "participants": [
      {
        "id": 12345,
        "name": "Odense BK",
        "image_path": "/logos/odense.png"
      },
      {
        "id": 67890,
        "name": "Fredericia",
        "image_path": "/logos/fredericia.png"
      }
    ],
    "odds": [
      {
        "id": "odd_123",
        "fixture_id": 19425618,
        "label": "1",
        "value": 2.10,
        "name": "Home",
        "market_id": 1,
        "market_description": "Match Result",
        "winning": null,
        "probability": 0.476,
        "handicap": null,
        "total": null,
        "suspended": false
      }
    ],
    "odds_by_market": {
      "1": {
        "market_id": 1,
        "market_description": "Match Result",
        "odds": [...]
      }
    },
    "odds_classification": {
      "categories": [
        {
          "id": "all",
          "label": "All",
          "odds_count": 25
        },
        {
          "id": "full-time",
          "label": "Full Time",
          "odds_count": 11
        }
      ],
      "classified_odds": {
        "full-time": {
          "id": "full-time",
          "label": "Full Time",
          "markets_data": {
            "1": {
              "market_id": 1,
              "market_description": "Match Result",
              "odds": [...]
            }
          },
          "odds_count": 11,
          "priority": 2
        }
      },
      "stats": {
        "total_categories": 5,
        "total_odds": 25
      }
    },
    "betting_data": [
      {
        "category": "full-time",
        "title": "Match Result",
        "options": [
          {
            "id": "odd_123",
            "label": "1",
            "value": 2.10,
            "team": null,
            "suspended": false,
            "marketId": "1"
          }
        ]
      }
    ],
    "league": {
      "id": 564,
      "name": "Superliga",
      "imageUrl": "/logos/superliga.png",
      "country": "Denmark"
    }
  }
}
```

### 2. **Live Odds API**
**Endpoint**: `GET /fixtures/:matchId/inplay-odds`
- **Purpose**: Fetches real-time live odds for ongoing matches
- **Usage**: Only called when match is live (has started)

**Response Format**:
```json
{
  "data": {
    "betting_data": [
      {
        "category": "full-time",
        "title": "Match Result",
        "options": [
          {
            "id": "live_odd_123",
            "label": "1",
            "value": 2.25,
            "team": null,
            "suspended": false,
            "marketId": "1"
          }
        ]
      }
    ],
    "odds_classification": {
      "categories": [...],
      "classified_odds": {...},
      "stats": {...}
    },
    "fetched_at": "2025-01-27T10:30:00.000Z"
  }
}
```

---

## 🔄 Data Flow Architecture

### 1. **Initial Page Load**
```
User clicks match → MatchDetailPage component mounts → fetchMatchById() → API call to /fixtures/:id → Store in Redux → Render betting tabs
```

### 2. **Live Match Detection & WebSocket Connection**
```
MatchDetailPage checks if match is live → Joins WebSocket room → Receives real-time odds updates → Updates Redux store → Re-renders components
```

### 3. **Real-time Updates**
```
WebSocket receives liveOddsUpdate → Updates Redux websocket slice → MatchDetailPage re-renders with new odds → BettingTabs displays updated data
```

---

## 📁 File Structure & Responsibilities

### **Frontend Files**

#### **Page Components**
- **`client/app/matches/[id]/page.js`**
  - Route handler for match detail pages
  - Error boundary and loading states
  - Passes matchId to MatchDetailPage component

- **`client/components/match/MatchDetailPage.jsx`**
  - Main container component
  - Manages data fetching and state
  - Handles live vs pre-match logic
  - WebSocket room management
  - Renders MatchHeader, BettingTabs, and MatchVisualization

#### **Betting Components**
- **`client/components/match/BettingTabs.jsx`**
  - Displays categorized betting markets
  - Handles tab navigation (All, Full Time, Goals, etc.)
  - Renders betting options with odds
  - Manages bet selection and bet slip integration

- **`client/components/match/MatchHeader.jsx`**
  - Displays match information (teams, date, time)
  - Shows match status and countdown

- **`client/components/match/MatchVisualization.jsx`**
  - Right sidebar with match visualization
  - Displays countdown timer and pitch graphic

#### **Data Management**
- **`client/lib/features/matches/matchesSlice.js`**
  - Redux slice for match data
  - Async thunks: `fetchMatchById`, `fetchLiveOdds`
  - State management for match details and live odds

- **`client/lib/features/websocket/websocketSlice.js`**
  - Redux slice for WebSocket data
  - Real-time odds updates
  - Live matches state management

- **`client/lib/services/websocketService.js`**
  - WebSocket connection management
  - Room joining/leaving logic
  - Event handling for live updates

- **`client/services/matches.service.js`**
  - API service for match-related requests
  - HTTP client wrapper for match endpoints

### **Backend Files**

#### **API Routes**
- **`server/src/routes/fixtures.routes.js`**
  - Route definitions for match endpoints
  - `/fixtures/:matchId` - Get match details
  - `/fixtures/:id/inplay-odds` - Get live odds

#### **Controllers**
- **`server/src/controllers/fixtures.controller.js`**
  - `getMatchById()` - Handles match detail requests
  - `getInplayOdds()` - Handles live odds requests
  - Response formatting and error handling

#### **Services**
- **`server/src/services/fixture.service.js`**
  - `FixtureOptimizationService` class
  - Match data caching and optimization
  - Odds classification and transformation
  - API rate limiting and retry logic

- **`server/src/services/LiveFixtures.service.js`**
  - Live match detection and management
  - Real-time odds fetching and caching
  - WebSocket event emission
  - Live match state tracking

#### **Utilities**
- **`server/src/utils/oddsClassification.js`**
  - `classifyOdds()` - Categorizes odds by market type
  - `transformToBettingData()` - Converts to frontend format
  - Market categorization logic

#### **WebSocket Configuration**
- **`server/src/config/socket.js`**
  - Socket.IO server setup
  - Room management (liveMatches, match_*)
  - Event handlers for client connections
  - Real-time data broadcasting

---

## 🎨 Data Format Details

### **Odds Classification Structure**
```javascript
{
  categories: [
    { id: "all", label: "All", odds_count: 25 },
    { id: "full-time", label: "Full Time", odds_count: 11 },
    { id: "goals", label: "Goals", odds_count: 8 },
    { id: "corners", label: "Corners", odds_count: 6 }
  ],
  classified_odds: {
    "full-time": {
      id: "full-time",
      label: "Full Time",
      markets_data: {
        "1": {
          market_id: 1,
          market_description: "Match Result",
          odds: [
            {
              id: "odd_123",
              label: "1",
              value: 2.10,
              name: "Home",
              market_id: 1,
              market_description: "Match Result",
              suspended: false,
              handicap: null,
              total: null
            }
          ]
        }
      },
      odds_count: 11,
      priority: 2
    }
  },
  stats: {
    total_categories: 4,
    total_odds: 25
  }
}
```

### **Betting Data Format**
```javascript
[
  {
    category: "full-time",
    title: "Match Result",
    options: [
      {
        id: "odd_123",
        label: "1",
        value: 2.10,
        team: null,
        suspended: false,
        marketId: "1"
      },
      {
        id: "odd_124",
        label: "X",
        value: 3.20,
        team: null,
        suspended: false,
        marketId: "1"
      },
      {
        id: "odd_125",
        label: "2",
        value: 3.50,
        team: null,
        suspended: false,
        marketId: "1"
      }
    ]
  }
]
```

### **Market Categories**
The system categorizes betting markets into the following groups:

1. **Pre-packs** (Priority: 1) - Special combination bets
2. **Full Time** (Priority: 2) - Match result, 1X2, winner markets
3. **Even/Odd** (Priority: 3) - Total goals even/odd
4. **Player Shots on Target** (Priority: 3) - Individual player markets
5. **Player Shots** (Priority: 4) - Player shot markets
6. **Player Cards** (Priority: 5) - Booking markets
7. **Half Time** (Priority: 6) - First/second half markets
8. **Goals** (Priority: 7) - Total goals, BTTS markets
9. **Goalscorers** (Priority: 8) - Anytime, first/last scorer
10. **Corners** (Priority: 9) - Corner-related markets
11. **Asian Lines** (Priority: 11) - Asian handicap markets
12. **Others** (Priority: 99) - Unclassified markets

---

## 🔄 Real-time Updates

### **WebSocket Events**
- **`liveOddsUpdate`** - Individual match odds updates
- **`liveMatchesUpdate`** - Live matches list updates
- **`multipleOddsUpdate`** - Bulk odds updates for multiple matches

### **Room Management**
- **`liveMatches`** - General live matches room
- **`match_${matchId}`** - Specific match room for detailed updates

### **Update Frequency**
- Live odds: Updated every 1-5 seconds during live matches
- Match status: Updated every 5 minutes
- Pre-match odds: Cached for 24 hours

---

## 🚀 Performance Optimizations

### **Caching Strategy**
- **Match Data**: 24-hour cache with automatic refresh
- **Live Odds**: 10-second cache for real-time updates
- **League Data**: 24-hour cache
- **Homepage Data**: 10-minute cache

### **API Rate Limiting**
- Maximum 1000 API calls per hour
- Automatic retry logic with exponential backoff
- Request queuing for high-traffic periods

### **Data Filtering**
- Only allowed market IDs are processed
- Player validation against match lineups
- Suspended odds handling
- Duplicate market prevention

---

## 🛠️ Key Features

### **Dynamic Market Display**
- Responsive grid layouts based on market type
- Special rendering for different market categories
- Handicap and over/under value display
- Team name resolution and display

### **Bet Slip Integration**
- Conflicting bet detection
- Market-based bet restrictions
- Real-time odds updates in bet slip
- Suspended odds handling

### **Live Match Support**
- Automatic live detection
- Real-time odds streaming
- Match status updates
- WebSocket room management

---

## 📊 API Response Examples

### **Complete Match Response**
```json
{
  "success": true,
  "message": "Match details fetched successfully",
  "data": {
    "id": 19425618,
    "name": "Odense BK vs Fredericia",
    "starting_at": "2025-09-19T22:00:00.000Z",
    "participants": [...],
    "odds_classification": {...},
    "betting_data": [...],
    "league": {...}
  },
  "stats": {
    "odds_count": 25,
    "markets_count": 8,
    "participants_count": 2,
    "has_league_info": true,
    "classification_stats": {...},
    "match_status": {
      "isStarted": false,
      "starting_at": "2025-09-19T22:00:00.000Z",
      "has_prematch_odds": true,
      "note": "Pre-match odds available"
    }
  },
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

This documentation provides a complete overview of how the match detail page fetches, processes, and displays odds and market data through various APIs and real-time WebSocket connections.
