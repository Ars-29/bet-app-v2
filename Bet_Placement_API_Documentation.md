# Bet Placement API Documentation

## Overview
This document provides comprehensive information about the APIs used for single bet placement and combination bet placement in the betting application, including payload structures, involved files, and data flow.

---

## API Endpoints

### Single Bet Placement
- **Endpoint**: `POST /api/bet/place-bet`
- **Authentication**: Required (Bearer Token)
- **Middleware**: `authenticateToken`, `preventConflictingBet`

### Combination Bet Placement
- **Endpoint**: `POST /api/bet/place-bet` (Same endpoint as single bet)
- **Authentication**: Required (Bearer Token)
- **Middleware**: `authenticateToken`, `preventConflictingBet`

---

## Single Bet Placement

### API Details
- **URL**: `POST /api/bet/place-bet`
- **Purpose**: Place a single bet on a specific match and market
- **Controller**: `BetController.placeBet()`
- **Service**: `BetService.placeBet()`

### Required Payload Structure
```json
{
  "matchId": "1022853538",
  "oddId": "3837716641",
  "stake": 10,
  "betOption": "Home",
  "marketId": "1",
  "odds": 1.65,
  "selection": "Home",
  "teams": "Manchester United vs Liverpool",
  "betDetails": {
    "market_id": "1",
    "market_name": "Match Winner",
    "label": "Home",
    "value": 1.65,
    "total": null,
    "market_description": "Match Winner",
    "handicap": null,
    "name": "Home"
  },
  "matchDate": "2025-01-15T20:00:00Z",
  "estimatedMatchEnd": "2025-01-15T22:00:00Z",
  "betOutcomeCheckTime": "2025-01-15T22:05:00Z",
  "inplay": false,
  "isLive": false,
  "matchStartTime": "2025-01-15T20:00:00Z",
  "matchEndTime": "2025-01-15T22:00:00Z"
}
```

### Optional Fields
```json
{
  "eventName": "Manchester United vs Liverpool",
  "marketName": "Match Winner",
  "criterionLabel": "Home",
  "criterionEnglishLabel": "Home",
  "outcomeEnglishLabel": "Manchester United",
  "participant": "Manchester United",
  "participantId": "12345",
  "eventParticipantId": "67890",
  "betOfferTypeId": "1",
  "handicapRaw": null,
  "handicapLine": null,
  "leagueId": "8",
  "leagueName": "Premier League",
  "homeName": "Manchester United",
  "awayName": "Liverpool",
  "start": "2025-01-15T20:00:00Z"
}
```

### Validation Rules
- `matchId`: Required, must be a valid match ID
- `oddId`: Required, must be a valid odd ID
- `stake`: Required, must be a positive number
- `betOption`: Required, must be a valid bet option
- `marketId`: Optional, used for market identification
- `odds`: Required, must be a positive number

---

## Combination Bet Placement

### API Details
- **URL**: `POST /api/bet/place-bet`
- **Purpose**: Place a combination bet with multiple legs
- **Controller**: `BetController.placeBet()` (same as single bet)
- **Service**: `BetService.placeBet()` (same as single bet)

### Required Payload Structure
```json
{
  "matchId": "1022853538",
  "oddId": "combination_1705123456789",
  "stake": 10,
  "betOption": "Combination Bet (3 legs)",
  "marketId": "combination",
  "combinationData": [
    {
      "matchId": "1022853538",
      "oddId": "3837716641",
      "betOption": "Home",
      "odds": 1.65,
      "stake": 10,
      "payout": 16.5,
      "status": "pending",
        "betDetails": {
          "market_id": "1",
          "market_name": "Match Winner",
          "label": "Home",
          "value": 1.65,
          "total": null,
          "market_description": "Match Winner",
          "handicap": null,
          "name": "Home"
        },
        "teams": "Manchester United vs Liverpool",
        "selection": "Home",
        "inplay": false,
        "unibetMeta": {
          "eventName": "Manchester United vs Liverpool",
          "marketName": "Match Winner",
          "criterionLabel": "Home",
          "criterionEnglishLabel": "Match Winner",
          "outcomeEnglishLabel": "Home",
          "participant": "Manchester United",
          "participantId": "12345",
          "eventParticipantId": "67890",
          "betOfferTypeId": "1",
          "handicapRaw": null,
          "handicapLine": null,
          "leagueId": "8",
          "leagueName": "Premier League",
          "homeName": "Manchester United",
          "awayName": "Liverpool",
          "start": "2025-01-15T20:00:00Z"
        }
    },
    {
      "matchId": "1022853539",
      "oddId": "3837716642",
      "betOption": "Over 2.5",
      "odds": 1.85,
      "stake": 10,
      "payout": 18.5,
      "status": "pending",
      "betDetails": {
        "market_id": "18",
        "market_name": "Total Goals",
        "label": "Over 2.5",
        "value": 1.85,
        "total": 2.5,
        "market_description": "Total Goals",
        "handicap": null,
        "name": "Over 2.5"
      },
        "teams": "Chelsea vs Arsenal",
        "selection": "Over 2.5",
        "inplay": false,
        "unibetMeta": {
          "eventName": "Chelsea vs Arsenal",
          "marketName": "Total Goals",
          "criterionLabel": "Over 2.5",
          "criterionEnglishLabel": "Total Goals",
          "outcomeEnglishLabel": "Over 2.5",
          "participant": null,
          "participantId": null,
          "eventParticipantId": null,
          "betOfferTypeId": "18",
          "handicapRaw": null,
          "handicapLine": 2.5,
          "leagueId": "8",
          "leagueName": "Premier League",
          "homeName": "Chelsea",
          "awayName": "Arsenal",
          "start": "2025-01-15T21:00:00Z"
        }
    },
    {
      "matchId": "1022853540",
      "oddId": "3837716643",
      "betOption": "Away",
      "odds": 2.10,
      "stake": 10,
      "payout": 21.0,
      "status": "pending",
      "betDetails": {
        "market_id": "1",
        "market_name": "Match Winner",
        "label": "Away",
        "value": 2.10,
        "total": null,
        "market_description": "Match Winner",
        "handicap": null,
        "name": "Away"
      },
        "teams": "Tottenham vs Manchester City",
        "selection": "Away",
        "inplay": false,
        "unibetMeta": {
          "eventName": "Tottenham vs Manchester City",
          "marketName": "Match Winner",
          "criterionLabel": "Away",
          "criterionEnglishLabel": "Match Winner",
          "outcomeEnglishLabel": "Away",
          "participant": "Manchester City",
          "participantId": "54321",
          "eventParticipantId": "98765",
          "betOfferTypeId": "1",
          "handicapRaw": null,
          "handicapLine": null,
          "leagueId": "8",
          "leagueName": "Premier League",
          "homeName": "Tottenham",
          "awayName": "Manchester City",
          "start": "2025-01-15T22:00:00Z"
        }
    }
  ]
}
```

### Validation Rules
- `combinationData`: Required, must be an array with at least 2 legs
- `stake`: Required, must be a positive number
- `matchId`: Required, uses the first leg's matchId as primary matchId
- `oddId`: Required, auto-generated as `combination_${timestamp}`
- `betOption`: Required, auto-generated as `Combination Bet (X legs)`
- Each leg in `combinationData` must have:
  - `matchId`: Valid match ID (required)
  - `oddId`: Valid odd ID (required)
  - `betOption`: Valid bet option (required)
  - `odds`: Positive number
  - `stake`: Positive number

---

## Files Involved

### Backend Files

#### 1. **Routes**
- `server/src/routes/bet.routes.js`
  - Defines the `/place-bet` endpoint
  - Applies authentication and conflict prevention middleware

#### 2. **Controller**
- `server/src/controllers/bet.controller.js`
  - `placeBet()` method handles both single and combination bets
  - Validates input parameters
  - Calls `BetService.placeBet()` for processing

#### 3. **Service**
- `server/src/services/bet.service.js`
  - `placeBet()` method processes bet placement logic
  - Handles odds validation and fetching
  - Creates bet records in database
  - Manages user balance deduction

#### 4. **Middleware**
- `server/src/middlewares/conflictingBet.js`
  - `preventConflictingBet()` function
  - Prevents conflicting bets on same match/market
  - Validates combination bet legs

#### 5. **Models**
- `server/src/models/Bet.js`
  - Defines bet schema structure
  - Supports both single and combination bets

### Frontend Files

#### 1. **Redux State Management**
- `client/lib/features/betSlip/betSlipSlice.js`
  - `placeBetThunk()` handles bet placement
  - Manages single and combination bet payloads
  - Updates user balance after successful placement

#### 2. **API Client**
- `client/lib/apiClient.js`
  - Handles HTTP requests to `/bet/place-bet` endpoint
  - Manages authentication headers

---

## Data Flow

### Single Bet Flow
```
Frontend (placeBetThunk) 
  → POST /api/bet/place-bet
    → authenticateToken middleware
      → preventConflictingBet middleware
        → BetController.placeBet()
          → BetService.placeBet()
            → Save to Database
              → Return { success, bet, user }
  → Update Redux State
    → Clear Bet Slip
```

### Combination Bet Flow
```
Frontend (placeBetThunk)
  → POST /api/bet/place-bet (with combinationData[])
    → authenticateToken middleware
      → preventConflictingBet middleware (validates each leg)
        → BetController.placeBet()
          → BetService.placeBet() (processes each leg)
            → Calculate total odds
              → Save to Database
                → Return { success, bet, user }
  → Update Redux State
    → Clear Bet Slip
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "bet": {
    "_id": "bet_id_here",
    "userId": "user_id_here",
    "matchId": "1022853538",
    "oddId": "3837716641",
    "stake": 10,
    "odds": 1.65,
    "payout": 16.5,
    "status": "pending",
    "betOption": "Home",
    "marketId": "1",
    "teams": "Manchester United vs Liverpool",
    "selection": "Home",
    "inplay": false,
    "betDetails": {
      "market_id": "1",
      "market_name": "Match Winner",
      "label": "Home",
      "value": 1.65
    },
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  },
  "user": {
    "_id": "user_id_here",
    "balance": 90,
    "username": "user123"
  },
  "message": "Bet placed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "You already have a pending bet on this market for this match.",
  "error": "CONFLICTING_BET"
}
```

---

## Key Features

### Single Bet Features
- Real-time odds validation
- Live match support
- Market conflict prevention
- Automatic outcome scheduling

### Combination Bet Features
- Multi-leg support (2-10 legs)
- Automatic odds calculation
- Individual leg validation
- Conflict prevention per leg
- Total payout calculation

### Security Features
- JWT authentication required
- User balance validation
- Conflict prevention middleware
- Input validation and sanitization

---

## Notes

1. **Same Endpoint**: Both single and combination bets use the same API endpoint (`/api/bet/place-bet`)
2. **Detection**: The system detects bet type based on the presence of `combinationData` array
3. **Validation**: Combination bets require at least 2 legs and maximum 10 legs
4. **Conflict Prevention**: The system prevents conflicting bets on the same match and market
5. **Balance Management**: User balance is automatically deducted upon successful bet placement
6. **Outcome Scheduling**: Bets are automatically scheduled for outcome checking after match completion
7. **Proper Match ID**: Combination bets now use the first leg's matchId as the primary matchId (fixed from previous null implementation)
8. **Unibet Integration**: Combination bets now include proper Unibet metadata for consistency with single bets
9. **Unibet Meta per Leg**: Each combination leg now has its own `unibetMeta` object with complete match/team/odds data for calculator
10. **No SportsMonk API**: Combination bets now use Unibet API approach (same as single bets) - no more SportsMonk API calls
11. **Calculator Ready**: Each leg contains all necessary metadata for bet outcome calculation
