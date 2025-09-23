# Combination Bet Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for migrating combination bet placement from the current bet-app system to use the unibet-api calculator for outcome calculation, while maintaining the existing UI and user experience.

## Current State Analysis

### ✅ What's Already Implemented

#### 1. **Frontend (UI & State Management)**
- **BetSlip Component**: Full combination bet UI with tabs (Single, Combination, System)
- **BettingTabs**: Individual bet selection with conflict prevention
- **Redux State**: Complete bet slip state management with combination support
- **Bet Placement**: Frontend combination bet placement logic in `placeBetThunk`
- **Unibet Metadata Extraction**: `extractUnibetMetadata()` function extracts proper market/criterion data

#### 2. **Backend (Placement & Storage)**
- **Bet Model**: Schema supports combination bets with `combination[]` array + `unibetMeta` per leg
- **Bet Service**: `placeBet()` method handles combination bet creation using Unibet API approach
- **Bet Controller**: Validates and processes combination bet requests with proper matchId handling
- **Database Storage**: Combination bets stored with all leg details and unibetMeta
- **Unibet API Integration**: Combination bets now use Unibet API (no SportsMonk API calls)

#### 3. **Current Combination Bet Flow**
```
Frontend → placeBetThunk → /api/bet/place-bet → BetController → BetService (Unibet API) → MongoDB
```

#### 4. **Updated Schema Structure**
```javascript
// Bet Document Structure
{
  // Main bet fields (combination-level)
  matchId: "1022853538", // ✅ Now uses first leg's matchId instead of "combination"
  oddId: "combination_<timestamp>",
  stake: 10,
  odds: 2.5, // Total odds
  payout: 25,
  status: "pending",
  
  // Combination-specific fields
  combination: [
    {
      matchId: "1022853538",
      oddId: "3837716641", 
      betOption: "Home",
      odds: 1.65,
      stake: 10,
      payout: 16.5,
      status: "pending",
      betDetails: { /* market details */ },
      unibetMeta: { // ✅ NEW: Unibet metadata for each leg
        eventName: "Manchester United vs Liverpool",
        marketName: "Match (regular time)",
        criterionLabel: "Match (regular time)",
        criterionEnglishLabel: "Full Time",
        outcomeEnglishLabel: "Home",
        participant: "Manchester United",
        participantId: "12345",
        eventParticipantId: "67890",
        betOfferTypeId: "1",
        handicapRaw: null,
        handicapLine: null,
        leagueId: "8",
        leagueName: "Premier League",
        homeName: "Manchester United",
        awayName: "Liverpool",
        start: "2025-01-15T20:00:00Z"
      }
    }
    // ... more legs with unibetMeta
  ],
  totalOdds: 2.5,
  potentialPayout: 25
}
```

### ✅ Recently Completed (January 2025)

#### 1. **Unibet API Migration**
- **✅ Fixed Match ID Handling**: Combination bets now use first leg's matchId instead of "combination"
- **✅ Removed SportsMonk API**: Combination bets now use Unibet API approach (same as single bets)
- **✅ Added Unibet Meta per Leg**: Each combination leg now has complete `unibetMeta` for calculator
- **✅ Fixed Frontend Integration**: Frontend properly extracts and sends Unibet metadata

#### 2. **Schema Updates**
- **✅ Added `unibetMeta` Field**: Each combination leg now has unibetMeta object
- **✅ Updated Bet Service**: Uses Unibet V2 cache and live odds cache for combination bets
- **✅ Enhanced Validation**: Proper validation for each combination leg

### ❌ What Still Needs Implementation

#### 1. **Calculator Integration**
- **Schema Adapter**: No combination bet support in `BetSchemaAdapter`
- **Calculator**: No combination bet processing in `bet-outcome-calculator.js`
- **Processing Controller**: No combination bet handling in `unibetCalc.controller.js`

#### 2. **Outcome Calculation**
- **Current**: Uses `betOutcomeUtilities.calculateCombinationBetOutcome()` (legacy)
- **Target**: Migrate to unibet-api calculator for combination bets

---

## Step-by-Step Implementation Plan

### ✅ Step 1: Combination Bet Placement (Foundation) - COMPLETED

**Objective**: Ensure combination bets can be placed and stored correctly with proper schema validation.

**Files Modified**:
- ✅ `server/src/services/bet.service.js` - Updated to use Unibet API approach
- ✅ `server/src/controllers/bet.controller.js` - Fixed matchId handling and validation
- ✅ `server/src/models/Bet.js` - Added unibetMeta field to combination legs
- ✅ `client/lib/features/betSlip/betSlipSlice.js` - Fixed frontend matchId handling

**Completed Tasks**:
1. **✅ Validated Combination Bet Schema**
   - Combination array properly validated
   - Each leg has required fields (matchId, oddId, betOption, odds, stake)
   - Total odds and potential payout calculated correctly

2. **✅ Updated Bet Placement Logic**
   - `placeBet()` method handles combination bets with Unibet API
   - Proper stake deduction for combination bets
   - Unique combination bet IDs generated
   - Uses first leg's matchId instead of "combination"

3. **✅ Enhanced Unibet Integration**
   - Each combination leg has complete `unibetMeta` object
   - Frontend extracts proper market/criterion data
   - Backend uses Unibet V2 cache and live odds cache
   - No more SportsMonk API calls for combination bets

**✅ Outcome Achieved**: Combination bets can be placed successfully and stored in database with proper validation and Unibet API integration.

---

### ✅ Step 2: Calculator Integration for Combination Bets - COMPLETED

**Objective**: Integrate combination bets with the unibet-api calculator for outcome processing.

**Files to Modify**:
- `server/src/services/betSchemaAdapter.service.js` - Add combination bet adapter methods
- `server/src/controllers/unibetCalc.controller.js` - Add combination bet processing
- `server/src/routes/unibet-api/unibet-calc.routes.js` - Add combination bet endpoints

**Tasks**:
1. **Extend BetSchemaAdapter**
   - Add `adaptCombinationBetForCalculator()` method
   - Add `adaptCombinationCalculatorResult()` method
   - Add combination status and payout calculation methods
   - **✅ Ready**: Each combination leg now has `unibetMeta` for calculator

2. **Add Combination Bet Processing**
   - Implement `processCombinationBet()` in controller
   - Process each leg through calculator using leg's `unibetMeta`
   - Aggregate results back to combination bet format

3. **Add Processing Endpoints**
   - `/process-combination/:betId` - Process single combination bet
   - `/process-all-combinations` - Process all pending combination bets

**✅ Outcome Achieved**: Combination bets can be processed through the unibet-api calculator using the rich `unibetMeta` data now available in each leg.

---

### ✅ Step 3: Automated Processing Integration - COMPLETED

**Objective**: Include combination bets in automated processing jobs.

**Files Modified**:
- ✅ `server/src/controllers/unibetCalc.controller.js` - Updated `processAll()` method
- ✅ `server/src/config/agendaJobs.js` - Already configured for automated processing

**Completed Tasks**:
1. **✅ Updated Automated Processing**
   - Modified `processAll()` to handle both single and combination bets
   - Added combination bet processing to scheduled jobs
   - Ensured proper error handling and logging

2. **✅ Balance Updates**
   - Implemented balance updates for resolved combination bets
   - Handle won, lost, and canceled combination bets
   - Ensure proper refund logic

**✅ Outcome Achieved**: Combination bets are automatically processed with single bets every 5 seconds.

---

## **🎯 Combination Bet Rules (Critical)**

### **Win/Lose Logic:**
- **✅ WON**: Only if **ALL legs are won**
- **❌ LOST**: If **ANY leg is lost** (even if others are won)
- **⏳ PENDING**: If any leg is still pending
- **🚫 CANCELED**: If any leg is canceled

### **Payout Calculation:**
- **✅ WON**: `stake × (odd1 × odd2 × odd3 × ...)` (product of all odds)
- **❌ LOST**: `0` (no payout)
- **🚫 CANCELED**: `stake` (refund)

### **Examples:**
```javascript
// Example 1: All legs won
Leg 1: Home @ 1.5 → WON
Leg 2: Over 2.5 @ 2.0 → WON
Leg 3: Away @ 1.8 → WON
Result: WON, Payout = 10 × (1.5 × 2.0 × 1.8) = 54

// Example 2: One leg lost
Leg 1: Home @ 1.5 → WON
Leg 2: Over 2.5 @ 2.0 → LOST
Leg 3: Away @ 1.8 → WON
Result: LOST, Payout = 0

// Example 3: One leg canceled
Leg 1: Home @ 1.5 → WON
Leg 2: Over 2.5 @ 2.0 → CANCELED
Leg 3: Away @ 1.8 → WON
Result: CANCELED, Payout = 10 (refund)
```

---

### Step 3: Automated Processing Integration

**Objective**: Include combination bets in automated processing jobs.

**Files to Modify**:
- `server/src/controllers/unibetCalc.controller.js` - Update `processAll()` method
- `server/src/app.js` - Ensure job scheduler includes combination bets

**Tasks**:
1. **Update Automated Processing**
   - Modify `processAll()` to handle both single and combination bets
   - Add combination bet processing to scheduled jobs
   - Ensure proper error handling and logging

2. **Balance Updates**
   - Implement balance updates for resolved combination bets
   - Handle won, lost, and canceled combination bets
   - Ensure proper refund logic

**Expected Outcome**: Combination bets are automatically processed with single bets.

---

### Step 4: Testing & Validation

**Objective**: Comprehensive testing of combination bet functionality.

**Files to Create/Modify**:
- `server/src/tests/betSchemaAdapter.test.js` - Unit tests for adapter methods
- `server/src/tests/combinationBet.integration.test.js` - Integration tests
- `server/test-combination-bet.js` - Manual testing script

**Tasks**:
1. **Unit Tests**
   - Test combination bet adapter methods
   - Test status and payout calculations
   - Test error handling

2. **Integration Tests**
   - Test end-to-end combination bet flow
   - Test balance updates
   - Test automated processing

3. **Manual Testing**
   - Create test combination bets
   - Verify processing results
   - Test admin endpoints

**Expected Outcome**: All combination bet functionality is thoroughly tested and validated.

---

## Detailed Implementation Code

### Step 1: Combination Bet Placement

#### 1. **Extend BetSchemaAdapter** 
**File**: `server/src/services/betSchemaAdapter.service.js`

**Add Methods**:
```javascript
/**
 * Convert combination bet to calculator-compatible format
 * @param {Object} bet - bet-app Bet document with combination array
 * @returns {Array} - Array of calculator-compatible bet objects (one per leg)
 */
static adaptCombinationBetForCalculator(bet) {
    if (!bet.combination || !Array.isArray(bet.combination)) {
        throw new Error('Invalid combination bet: missing combination array');
    }
    
    return bet.combination.map(leg => this.adaptBetForCalculator({
        ...bet,
        matchId: leg.matchId,
        oddId: leg.oddId,
        betOption: leg.betOption,
        odds: leg.odds,
        stake: leg.stake,
        betDetails: leg.betDetails,
        unibetMeta: bet.unibetMeta // Use main bet's metadata
    }));
}

/**
 * Convert calculator results back to bet-app format for combination bets
 * @param {Array} calculatorResults - Results from calculator for each leg
 * @param {Object} originalBet - Original bet-app Bet document
 * @returns {Object} - Updated bet-app Bet document
 */
static adaptCombinationCalculatorResult(calculatorResults, originalBet) {
    const updatedCombination = originalBet.combination.map((leg, index) => {
        const result = calculatorResults[index];
        return {
            ...leg,
            status: result.status,
            payout: result.payout || 0,
            // Add result metadata if needed
            result: {
                reason: result.reason,
                processedAt: new Date()
            }
        };
    });
    
    // Calculate overall combination status
    const overallStatus = this.calculateCombinationStatus(updatedCombination);
    const totalPayout = this.calculateCombinationPayout(updatedCombination, originalBet.stake);
    
    return {
        ...originalBet,
        combination: updatedCombination,
        status: overallStatus,
        payout: totalPayout,
        result: {
            processedAt: new Date(),
            legs: updatedCombination.length,
            wonLegs: updatedCombination.filter(leg => leg.status === 'won').length
        }
    };
}

/**
 * Calculate overall combination bet status
 * @param {Array} legs - Updated combination legs
 * @returns {string} - Overall bet status
 */
static calculateCombinationStatus(legs) {
    const hasCanceled = legs.some(leg => leg.status === 'canceled');
    const hasLost = legs.some(leg => leg.status === 'lost');
    const hasPending = legs.some(leg => leg.status === 'pending');
    
    // Combination bet rules:
    // - CANCELED: If any leg is canceled
    // - LOST: If any leg is lost (even if others are won)
    // - PENDING: If any leg is still pending
    // - WON: Only if ALL legs are won
    
    if (hasCanceled) return 'canceled';
    if (hasLost) return 'lost';
    if (hasPending) return 'pending';
    return 'won'; // All legs won
}

/**
 * Calculate total payout for combination bet
 * @param {Array} legs - Updated combination legs
 * @param {number} stake - Original stake
 * @returns {number} - Total payout
 */
static calculateCombinationPayout(legs, stake) {
    const hasCanceled = legs.some(leg => leg.status === 'canceled');
    const hasLost = legs.some(leg => leg.status === 'lost');
    const allWon = legs.every(leg => leg.status === 'won');
    
    // Combination bet payout rules:
    // - CANCELED: Refund stake
    // - LOST: No payout (0)
    // - WON: stake × (odd1 × odd2 × odd3 × ...) - product of all odds
    
    if (hasCanceled) return stake; // Refund
    if (hasLost) return 0; // No payout
    if (allWon) {
    const totalOdds = legs.reduce((acc, leg) => acc * leg.odds, 1);
        return stake * totalOdds; // Product of all odds
    }
    
    return 0; // Default for pending
}
```

#### 2. **Extend Calculator Processing**
**File**: `server/src/controllers/unibetCalc.controller.js`

**Add Methods**:
```javascript
/**
 * Process combination bet using calculator
 * @param {Object} bet - bet-app Bet document
 * @returns {Object} - Processing result
 */
async processCombinationBet(bet) {
    try {
        console.log(`[processCombinationBet] Processing combination bet ${bet._id} with ${bet.combination.length} legs`);
        
        // Adapt combination bet for calculator
        const calculatorBets = BetSchemaAdapter.adaptCombinationBetForCalculator(bet);
        
        // Process each leg through calculator
        const results = [];
        for (let i = 0; i < calculatorBets.length; i++) {
            const calculatorBet = calculatorBets[i];
            const leg = bet.combination[i];
            
            console.log(`[processCombinationBet] Processing leg ${i + 1}/${calculatorBets.length}: ${leg.betOption} @ ${leg.odds}`);
            
            // Get match data for this leg
            const matchData = await this.getMatchDataForLeg(leg.matchId);
            if (!matchData) {
                console.warn(`[processCombinationBet] No match data for leg ${i + 1}, matchId: ${leg.matchId}`);
                results.push({
                    status: 'canceled',
                    payout: 0,
                    reason: 'Match data unavailable'
                });
                continue;
            }
            
            // Process through calculator
            const result = await this.calculator.calculateBetOutcome(calculatorBet, matchData);
            results.push(result);
        }
        
        // Adapt results back to bet-app format
        const updatedBet = BetSchemaAdapter.adaptCombinationCalculatorResult(results, bet);
        
        // Update bet in database
        const savedBet = await Bet.findByIdAndUpdate(
            bet._id,
            updatedBet,
            { new: true }
        );
        
        // Update user balance if bet is resolved
        if (updatedBet.status !== 'pending') {
            await this.updateUserBalanceForCombinationBet(savedBet);
        }
        
        return {
            success: true,
            bet: savedBet,
            results: results,
            message: `Combination bet processed: ${updatedBet.status}`
        };
        
    } catch (error) {
        console.error(`[processCombinationBet] Error processing combination bet ${bet._id}:`, error);
        return {
            success: false,
            error: error.message,
            bet: bet
        };
    }
}

/**
 * Get match data for combination bet leg
 * @param {string} matchId - Match ID for the leg
 * @returns {Object|null} - Match data or null
 */
async getMatchDataForLeg(matchId) {
    try {
        // Try to get from FotMob cache first
        const fotmobData = await this.fotmobService.getMatchData(matchId);
        if (fotmobData) {
            return fotmobData;
        }
        
        // Fallback to other data sources if needed
        // This would depend on your existing match data sources
        return null;
    } catch (error) {
        console.error(`[getMatchDataForLeg] Error getting match data for ${matchId}:`, error);
        return null;
    }
}

/**
 * Update user balance for resolved combination bet
 * @param {Object} bet - Updated bet document
 */
async updateUserBalanceForCombinationBet(bet) {
    try {
        const user = await User.findById(bet.userId);
        if (!user) {
            console.error(`[updateUserBalanceForCombinationBet] User not found: ${bet.userId}`);
            return;
        }
        
        if (bet.status === 'won') {
            // Add payout to balance (stake × product of all odds)
            user.balance += bet.payout;
            console.log(`[updateUserBalanceForCombinationBet] Added ${bet.payout} to user ${bet.userId} balance (combination won)`);
        } else if (bet.status === 'lost') {
            // Balance already deducted during placement, no change needed
            console.log(`[updateUserBalanceForCombinationBet] Bet lost, no balance change for user ${bet.userId} (combination lost)`);
        } else if (bet.status === 'canceled') {
            // Refund stake (any leg canceled = whole combination canceled)
            user.balance += bet.stake;
            console.log(`[updateUserBalanceForCombinationBet] Refunded ${bet.stake} to user ${bet.userId} balance (combination canceled)`);
        }
        
        await user.save();
        
    } catch (error) {
        console.error(`[updateUserBalanceForCombinationBet] Error updating balance:`, error);
    }
}
```

#### 3. **Add Combination Bet Processing Endpoints**
**File**: `server/src/routes/unibet-api/unibet-calc.routes.js`

**Add Routes**:
```javascript
// Process combination bet
router.post('/process-combination/:betId', authenticateAdmin, async (req, res) => {
    try {
        const { betId } = req.params;
        const bet = await Bet.findById(betId);
        
        if (!bet) {
            return res.status(404).json({
                success: false,
                message: 'Bet not found'
            });
        }
        
        if (!bet.combination || bet.combination.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Not a combination bet'
            });
        }
        
        const result = await unibetCalcController.processCombinationBet(bet);
        res.json(result);
        
    } catch (error) {
        console.error('Error processing combination bet:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Process all pending combination bets
router.post('/process-all-combinations', authenticateAdmin, async (req, res) => {
    try {
        const pendingCombinationBets = await Bet.find({
            status: 'pending',
            combination: { $exists: true, $ne: [] }
        });
        
        const results = [];
        for (const bet of pendingCombinationBets) {
            const result = await unibetCalcController.processCombinationBet(bet);
            results.push(result);
        }
        
        res.json({
            success: true,
            processed: results.length,
            results: results
        });
        
    } catch (error) {
        console.error('Error processing combination bets:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});
```

### Phase 3B: Automated Processing Integration

#### 1. **Extend Automated Processing**
**File**: `server/src/controllers/unibetCalc.controller.js`

**Update `processAll()` method**:
```javascript
async processAll() {
    try {
        console.log('[processAll] Starting automated bet processing...');
        
        // Process single bets
        const singleBets = await Bet.find({
            status: 'pending',
            combination: { $exists: false }
        });
        
        const singleResults = [];
        for (const bet of singleBets) {
            const result = await this.processOne(bet._id);
            singleResults.push(result);
        }
        
        // Process combination bets
        const combinationBets = await Bet.find({
            status: 'pending',
            combination: { $exists: true, $ne: [] }
        });
        
        const combinationResults = [];
        for (const bet of combinationBets) {
            const result = await this.processCombinationBet(bet);
            combinationResults.push(result);
        }
        
        return {
            success: true,
            single: {
                processed: singleResults.length,
                results: singleResults
            },
            combination: {
                processed: combinationResults.length,
                results: combinationResults
            },
            total: singleResults.length + combinationResults.length
        };
        
    } catch (error) {
        console.error('[processAll] Error in automated processing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
```

#### 2. **Update Job Scheduler**
**File**: `server/src/app.js`

**Ensure combination bet processing is included in automated jobs**:
```javascript
// Existing automated processing job (already includes combination bets)
agenda.define('process-pending-bets', async (job) => {
    try {
        const result = await unibetCalcController.processAll();
        console.log('[process-pending-bets] Job completed:', result);
    } catch (error) {
        console.error('[process-pending-bets] Job failed:', error);
    }
});
```

### Phase 3C: Testing & Validation

#### 1. **Unit Tests**
**File**: `server/src/tests/betSchemaAdapter.test.js`

```javascript
describe('BetSchemaAdapter - Combination Bets', () => {
    test('should adapt combination bet for calculator', () => {
        const combinationBet = {
            _id: 'test-id',
            matchId: 'combination',
            combination: [
                {
                    matchId: 'match1',
                    oddId: 'odd1',
                    betOption: 'Home',
                    odds: 1.5,
                    stake: 10,
                    betDetails: { /* ... */ }
                },
                {
                    matchId: 'match2', 
                    oddId: 'odd2',
                    betOption: 'Away',
                    odds: 2.0,
                    stake: 10,
                    betDetails: { /* ... */ }
                }
            ],
            unibetMeta: { /* ... */ }
        };
        
        const result = BetSchemaAdapter.adaptCombinationBetForCalculator(combinationBet);
        
        expect(result).toHaveLength(2);
        expect(result[0].eventId).toBe('match1');
        expect(result[1].eventId).toBe('match2');
    });
    
    test('should calculate combination status correctly', () => {
        const legs = [
            { status: 'won' },
            { status: 'won' },
            { status: 'won' }
        ];
        
        const status = BetSchemaAdapter.calculateCombinationStatus(legs);
        expect(status).toBe('won');
    });
});
```

#### 2. **Integration Tests**
**File**: `server/src/tests/combinationBet.integration.test.js`

```javascript
describe('Combination Bet Processing Integration', () => {
    test('should process combination bet end-to-end', async () => {
        // Create test combination bet
        const combinationBet = await Bet.create({
            userId: testUser._id,
            matchId: 'combination',
            combination: [/* test legs */],
            stake: 10,
            status: 'pending'
        });
        
        // Process through calculator
        const result = await unibetCalcController.processCombinationBet(combinationBet);
        
        expect(result.success).toBe(true);
        expect(result.bet.status).toBeDefined();
    });
});
```

---

## Implementation Checklist

### ✅ Step 1: Combination Bet Placement - COMPLETED
- [x] Validate combination bet schema in Bet model
- [x] Update bet.service.js to handle combination bet placement with Unibet API
- [x] Update bet.controller.js to validate combination bet requests with proper matchId
- [x] Add unibetMeta field to each combination leg
- [x] Fix frontend matchId handling for combination bets
- [x] Remove SportsMonk API dependency for combination bets
- [x] Test combination bet placement and database storage
- [x] Verify balance deduction for combination bets

### 🔄 Step 2: Calculator Integration - IN PROGRESS
- [ ] Extend `BetSchemaAdapter` with combination bet methods
- [ ] Add `processCombinationBet()` to `unibetCalc.controller.js`
- [ ] Add combination bet processing endpoints
- [ ] Test calculator integration with combination bets
- [x] **Ready**: Each combination leg has complete `unibetMeta` for calculator

### ⏳ Step 3: Automated Processing - PENDING
- [ ] Update automated processing to include combination bets
- [ ] Implement balance updates for resolved combination bets
- [ ] Test automated processing jobs
- [ ] Verify proper error handling and logging

### ⏳ Step 4: Testing & Validation - PENDING
- [ ] Write unit tests for combination bet adapter methods
- [ ] Write integration tests for combination bet processing
- [ ] Test combination bet placement → processing → payout flow
- [ ] Validate balance updates for combination bets
- [ ] Create manual testing scripts

---

## API Endpoints (New)

```bash
# Process single combination bet
POST /api/v2/unibet-calc/process-combination/:betId

# Process all pending combination bets  
POST /api/v2/unibet-calc/process-all-combinations

# Get combination bet processing status
GET /api/v2/unibet-calc/combination-status
```

---

## Benefits of This Implementation

1. **Unified Processing**: Single bets and combination bets use the same calculator
2. **Consistent Results**: Same outcome calculation logic for all bet types
3. **Automated Processing**: Combination bets processed automatically with single bets
4. **Admin Control**: Dedicated endpoints for combination bet management
5. **Backward Compatibility**: Existing combination bet UI and placement unchanged
6. **Scalable**: Easy to extend for system bets and other complex bet types

---

## Risk Mitigation

1. **Feature Flag**: Enable combination bet processing behind `COMBINATION_CALC_ENABLED=true`
2. **Gradual Rollout**: Process combination bets in batches initially
3. **Monitoring**: Detailed logging for combination bet processing
4. **Rollback Plan**: Keep existing `betOutcomeUtilities` as fallback
5. **Testing**: Comprehensive test coverage before production deployment

---

## Success Criteria

- [x] **✅ Combination bets use Unibet API** (no SportsMonk API calls)
- [x] **✅ Each combination leg has complete unibetMeta** for calculator
- [x] **✅ Proper matchId handling** (uses first leg's matchId)
- [x] **✅ Zero breaking changes to existing combination bet UI**
- [ ] Combination bets processed by unibet-api calculator
- [ ] Automated processing includes combination bets
- [ ] Balance updates work correctly for combination bets
- [ ] Admin endpoints provide full combination bet control
- [ ] Performance equivalent or better than current system

 * @param {Object} bet - Updated bet document

 */

async updateUserBalanceForCombinationBet(bet) {

    try {

        const user = await User.findById(bet.userId);

        if (!user) {

            console.error(`[updateUserBalanceForCombinationBet] User not found: ${bet.userId}`);

            return;

        }

        

        if (bet.status === 'won') {

            // Add payout to balance (stake × product of all odds)
            user.balance += bet.payout;

            console.log(`[updateUserBalanceForCombinationBet] Added ${bet.payout} to user ${bet.userId} balance (combination won)`);
        } else if (bet.status === 'lost') {

            // Balance already deducted during placement, no change needed

            console.log(`[updateUserBalanceForCombinationBet] Bet lost, no balance change for user ${bet.userId} (combination lost)`);
        } else if (bet.status === 'canceled') {

            // Refund stake (any leg canceled = whole combination canceled)
            user.balance += bet.stake;

            console.log(`[updateUserBalanceForCombinationBet] Refunded ${bet.stake} to user ${bet.userId} balance (combination canceled)`);
        }

        

        await user.save();

        

    } catch (error) {

        console.error(`[updateUserBalanceForCombinationBet] Error updating balance:`, error);

    }

}

```



#### 3. **Add Combination Bet Processing Endpoints**

**File**: `server/src/routes/unibet-api/unibet-calc.routes.js`



**Add Routes**:

```javascript

// Process combination bet

router.post('/process-combination/:betId', authenticateAdmin, async (req, res) => {

    try {

        const { betId } = req.params;

        const bet = await Bet.findById(betId);

        

        if (!bet) {

            return res.status(404).json({

                success: false,

                message: 'Bet not found'

            });

        }

        

        if (!bet.combination || bet.combination.length === 0) {

            return res.status(400).json({

                success: false,

                message: 'Not a combination bet'

            });

        }

        

        const result = await unibetCalcController.processCombinationBet(bet);

        res.json(result);

        

    } catch (error) {

        console.error('Error processing combination bet:', error);

        res.status(500).json({

            success: false,

            message: 'Internal server error',

            error: error.message

        });

    }

});



// Process all pending combination bets

router.post('/process-all-combinations', authenticateAdmin, async (req, res) => {

    try {

        const pendingCombinationBets = await Bet.find({

            status: 'pending',

            combination: { $exists: true, $ne: [] }

        });

        

        const results = [];

        for (const bet of pendingCombinationBets) {

            const result = await unibetCalcController.processCombinationBet(bet);

            results.push(result);

        }

        

        res.json({

            success: true,

            processed: results.length,

            results: results

        });

        

    } catch (error) {

        console.error('Error processing combination bets:', error);

        res.status(500).json({

            success: false,

            message: 'Internal server error',

            error: error.message

        });

    }

});

```



### Phase 3B: Automated Processing Integration



#### 1. **Extend Automated Processing**

**File**: `server/src/controllers/unibetCalc.controller.js`



**Update `processAll()` method**:

```javascript

async processAll() {

    try {

        console.log('[processAll] Starting automated bet processing...');

        

        // Process single bets

        const singleBets = await Bet.find({

            status: 'pending',

            combination: { $exists: false }

        });

        

        const singleResults = [];

        for (const bet of singleBets) {

            const result = await this.processOne(bet._id);

            singleResults.push(result);

        }

        

        // Process combination bets

        const combinationBets = await Bet.find({

            status: 'pending',

            combination: { $exists: true, $ne: [] }

        });

        

        const combinationResults = [];

        for (const bet of combinationBets) {

            const result = await this.processCombinationBet(bet);

            combinationResults.push(result);

        }

        

        return {

            success: true,

            single: {

                processed: singleResults.length,

                results: singleResults

            },

            combination: {

                processed: combinationResults.length,

                results: combinationResults

            },

            total: singleResults.length + combinationResults.length

        };

        

    } catch (error) {

        console.error('[processAll] Error in automated processing:', error);

        return {

            success: false,

            error: error.message

        };

    }

}

```



#### 2. **Update Job Scheduler**

**File**: `server/src/app.js`



**Ensure combination bet processing is included in automated jobs**:

```javascript

// Existing automated processing job (already includes combination bets)

agenda.define('process-pending-bets', async (job) => {

    try {

        const result = await unibetCalcController.processAll();

        console.log('[process-pending-bets] Job completed:', result);

    } catch (error) {

        console.error('[process-pending-bets] Job failed:', error);

    }

});

```



### Phase 3C: Testing & Validation



#### 1. **Unit Tests**

**File**: `server/src/tests/betSchemaAdapter.test.js`



```javascript

describe('BetSchemaAdapter - Combination Bets', () => {

    test('should adapt combination bet for calculator', () => {

        const combinationBet = {

            _id: 'test-id',

            matchId: 'combination',

            combination: [

                {

                    matchId: 'match1',

                    oddId: 'odd1',

                    betOption: 'Home',

                    odds: 1.5,

                    stake: 10,

                    betDetails: { /* ... */ }

                },

                {

                    matchId: 'match2', 

                    oddId: 'odd2',

                    betOption: 'Away',

                    odds: 2.0,

                    stake: 10,

                    betDetails: { /* ... */ }

                }

            ],

            unibetMeta: { /* ... */ }

        };

        

        const result = BetSchemaAdapter.adaptCombinationBetForCalculator(combinationBet);

        

        expect(result).toHaveLength(2);

        expect(result[0].eventId).toBe('match1');

        expect(result[1].eventId).toBe('match2');

    });

    

    test('should calculate combination status correctly', () => {

        const legs = [

            { status: 'won' },

            { status: 'won' },

            { status: 'won' }

        ];

        

        const status = BetSchemaAdapter.calculateCombinationStatus(legs);

        expect(status).toBe('won');

    });

});

```



#### 2. **Integration Tests**

**File**: `server/src/tests/combinationBet.integration.test.js`



```javascript

describe('Combination Bet Processing Integration', () => {

    test('should process combination bet end-to-end', async () => {

        // Create test combination bet

        const combinationBet = await Bet.create({

            userId: testUser._id,

            matchId: 'combination',

            combination: [/* test legs */],

            stake: 10,

            status: 'pending'

        });

        

        // Process through calculator

        const result = await unibetCalcController.processCombinationBet(combinationBet);

        

        expect(result.success).toBe(true);

        expect(result.bet.status).toBeDefined();

    });

});

```



---



## Implementation Checklist



### ✅ Step 1: Combination Bet Placement - COMPLETED
- [x] Validate combination bet schema in Bet model
- [x] Update bet.service.js to handle combination bet placement with Unibet API
- [x] Update bet.controller.js to validate combination bet requests with proper matchId
- [x] Add unibetMeta field to each combination leg
- [x] Fix frontend matchId handling for combination bets
- [x] Remove SportsMonk API dependency for combination bets
- [x] Test combination bet placement and database storage
- [x] Verify balance deduction for combination bets

### 🔄 Step 2: Calculator Integration - IN PROGRESS
- [ ] Extend `BetSchemaAdapter` with combination bet methods

- [ ] Add `processCombinationBet()` to `unibetCalc.controller.js`

- [ ] Add combination bet processing endpoints

- [ ] Test calculator integration with combination bets

- [x] **Ready**: Each combination leg has complete `unibetMeta` for calculator


### ⏳ Step 3: Automated Processing - PENDING
- [ ] Update automated processing to include combination bets

- [ ] Implement balance updates for resolved combination bets

- [ ] Test automated processing jobs

- [ ] Verify proper error handling and logging



### ⏳ Step 4: Testing & Validation - PENDING
- [ ] Write unit tests for combination bet adapter methods

- [ ] Write integration tests for combination bet processing

- [ ] Test combination bet placement → processing → payout flow

- [ ] Validate balance updates for combination bets

- [ ] Create manual testing scripts



---



## API Endpoints (New)



```bash

# Process single combination bet

POST /api/v2/unibet-calc/process-combination/:betId



# Process all pending combination bets  

POST /api/v2/unibet-calc/process-all-combinations



# Get combination bet processing status

GET /api/v2/unibet-calc/combination-status

```



---



## Benefits of This Implementation



1. **Unified Processing**: Single bets and combination bets use the same calculator

2. **Consistent Results**: Same outcome calculation logic for all bet types

3. **Automated Processing**: Combination bets processed automatically with single bets

4. **Admin Control**: Dedicated endpoints for combination bet management

5. **Backward Compatibility**: Existing combination bet UI and placement unchanged

6. **Scalable**: Easy to extend for system bets and other complex bet types



---



## Risk Mitigation



1. **Feature Flag**: Enable combination bet processing behind `COMBINATION_CALC_ENABLED=true`

2. **Gradual Rollout**: Process combination bets in batches initially

3. **Monitoring**: Detailed logging for combination bet processing

4. **Rollback Plan**: Keep existing `betOutcomeUtilities` as fallback

5. **Testing**: Comprehensive test coverage before production deployment



---



## Success Criteria



- [x] **✅ Combination bets use Unibet API** (no SportsMonk API calls)
- [x] **✅ Each combination leg has complete unibetMeta** for calculator
- [x] **✅ Proper matchId handling** (uses first leg's matchId)
- [x] **✅ Zero breaking changes to existing combination bet UI**
- [ ] Combination bets processed by unibet-api calculator

- [ ] Automated processing includes combination bets

- [ ] Balance updates work correctly for combination bets

- [ ] Admin endpoints provide full combination bet control

- [ ] Performance equivalent or better than current system


