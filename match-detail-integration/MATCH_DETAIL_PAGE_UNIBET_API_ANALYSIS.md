# Match Detail Page - UNIBET-API Analysis

## Overview
This document specifically analyzes what happens when you click on a match and the match detail page opens, showing which APIs from the UNIBET-API folder are involved and their exact data structures.

---

## 🎯 **When You Click on a Match**

### **Step 1: Match Selection**
- User clicks on a match from the match list
- Match ID is passed to the match detail page
- URL becomes: `/matches/[matchId]` (e.g., `/matches/1024001723`)

### **Step 2: Match Detail Page Loads**
- `client/app/matches/[id]/page.js` renders
- `MatchDetailPage.jsx` component mounts
- `useMatchData` hook is called with the match ID

---

## 🔌 **APIs Called When Match Detail Page Opens**

### **1. Primary API: Match Betting Markets**
**File**: `UNIBET-API/server.js` (Lines 200-300)
**Endpoint**: `GET /api/betoffers/:eventId`
**Purpose**: Fetches all betting markets and odds for the specific match

**API Structure**:
```javascript
// UNIBET-API/server.js - betoffers endpoint
app.get('/api/betoffers/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Call external Unibet API
    const response = await fetch(
      `https://oc-offering-api.kambicdn.com/offering/v2018/ubau/betoffer/event/${eventId}.json`,
      {
        headers: {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'referer': 'https://www.unibet.com.au/',
          'cache-control': 'no-cache'
        }
      }
    );
    
    const data = await response.json();
    res.json({
      success: true,
      eventId: eventId,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Response Structure**:
```json
{
  "success": true,
  "eventId": "1024001723",
  "data": {
    "betOffers": [
      {
        "id": 2544447782,
        "criterion": {
          "id": 1001160038,
          "label": "Total Goals Odd/Even",
          "englishLabel": "Total Goals Odd/Even",
          "occurrenceType": "GOALS",
          "lifetime": "FULL_TIME"
        },
        "betOfferType": {
          "id": 10,
          "name": "Odd/Even",
          "englishName": "Odd/Even"
        },
        "eventId": 1024171619,
        "outcomes": [
          {
            "id": 3837009977,
            "label": "Even",
            "englishLabel": "Even",
            "odds": 2350,
            "type": "OT_EVEN",
            "betOfferId": 2544447782,
            "changedDate": "2025-08-11T15:28:39Z",
            "oddsFractional": "27/20",
            "oddsAmerican": "135",
            "status": "OPEN",
            "cashOutStatus": "ENABLED"
          },
          {
            "id": 3837009981,
            "label": "Odd",
            "englishLabel": "Odd",
            "odds": 1540,
            "type": "OT_ODD",
            "betOfferId": 2544447782,
            "changedDate": "2025-08-11T15:28:39Z",
            "oddsFractional": "8/15",
            "oddsAmerican": "-186",
            "status": "OPEN",
            "cashOutStatus": "ENABLED"
          }
        ],
        "tags": [
          "OFFERED_PREMATCH",
          "OFFERED_LIVE",
          "PBA_DISABLED"
        ]
      }
    ]
  },
  "timestamp": "2025-01-15T15:35:00Z"
}
```

### **2. Secondary API: Live Match Data**
**File**: `UNIBET-API/server.js` (Lines 100-200)
**Endpoint**: `GET /api/live-matches`
**Purpose**: Gets live match information including scores and status

**API Structure**:
```javascript
// UNIBET-API/server.js - live matches endpoint
app.get('/api/live-matches', async (req, res) => {
  try {
    const response = await fetch(
      'https://www.unibet.com.au/sportsbook-feeds/views/filter/football/all/matches',
      {
        headers: {
          'accept': '*/*',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'referer': 'https://www.unibet.com.au/betting/sports/filter/football/all/matches'
        }
      }
    );
    
    const data = await response.json();
    const matches = extractFootballMatches(data);
    
    res.json({
      success: true,
      matches: matches,
      totalMatches: matches.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Response Structure**:
```json
{
  "success": true,
  "matches": [
    {
      "id": "1024001723",
      "name": "Manchester United vs Liverpool",
      "start": "2025-01-15T15:30:00Z",
      "state": "LIVE",
      "sport": "FOOTBALL",
      "group": "Premier League",
      "participants": [
        {"name": "Manchester United", "position": "home"},
        {"name": "Liverpool", "position": "away"}
      ],
      "liveData": {
        "score": "2-1",
        "period": "2nd Half",
        "minute": "67"
      }
    }
  ],
  "totalMatches": 15,
  "lastUpdated": "2025-01-15T15:35:00Z"
}
```

---

## 📁 **Key UNIBET-API Files Involved**

### **1. Main Server File**
**File**: `UNIBET-API/server.js`
**Purpose**: Contains all API endpoints
**Key Functions**:
- `GET /api/betoffers/:eventId` - Main betting markets API
- `GET /api/live-matches` - Live match data API
- `GET /api/all-football-matches` - All matches API

### **2. Configuration File**
**File**: `UNIBET-API/config.js`
**Purpose**: API configuration and endpoints
**Key Configuration**:
```javascript
// UNIBET-API/config.js
const API_BASE_URL = 'https://oc-offering-api.kambicdn.com/offering/v2018/ubau/betoffer/event';
const LIVE_MATCHES_API_URL = 'https://www.unibet.com.au/sportsbook-feeds/breadcrumbs/live';
const ALL_FOOTBALL_API_URL = 'https://www.unibet.com.au/sportsbook-feeds/views/filter/football/all/matches';

const API_HEADERS = {
  'accept': 'application/json, text/javascript, */*; q=0.01',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'referer': 'https://www.unibet.com.au/',
  'cache-control': 'no-cache'
};
```

### **3. Sample Data Files**
**File**: `UNIBET-API/betoffers.json`
**Purpose**: Sample betting markets data
**Contains**: Real examples of betting market structures

**File**: `UNIBET-API/footballallmatches.json`
**Purpose**: Sample match data
**Contains**: Real examples of match data structures

**File**: `UNIBET-API/oddsresponse.json`
**Purpose**: Sample odds response
**Contains**: Real examples of odds data

---

## 🔄 **Data Flow When Match Detail Page Opens**

### **Step 1: Frontend Request**
```javascript
// client/hooks/useMatchData.js
const fetchMatchData = async (matchId) => {
  const response = await fetch(`/api/betoffers/${matchId}`);
  const data = await response.json();
  return data;
};
```

### **Step 2: Backend Processing**
```javascript
// server/src/routes/fixtures.routes.js
router.get('/:matchId', async (req, res) => {
  const { matchId } = req.params;
  
  // Call UNIBET-API
  const response = await fetch(`http://localhost:3000/api/betoffers/${matchId}`);
  const data = await response.json();
  
  res.json(data);
});
```

### **Step 3: UNIBET-API Processing**
```javascript
// UNIBET-API/server.js
app.get('/api/betoffers/:eventId', async (req, res) => {
  const { eventId } = req.params;
  
  // Call external Unibet API
  const response = await fetch(
    `https://oc-offering-api.kambicdn.com/offering/v2018/ubau/betoffer/event/${eventId}.json`,
    { headers: API_HEADERS }
  );
  
  const data = await response.json();
  res.json({
    success: true,
    eventId: eventId,
    data: data,
    timestamp: new Date().toISOString()
  });
});
```

### **Step 4: External API Call**
- **URL**: `https://oc-offering-api.kambicdn.com/offering/v2018/ubau/betoffer/event/1024001723.json`
- **Method**: GET
- **Headers**: As defined in `config.js`
- **Response**: Raw Unibet betting markets data

---

## 📊 **Data Structures Displayed on Match Detail Page**

### **1. Match Information**
```json
{
  "id": "1024001723",
  "name": "Manchester United vs Liverpool",
  "start": "2025-01-15T15:30:00Z",
  "state": "LIVE",
  "participants": [
    {"name": "Manchester United", "position": "home"},
    {"name": "Liverpool", "position": "away"}
  ],
  "liveData": {
    "score": "2-1",
    "period": "2nd Half",
    "minute": "67"
  }
}
```

### **2. Betting Markets**
```json
{
  "betOffers": [
    {
      "id": 2544447782,
      "criterion": {
        "label": "Total Goals Odd/Even"
      },
      "betOfferType": {
        "name": "Odd/Even"
      },
      "outcomes": [
        {
          "id": 3837009977,
          "label": "Even",
          "odds": 2350,
          "status": "OPEN"
        },
        {
          "id": 3837009981,
          "label": "Odd",
          "odds": 1540,
          "status": "OPEN"
        }
      ]
    }
  ]
}
```

### **3. Odds Format**
- **Raw Format**: `2350` (from API)
- **Display Format**: `2.35` (divided by 1000)
- **Fractional**: `27/20`
- **American**: `135`

---

## 🎯 **Specific APIs Called for Match Detail Page**

### **Primary API Call**
- **Endpoint**: `GET /api/betoffers/:eventId`
- **File**: `UNIBET-API/server.js` (Lines 200-300)
- **Purpose**: Get all betting markets for the match
- **External URL**: `https://oc-offering-api.kambicdn.com/offering/v2018/ubau/betoffer/event/{eventId}.json`

### **Secondary API Call**
- **Endpoint**: `GET /api/live-matches`
- **File**: `UNIBET-API/server.js` (Lines 100-200)
- **Purpose**: Get live match data and scores
- **External URL**: `https://www.unibet.com.au/sportsbook-feeds/views/filter/football/all/matches`

### **Tertiary API Call**
- **Endpoint**: `GET /api/all-football-matches`
- **File**: `UNIBET-API/server.js` (Lines 300-400)
- **Purpose**: Get comprehensive match data
- **External URL**: `https://www.unibet.com.au/sportsbook-feeds/views/filter/football/all/matches`

---

## 📋 **Summary**

When you click on a match and the match detail page opens:

1. **Primary API**: `GET /api/betoffers/:eventId` from `UNIBET-API/server.js`
2. **Data Source**: External Unibet API at `https://oc-offering-api.kambicdn.com/offering/v2018/ubau/betoffer/event/{eventId}.json`
3. **Response Structure**: Contains `betOffers` array with betting markets and odds
4. **Key Files**: `UNIBET-API/server.js`, `UNIBET-API/config.js`, sample data files
5. **Data Flow**: Frontend → Backend → UNIBET-API → External Unibet API

The match detail page displays all betting markets, odds, and match information fetched from these APIs.
