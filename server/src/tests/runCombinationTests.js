import CombinationBetTest from './combinationBetTest.js';
import CombinationBetMonitor from './combinationBetMonitor.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class TestRunner {
  constructor() {
    this.testSuite = new CombinationBetTest();
    this.monitor = new CombinationBetMonitor();
  }

  async connectToDatabase() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bet-app';
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  async disconnectFromDatabase() {
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  async runUnitTests() {
    console.log('\n🧪 Running Unit Tests...');
    await this.testSuite.runAllTests();
  }

  async runDatabaseTests() {
    console.log('\n🗄️ Running Database Tests...');
    
    try {
      // Test 1: Get pending combination bets
      console.log('\n📋 Test: Get pending combination bets');
      const pendingBets = await this.monitor.getPendingCombinationBets();
      console.log(`Found ${pendingBets.length} pending combination bets`);

      // Test 2: Get completed combination bets
      console.log('\n📋 Test: Get completed combination bets');
      const completedBets = await this.monitor.getCompletedCombinationBets(10);
      console.log(`Found ${completedBets.length} completed combination bets`);

      // Test 3: Analyze a completed bet if available
      if (completedBets.length > 0) {
        console.log('\n📋 Test: Analyze completed bet');
        const betToAnalyze = completedBets[0];
        await this.monitor.analyzeCompletedBet(betToAnalyze._id);
      }

    } catch (error) {
      console.error('❌ Database tests failed:', error);
    }
  }

  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...');
    
    try {
      // Test 1: Monitor a real combination bet if available
      const pendingBets = await this.monitor.getPendingCombinationBets();
      
      if (pendingBets.length > 0) {
        console.log('\n📋 Test: Monitor real combination bet');
        const betToMonitor = pendingBets[0];
        await this.monitor.monitorBet(betToMonitor._id);
        
        // Monitor for 1 minute
        console.log('Monitoring for 60 seconds...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
        // Check status
        await this.monitor.checkBetStatus(betToMonitor._id);
      } else {
        console.log('No pending combination bets to monitor');
      }

    } catch (error) {
      console.error('❌ Integration tests failed:', error);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Combination Bet Tests...\n');
    
    try {
      await this.connectToDatabase();
      
      // Run different types of tests
      await this.runUnitTests();
      await this.runDatabaseTests();
      await this.runIntegrationTests();
      
      console.log('\n✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.disconnectFromDatabase();
    }
  }

  async runSpecificTest(testType) {
    console.log(`🚀 Running ${testType} tests...\n`);
    
    try {
      await this.connectToDatabase();
      
      switch (testType) {
        case 'unit':
          await this.runUnitTests();
          break;
        case 'database':
          await this.runDatabaseTests();
          break;
        case 'integration':
          await this.runIntegrationTests();
          break;
        default:
          console.log('Unknown test type. Available: unit, database, integration');
      }
      
    } catch (error) {
      console.error('❌ Tests failed:', error);
    } finally {
      await this.disconnectFromDatabase();
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  
  const testType = process.argv[2];
  
  if (testType) {
    runner.runSpecificTest(testType);
  } else {
    runner.runAllTests();
  }
}

export default TestRunner; 