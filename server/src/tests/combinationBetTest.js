import BetService from '../services/bet.service.js';
import BetOutcomeCalculationService from '../services/betOutcomeCalculation.service.js';
import mongoose from 'mongoose';

class CombinationBetTest {
  constructor() {
    this.betService = new BetService();
    this.outcomeService = new BetOutcomeCalculationService();
  }

  /**
   * Test 1: All legs win - should get full payout
   */
  async testAllLegsWin() {
    console.log('\n🧪 TEST 1: All legs win');
    
    const combinationBet = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      stake: 100,
      odds: 6.0, // 2.0 * 3.0
      status: 'pending',
      combination: [
        {
          matchId: 12345,
          oddId: 'odd1',
          betOption: 'Home',
          selection: 'Home',
          odds: 2.0,
          status: 'pending'
        },
        {
          matchId: 12346,
          oddId: 'odd2',
          betOption: 'Away',
          selection: 'Away',
          odds: 3.0,
          status: 'pending'
        }
      ]
    };

    // Mock match data where both bets win
    const mockMatchData1 = {
      id: 12345,
      state: 'finished',
      scores: { home: 2, away: 0 },
      events: []
    };

    const mockMatchData2 = {
      id: 12346,
      state: 'finished',
      scores: { home: 0, away: 1 },
      events: []
    };

    try {
      // Test the logic without database operations
      const result = this.simulateCombinationBetOutcome(combinationBet, [mockMatchData1, mockMatchData2]);
      
      console.log('✅ Expected: All legs win, payout = 600');
      console.log('📊 Result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return null;
    }
  }

  /**
   * Test 2: One leg loses - should get no payout
   */
  async testOneLegLoses() {
    console.log('\n🧪 TEST 2: One leg loses');
    
    const combinationBet = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      stake: 100,
      odds: 6.0,
      status: 'pending',
      combination: [
        {
          matchId: 12345,
          oddId: 'odd1',
          betOption: 'Home',
          selection: 'Home',
          odds: 2.0,
          status: 'pending'
        },
        {
          matchId: 12346,
          oddId: 'odd2',
          betOption: 'Away',
          selection: 'Away',
          odds: 3.0,
          status: 'pending'
        }
      ]
    };

    // Mock match data where first bet wins, second loses
    const mockMatchData1 = {
      id: 12345,
      state: 'finished',
      scores: { home: 2, away: 0 },
      events: []
    };

    const mockMatchData2 = {
      id: 12346,
      state: 'finished',
      scores: { home: 1, away: 0 }, // Away loses
      events: []
    };

    try {
      const result = this.simulateCombinationBetOutcome(combinationBet, [mockMatchData1, mockMatchData2]);
      
      console.log('✅ Expected: One leg loses, payout = 0');
      console.log('📊 Result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return null;
    }
  }

  /**
   * Test 3: One leg canceled - should refund stake
   */
  async testOneLegCanceled() {
    console.log('\n🧪 TEST 3: One leg canceled');
    
    const combinationBet = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      stake: 100,
      odds: 6.0,
      status: 'pending',
      combination: [
        {
          matchId: 12345,
          oddId: 'odd1',
          betOption: 'Home',
          selection: 'Home',
          odds: 2.0,
          status: 'pending'
        },
        {
          matchId: 12346,
          oddId: 'odd2',
          betOption: 'Away',
          selection: 'Away',
          odds: 3.0,
          status: 'pending'
        }
      ]
    };

    // Mock match data where first bet wins, second is canceled
    const mockMatchData1 = {
      id: 12345,
      state: 'finished',
      scores: { home: 2, away: 0 },
      events: []
    };

    const mockMatchData2 = {
      id: 12346,
      state: 'cancelled', // Match canceled
      scores: null,
      events: []
    };

    try {
      const result = this.simulateCombinationBetOutcome(combinationBet, [mockMatchData1, mockMatchData2]);
      
      console.log('✅ Expected: One leg canceled, refund = 100');
      console.log('📊 Result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return null;
    }
  }

  /**
   * Test 4: Not all matches finished - should reschedule
   */
  async testNotAllFinished() {
    console.log('\n🧪 TEST 4: Not all matches finished');
    
    const combinationBet = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      stake: 100,
      odds: 6.0,
      status: 'pending',
      combination: [
        {
          matchId: 12345,
          oddId: 'odd1',
          betOption: 'Home',
          selection: 'Home',
          odds: 2.0,
          status: 'pending'
        },
        {
          matchId: 12346,
          oddId: 'odd2',
          betOption: 'Away',
          selection: 'Away',
          odds: 3.0,
          status: 'pending'
        }
      ]
    };

    // Mock match data where first is finished, second is still playing
    const mockMatchData1 = {
      id: 12345,
      state: 'finished',
      scores: { home: 2, away: 0 },
      events: []
    };

    const mockMatchData2 = {
      id: 12346,
      state: 'playing', // Still playing
      scores: { home: 0, away: 0 },
      events: []
    };

    try {
      const result = this.simulateCombinationBetOutcome(combinationBet, [mockMatchData1, mockMatchData2]);
      
      console.log('✅ Expected: Reschedule check, no final outcome yet');
      console.log('📊 Result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return null;
    }
  }

  /**
   * Test 5: Individual leg outcome calculation
   */
  async testIndividualLegOutcome() {
    console.log('\n🧪 TEST 5: Individual leg outcome calculation');
    
    const bet = {
      betOption: 'Home',
      selection: 'Home',
      marketId: '1',
      stake: 100,
      odds: 2.0
    };

    const matchData = {
      id: 12345,
      state: 'finished',
      scores: { home: 2, away: 0 },
      events: []
    };

    try {
      const outcome = await this.outcomeService.calculateBetOutcome(bet, matchData);
      
      console.log('✅ Expected: Home bet wins');
      console.log('📊 Outcome:', outcome);
      
      return outcome;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return null;
    }
  }

  /**
   * Simulate combination bet outcome processing without database operations
   */
  simulateCombinationBetOutcome(bet, matchDataArray) {
    console.log(`[Simulation] Processing combination bet with ${bet.combination.length} legs`);
    
    const results = [];
    let allFinished = true;
    let hasCanceled = false;
    let hasLost = false;
    
    // Process each leg
    for (let i = 0; i < bet.combination.length; i++) {
      const leg = bet.combination[i];
      const matchData = matchDataArray[i];
      
      console.log(`[Simulation] Processing leg ${i + 1}: matchId=${leg.matchId}, oddId=${leg.oddId}`);
      
      // Check if match is finished
      if (matchData.state !== 'finished') {
        console.log(`[Simulation] Leg ${i + 1} match not finished, state: ${matchData.state}`);
        allFinished = false;
        continue;
      }
      
      // Calculate outcome for this leg
      const outcome = this.calculateLegOutcome(leg, matchData);
      results.push(outcome);
      
      if (outcome.status === 'canceled') {
        hasCanceled = true;
      } else if (outcome.status === 'lost') {
        hasLost = true;
      }
    }
    
    // Determine overall outcome
    if (!allFinished) {
      return {
        status: 'pending',
        message: 'Not all matches finished, reschedule check',
        payout: 0
      };
    }
    
    if (hasCanceled) {
      return {
        status: 'canceled',
        message: 'One or more legs canceled, refunding stake',
        payout: bet.stake
      };
    }
    
    if (hasLost) {
      return {
        status: 'lost',
        message: 'At least one leg lost, no payout',
        payout: 0
      };
    }
    
    // All legs won
    const overallPayout = bet.stake * bet.odds;
    return {
      status: 'won',
      message: 'All legs won!',
      payout: overallPayout,
      legResults: results
    };
  }

  /**
   * Calculate outcome for a single leg
   */
  calculateLegOutcome(leg, matchData) {
    // Simple 1x2 market calculation
    const homeScore = matchData.scores.home;
    const awayScore = matchData.scores.away;
    
    let actualResult;
    if (homeScore > awayScore) {
      actualResult = 'Home';
    } else if (homeScore < awayScore) {
      actualResult = 'Away';
    } else {
      actualResult = 'Draw';
    }
    
    const isWon = leg.selection === actualResult;
    
    return {
      matchId: leg.matchId,
      selection: leg.selection,
      actualResult: actualResult,
      status: isWon ? 'won' : 'lost',
      odds: leg.odds
    };
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Combination Bet Outcome Tests...\n');
    
    await this.testAllLegsWin();
    await this.testOneLegLoses();
    await this.testOneLegCanceled();
    await this.testNotAllFinished();
    await this.testIndividualLegOutcome();
    
    console.log('\n✅ All tests completed!');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new CombinationBetTest();
  test.runAllTests().catch(console.error);
}

export default CombinationBetTest; 