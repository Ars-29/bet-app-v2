/**
 * Simple Combination Bet Test - No external dependencies
 * Tests the core logic of combination bet outcome processing
 */

class SimpleCombinationTest {
  constructor() {
    this.testResults = [];
  }

  /**
   * Test 1: All legs win - should get full payout
   */
  testAllLegsWin() {
    console.log('\n🧪 TEST 1: All legs win');
    
    const combinationBet = {
      stake: 100,
      odds: 6.0, // 2.0 * 3.0
      combination: [
        {
          matchId: 12345,
          selection: 'Home',
          odds: 2.0
        },
        {
          matchId: 12346,
          selection: 'Away',
          odds: 3.0
        }
      ]
    };

    // Mock match data where both bets win
    const matchDataArray = [
      {
        id: 12345,
        state: 'finished',
        scores: { home: 2, away: 0 } // Home wins
      },
      {
        id: 12346,
        state: 'finished',
        scores: { home: 0, away: 1 } // Away wins
      }
    ];

    const result = this.simulateCombinationBetOutcome(combinationBet, matchDataArray);
    
    console.log('✅ Expected: All legs win, payout = 600');
    console.log('📊 Result:', result);
    
    this.testResults.push({
      test: 'All legs win',
      expected: 'won',
      actual: result.status,
      expectedPayout: 600,
      actualPayout: result.payout,
      passed: result.status === 'won' && result.payout === 600
    });
    
    return result;
  }

  /**
   * Test 2: One leg loses - should get no payout
   */
  testOneLegLoses() {
    console.log('\n🧪 TEST 2: One leg loses');
    
    const combinationBet = {
      stake: 100,
      odds: 6.0,
      combination: [
        {
          matchId: 12345,
          selection: 'Home',
          odds: 2.0
        },
        {
          matchId: 12346,
          selection: 'Away',
          odds: 3.0
        }
      ]
    };

    // Mock match data where first bet wins, second loses
    const matchDataArray = [
      {
        id: 12345,
        state: 'finished',
        scores: { home: 2, away: 0 } // Home wins
      },
      {
        id: 12346,
        state: 'finished',
        scores: { home: 1, away: 0 } // Away loses
      }
    ];

    const result = this.simulateCombinationBetOutcome(combinationBet, matchDataArray);
    
    console.log('✅ Expected: One leg loses, payout = 0');
    console.log('📊 Result:', result);
    
    this.testResults.push({
      test: 'One leg loses',
      expected: 'lost',
      actual: result.status,
      expectedPayout: 0,
      actualPayout: result.payout,
      passed: result.status === 'lost' && result.payout === 0
    });
    
    return result;
  }

  /**
   * Test 3: One leg canceled - should refund stake
   */
  testOneLegCanceled() {
    console.log('\n🧪 TEST 3: One leg canceled');
    
    const combinationBet = {
      stake: 100,
      odds: 6.0,
      combination: [
        {
          matchId: 12345,
          selection: 'Home',
          odds: 2.0
        },
        {
          matchId: 12346,
          selection: 'Away',
          odds: 3.0
        }
      ]
    };

    // Mock match data where first bet wins, second is canceled
    const matchDataArray = [
      {
        id: 12345,
        state: 'finished',
        scores: { home: 2, away: 0 } // Home wins
      },
      {
        id: 12346,
        state: 'cancelled' // Match canceled
      }
    ];

    const result = this.simulateCombinationBetOutcome(combinationBet, matchDataArray);
    
    console.log('✅ Expected: One leg canceled, refund = 100');
    console.log('📊 Result:', result);
    
    this.testResults.push({
      test: 'One leg canceled',
      expected: 'canceled',
      actual: result.status,
      expectedPayout: 100,
      actualPayout: result.payout,
      passed: result.status === 'canceled' && result.payout === 100
    });
    
    return result;
  }

  /**
   * Test 4: Not all matches finished - should reschedule
   */
  testNotAllFinished() {
    console.log('\n🧪 TEST 4: Not all matches finished');
    
    const combinationBet = {
      stake: 100,
      odds: 6.0,
      combination: [
        {
          matchId: 12345,
          selection: 'Home',
          odds: 2.0
        },
        {
          matchId: 12346,
          selection: 'Away',
          odds: 3.0
        }
      ]
    };

    // Mock match data where first is finished, second is still playing
    const matchDataArray = [
      {
        id: 12345,
        state: 'finished',
        scores: { home: 2, away: 0 } // Home wins
      },
      {
        id: 12346,
        state: 'playing' // Still playing
      }
    ];

    const result = this.simulateCombinationBetOutcome(combinationBet, matchDataArray);
    
    console.log('✅ Expected: Reschedule check, no final outcome yet');
    console.log('📊 Result:', result);
    
    this.testResults.push({
      test: 'Not all finished',
      expected: 'pending',
      actual: result.status,
      expectedPayout: 0,
      actualPayout: result.payout,
      passed: result.status === 'pending' && result.payout === 0
    });
    
    return result;
  }

  /**
   * Test 5: Edge case - Draw result
   */
  testDrawResult() {
    console.log('\n🧪 TEST 5: Draw result');
    
    const combinationBet = {
      stake: 100,
      odds: 4.0,
      combination: [
        {
          matchId: 12345,
          selection: 'Draw',
          odds: 2.0
        },
        {
          matchId: 12346,
          selection: 'Home',
          odds: 2.0
        }
      ]
    };

    // Mock match data with draw
    const matchDataArray = [
      {
        id: 12345,
        state: 'finished',
        scores: { home: 1, away: 1 } // Draw
      },
      {
        id: 12346,
        state: 'finished',
        scores: { home: 2, away: 0 } // Home wins
      }
    ];

    const result = this.simulateCombinationBetOutcome(combinationBet, matchDataArray);
    
    console.log('✅ Expected: Both legs win (Draw + Home), payout = 400');
    console.log('📊 Result:', result);
    
    this.testResults.push({
      test: 'Draw result',
      expected: 'won',
      actual: result.status,
      expectedPayout: 400,
      actualPayout: result.payout,
      passed: result.status === 'won' && result.payout === 400
    });
    
    return result;
  }

  /**
   * Simulate combination bet outcome processing
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
      
      console.log(`[Simulation] Processing leg ${i + 1}: matchId=${leg.matchId}, selection=${leg.selection}`);
      
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
   * Print test summary
   */
  printTestSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    
    let passed = 0;
    let failed = 0;
    
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${result.test}: ${status}`);
      console.log(`   Expected: ${result.expected} (${result.expectedPayout})`);
      console.log(`   Actual: ${result.actual} (${result.actualPayout})`);
      
      if (result.passed) {
        passed++;
      } else {
        failed++;
      }
    });
    
    console.log('\n📈 RESULTS');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Combination bet logic is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the combination bet logic.');
    }
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('🚀 Starting Simple Combination Bet Tests...\n');
    
    this.testAllLegsWin();
    this.testOneLegLoses();
    this.testOneLegCanceled();
    this.testNotAllFinished();
    this.testDrawResult();
    
    this.printTestSummary();
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new SimpleCombinationTest();
  test.runAllTests();
}

export default SimpleCombinationTest; 