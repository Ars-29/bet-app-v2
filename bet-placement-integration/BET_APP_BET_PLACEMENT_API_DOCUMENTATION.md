# Bet Placement & Calculation - bet-app API and Data Flow Documentation

## Overview
This document lists the APIs, files, and data flow involved in bet placement and outcome calculation in the bet-app, mirroring the structure used in `MATCH_PAGE_API_DOCUMENTATION.md`. Use this as the source-of-truth to prepare a migration plan to the unibet-api backend while keeping the existing UI.

---

## Authentication & Middleware
- All bet endpoints require user auth.
- Middleware used:
  - `authenticateToken` → verifies user session
  - `preventConflictingBet` → blocks duplicate/conflicting bets on the same match/market

Files:
- `server/src/middlewares/auth.js`
- `server/src/middlewares/conflictingBet.js`
- `server/src/middlewares/index.js`

---

## Main APIs (bet-app)

Base path: `/api/bet`

1) Place a bet
- Method: `POST /api/bet/place-bet`
- Middleware: `authenticateToken`, `preventConflictingBet`
- Controller: `BetController.placeBet`
- Expected payloads:
  - Single bet (minimum):
    ```json
    {
      "matchId": "<string|number>",
      "oddId": "<string>",
      "stake": <number>,
      "betOption": "<string>",
      "marketId": "<string|number>",
      "betDetails": {
        "market_id": "<string|number>",
        "market_name": "<string>",
        "label": "<string>",
        "value": <number>,
        "total": "<string|null>",
        "market_description": "<string|null>",
        "handicap": "<string|null>",
        "name": "<string>"
      },
      "inplay": <boolean>
    }
    ```
  - Combination bet:
    ```json
    {
      "matchId": "combination",
      "oddId": "combo_<timestamp>",
      "stake": <number>,
      "betOption": "Combination Bet (<legs> legs)",
      "marketId": "combination",
      "combinationData": [
        {
          "matchId": "<string|number>",
          "oddId": "<string>",
          "betOption": "<string>",
          "odds": <number>,
          "stake": <number>,
          "inplay": <boolean>,
          "selection": "<string>",
          "teams": "Team A vs Team B",
          "marketId": "<string|number>",
          "betDetails": { "market_id": "...", "label": "...", "value": <number>, ... }
        }
      ]
    }
    ```

2) Check single bet outcome
- Method: `GET /api/bet/:betId/outcome`
- Controller: `BetController.checkBetOutcome`

3) Check all pending bets (batch)
- Method: `GET /api/bet/pending/check`
- Controller: `BetController.checkPendingBets`

4) Get authenticated user’s bets
- Method: `GET /api/bet`
- Controller: `BetController.getUserBets`

5) Admin – get all bets grouped by user
- Method: `GET /api/bet/admin/all`
- Controller: `BetController.getAllBets`

6) Admin – get bets for a specific user
- Method: `GET /api/bet/:userId`
- Controller: `BetController.getBetsByUserId`

Route file:
- `server/src/routes/bet.routes.js`

---

## Backend File Map

### Routes
- `server/src/routes/bet.routes.js`

### Controllers
- `server/src/controllers/bet.controller.js`
  - `placeBet(req, res)` – single and combination bet entry point
  - `checkBetOutcome(req, res)` – computes result for a stored bet
  - `checkPendingBets(req, res)` – batch process pending bets
  - `getUserBets(req, res)` – returns current user’s bets
  - `getAllBets(req, res)` – admin view (grouped by user)
  - `getBetsByUserId(req, res)` – admin per-user

### Services
- `server/src/services/bet.service.js`
  - Core business logic for placing and settling bets
  - Handles both single and combination bets
  - Balance deduction and persistence (`User` model)
  - Creates `betDetails` with market metadata
  - Determines inplay flag via `global.liveFixturesService`
  - Schedules/derives outcome check times
  - Reads market definitions from `constants/markets.json`
  - Uses calculators:
    - `BetOutcomeCalculationService` (manual/market-based)
    - `WinningOddsCalculationService` (uses odds.winning)
    - `BaseBetOutcomeCalculationService` (all market helpers)

- `server/src/services/betOutcomeCalculation.service.js`
  - Central market switch → delegates to `BaseBetOutcomeCalculationService` methods

- `server/src/services/winningOddsCalculation.service.js`
  - Calculator when market has `has_winning_calculations=true` (uses the “winning” field)

- `server/src/services/baseBetOutcomeCalculation.service.js`
  - Implements calculations for dozens of market types (Over/Under, BTTS, Correct Score, Asian Handicap, Corners, Cards, Player markets, etc.)

- `server/src/services/betOutcomeUtilities.service.js`
  - Utilities for combination/system bet outcomes and odds aggregation

- `server/src/services/finance.service.js`
  - General finance operations (balances, transactions) used by bet flows

- `server/src/services/LiveFixtures.service.js`
  - Live detection and inplay odds support (used to tag bets as inplay)

- `server/src/services/fixture.service.js`
  - Fixture/odds cache used when validating/creating `betDetails`

### Models
- `server/src/models/Bet.js` – bet schema (single + combination legs)
- `server/src/models/User.js` – user balances (used for stake deduction)
- `server/src/models/matchOdds.model.js` – persisted odds snapshot (if used)

### Middleware
- `server/src/middlewares/auth.js` – `authenticateToken`, `requireAdmin`
- `server/src/middlewares/conflictingBet.js` – `preventConflictingBet`

### Constants, Utilities & Jobs
- `server/src/constants/markets.json` – market IDs/names and flags (e.g., has_winning_calculations)
- `server/src/constants/types.json` – auxiliary type mappings
- `server/src/utils/betResultChecker.js` – helper utilities
- `server/src/config/agendaJobs.js` & `server/src/config/agenda.js` – background job setup
- `server/docs/bet-calculation-flow-simple.md` – docs (simple flow)
- `server/src/docs/BetOutcomeCalculation.md` – docs (detailed)
- Tests covering calculators: `server/src/tests/*.test.js` (asian handicap, half goals, combos, etc.)

---

## Frontend File Map

### Components
- `client/components/BetSlip.jsx` – main bet slip UI (singles/combination), triggers placement
- `client/components/betting/CombinationBetCard.jsx` – combo UI
- `client/components/betting/BettingHistoryPage.jsx` – history display

### Hooks
- `client/hooks/useBetting.js` – add to slip and direct placement helper

### Redux Slices
- `client/lib/features/betSlip/betSlipSlice.js`
  - Holds active bets, stakes, totals
  - `placeBetThunk` → builds payloads and calls `POST /api/bet/place-bet`
  - Prevents duplicate market selections on same match (client-side)
- `client/lib/features/bets/betsSlice.js`
  - `GET /api/bet` (user bets)
  - Admin fetchers: `/api/bet/admin/all`, `/api/bet/:userId`

### Client API
- `client/config/axios.js` – HTTP client used by slices and hooks

---

## Data Flow – Single Bet
```
Betting option clicked → addBet (Redux) → BetSlip stake entered → placeBetThunk()
  → POST /api/bet/place-bet
    → authenticateToken → preventConflictingBet
      → BetController.placeBet
        → BetService.placeBet (fetch/validate odds, create betDetails, deduct balance)
          → Save Bet
          ← Return { success, bet, user }
← Update Redux (clear slip) & user balance
```

## Data Flow – Combination Bet
```
Multiple selections added → switch to Combination tab → enter stake → placeBetThunk()
  → POST /api/bet/place-bet (with combinationData[])
    → authenticateToken → preventConflictingBet (validates per leg)
      → BetController.placeBet
        → BetService.placeBet (process each leg, aggregate odds, deduct balance)
          → Save Bet with combination legs
          ← Return { success, bet, user }
← Update Redux (clear slip) & user balance
```

## Outcome Calculation
- On-demand: `GET /api/bet/:betId/outcome`
- Batch: `GET /api/bet/pending/check`
- Implemented by `BetService.checkBetOutcome` with calculators:
  - `WinningOddsCalculationService` if market supports odds.winning
  - Otherwise `BetOutcomeCalculationService` → `BaseBetOutcomeCalculationService`
- Combination outcomes use `BetOutcomeUtilities` to aggregate legs (e.g., accumulator product odds)

---

## Response Shapes (Examples)

Single placement (success):
```json
{
  "success": true,
  "bet": { "_id": "...", "status": "pending", "stake": 10, "odds": 2.35, ... },
  "user": { "_id": "...", "balance": 90 },
  "message": "Bet placed successfully"
}
```

Outcome check:
```json
{
  "success": true,
  "data": { "status": "won", "payout": 23.5, "reason": "..." },
  "message": "Bet outcome checked"
}
```

---

## Key Integration Points for Migration
- Maintain existing UI: only switch the backend endpoints/services
- Re-map market IDs/names using a centralized mapping (from `markets.json`)
- Keep `preventConflictingBet` equivalent logic
- Preserve payload shapes used by `placeBetThunk`
- Ensure balance updates and responses match current UI expectations

---

## Quick Reference (File Paths)
- Routes: `server/src/routes/bet.routes.js`
- Controllers: `server/src/controllers/bet.controller.js`
- Services: `server/src/services/bet.service.js`, `server/src/services/betOutcomeCalculation.service.js`, `server/src/services/winningOddsCalculation.service.js`, `server/src/services/baseBetOutcomeCalculation.service.js`, `server/src/services/betOutcomeUtilities.service.js`
- Middleware: `server/src/middlewares/conflictingBet.js`, `server/src/middlewares/auth.js`
- Models: `server/src/models/Bet.js`, `server/src/models/User.js`
- Constants: `server/src/constants/markets.json`
- Frontend: `client/components/BetSlip.jsx`, `client/lib/features/betSlip/betSlipSlice.js`, `client/lib/features/bets/betsSlice.js`, `client/hooks/useBetting.js`

---

Last Updated: 2025-09-17
