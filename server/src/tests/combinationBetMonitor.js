import BetService from '../services/bet.service.js';
import mongoose from 'mongoose';

class CombinationBetMonitor {
  constructor() {
    this.betService = new BetService();
    this.monitoredBets = new Map();
  }

  /**
   * Monitor a specific combination bet
   */
  async monitorBet(betId) {
    console.log(`🔍 Starting monitoring for bet: ${betId}`);
    
    try {
      // Fetch the bet from database
      const bet = await this.betService.getBetById(betId);
      
      if (!bet) {
        console.log('❌ Bet not found');
        return;
      }

      if (!bet.combination || bet.combination.length === 0) {
        console.log('❌ Not a combination bet');
        return;
      }

      console.log(`📊 Combination bet details:`);
      console.log(`   Stake: ${bet.stake}`);
      console.log(`   Total Odds: ${bet.odds}`);
      console.log(`   Potential Payout: ${bet.stake * bet.odds}`);
      console.log(`   Number of legs: ${bet.combination.length}`);
      console.log(`   Status: ${bet.status}`);

      console.log('\n📋 Individual legs:');
      bet.combination.forEach((leg, index) => {
        console.log(`   Leg ${index + 1}:`);
        console.log(`     Match ID: ${leg.matchId}`);
        console.log(`     Selection: ${leg.selection}`);
        console.log(`     Odds: ${leg.odds}`);
        console.log(`     Status: ${leg.status}`);
      });

      // Store for continuous monitoring
      this.monitoredBets.set(betId, bet);

      return bet;
    } catch (error) {
      console.error('❌ Error monitoring bet:', error);
      return null;
    }
  }

  /**
   * Check the current status of all monitored bets
   */
  async checkAllMonitoredBets() {
    console.log('\n🔄 Checking all monitored bets...');
    
    for (const [betId, bet] of this.monitoredBets) {
      await this.checkBetStatus(betId);
    }
  }

  /**
   * Check status of a specific bet
   */
  async checkBetStatus(betId) {
    try {
      const currentBet = await this.betService.getBetById(betId);
      
      if (!currentBet) {
        console.log(`❌ Bet ${betId} no longer exists`);
        this.monitoredBets.delete(betId);
        return;
      }

      const originalBet = this.monitoredBets.get(betId);
      
      console.log(`\n📊 Bet ${betId} status update:`);
      console.log(`   Overall Status: ${currentBet.status}`);
      console.log(`   Payout: ${currentBet.payout || 0}`);
      
      if (currentBet.combination) {
        console.log('   Leg statuses:');
        currentBet.combination.forEach((leg, index) => {
          const originalLeg = originalBet.combination[index];
          const statusChanged = originalLeg.status !== leg.status;
          const statusIcon = statusChanged ? '🔄' : '   ';
          
          console.log(`     ${statusIcon} Leg ${index + 1}: ${leg.status} (was: ${originalLeg.status})`);
        });
      }

      // Update stored bet
      this.monitoredBets.set(betId, currentBet);

      // Check if bet is completed
      if (currentBet.status === 'won' || currentBet.status === 'lost' || currentBet.status === 'canceled') {
        console.log(`✅ Bet ${betId} completed with status: ${currentBet.status}`);
        this.monitoredBets.delete(betId);
      }

    } catch (error) {
      console.error(`❌ Error checking bet ${betId}:`, error);
    }
  }

  /**
   * Monitor combination bets in real-time
   */
  async startRealTimeMonitoring(intervalMs = 30000) { // Check every 30 seconds
    console.log(`🚀 Starting real-time monitoring (checking every ${intervalMs/1000} seconds)...`);
    
    const interval = setInterval(async () => {
      if (this.monitoredBets.size === 0) {
        console.log('📭 No bets to monitor, stopping...');
        clearInterval(interval);
        return;
      }
      
      await this.checkAllMonitoredBets();
    }, intervalMs);

    return interval;
  }

  /**
   * Get all pending combination bets from database
   */
  async getPendingCombinationBets() {
    try {
      const pendingBets = await this.betService.getPendingCombinationBets();
      
      console.log(`📋 Found ${pendingBets.length} pending combination bets:`);
      
      pendingBets.forEach((bet, index) => {
        console.log(`   ${index + 1}. Bet ID: ${bet._id}`);
        console.log(`      Stake: ${bet.stake}, Odds: ${bet.odds}`);
        console.log(`      Legs: ${bet.combination.length}`);
        console.log(`      Created: ${bet.createdAt}`);
      });

      return pendingBets;
    } catch (error) {
      console.error('❌ Error fetching pending combination bets:', error);
      return [];
    }
  }

  /**
   * Analyze a completed combination bet
   */
  async analyzeCompletedBet(betId) {
    try {
      const bet = await this.betService.getBetById(betId);
      
      if (!bet) {
        console.log('❌ Bet not found');
        return;
      }

      if (bet.status === 'pending') {
        console.log('⚠️ Bet is still pending');
        return;
      }

      console.log(`\n📊 Analysis of completed bet ${betId}:`);
      console.log(`   Final Status: ${bet.status}`);
      console.log(`   Stake: ${bet.stake}`);
      console.log(`   Total Odds: ${bet.odds}`);
      console.log(`   Payout: ${bet.payout || 0}`);
      console.log(`   Expected Payout: ${bet.stake * bet.odds}`);

      if (bet.combination) {
        console.log('\n   Leg Analysis:');
        bet.combination.forEach((leg, index) => {
          console.log(`     Leg ${index + 1}:`);
          console.log(`       Match: ${leg.matchId}`);
          console.log(`       Selection: ${leg.selection}`);
          console.log(`       Odds: ${leg.odds}`);
          console.log(`       Status: ${leg.status}`);
          console.log(`       Outcome: ${leg.outcome || 'N/A'}`);
        });
      }

      // Calculate expected vs actual
      const expectedPayout = bet.stake * bet.odds;
      const actualPayout = bet.payout || 0;
      
      if (bet.status === 'won' && actualPayout !== expectedPayout) {
        console.log(`⚠️ PAYOUT MISMATCH: Expected ${expectedPayout}, got ${actualPayout}`);
      } else if (bet.status === 'won') {
        console.log(`✅ Payout correct: ${actualPayout}`);
      }

    } catch (error) {
      console.error('❌ Error analyzing bet:', error);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new CombinationBetMonitor();
  
  const command = process.argv[2];
  const betId = process.argv[3];

  switch (command) {
    case 'monitor':
      if (!betId) {
        console.log('Usage: node combinationBetMonitor.js monitor <betId>');
        process.exit(1);
      }
      monitor.monitorBet(betId).then(() => {
        monitor.startRealTimeMonitoring();
      });
      break;
      
    case 'pending':
      monitor.getPendingCombinationBets();
      break;
      
    case 'analyze':
      if (!betId) {
        console.log('Usage: node combinationBetMonitor.js analyze <betId>');
        process.exit(1);
      }
      monitor.analyzeCompletedBet(betId);
      break;
      
    default:
      console.log('Available commands:');
      console.log('  monitor <betId> - Monitor a specific combination bet');
      console.log('  pending - Show all pending combination bets');
      console.log('  analyze <betId> - Analyze a completed combination bet');
  }
}

export default CombinationBetMonitor; 