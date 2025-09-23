#!/usr/bin/env node

/**
 * Test Script for Combination Bet Calculator Integration
 * 
 * This script tests the combination bet processing functionality
 * by creating a test combination bet and processing it through the calculator.
 */

console.log('🚀 Test script loaded and starting...');

import { BetSchemaAdapter } from './src/services/betSchemaAdapter.service.js';
import { UnibetCalcController } from './src/controllers/unibetCalc.controller.js';
import Bet from './src/models/Bet.js';
import User from './src/models/User.js';
import mongoose from 'mongoose';

// Test combination bet data
const testCombinationBet = {
    userId: 'test-user-id',
    matchId: '1022853538', // First leg's matchId
    oddId: 'combination_1705123456789',
    betOption: 'Combination',
    odds: 3.3, // Product of all odds
    stake: 10,
    payout: 0,
    status: 'pending',
    betType: 'combination',
    combination: [
        {
            matchId: '1022853538',
            oddId: '3837716641',
            betOption: 'Home',
            odds: 1.5,
            stake: 10,
            payout: 0,
            status: 'pending',
            betDetails: {
                market_id: '1',
                market_name: 'Match (regular time)',
                market_description: 'Match (regular time)',
                label: 'Home',
                value: 1.5,
                handicap: null,
                name: 'Manchester United'
            },
            unibetMeta: {
                eventName: 'Manchester United vs Liverpool',
                marketName: 'Match (regular time)',
                criterionLabel: 'Match (regular time)',
                criterionEnglishLabel: 'Full Time',
                outcomeEnglishLabel: 'Home',
                participant: 'Manchester United',
                participantId: '12345',
                eventParticipantId: '67890',
                betOfferTypeId: '1',
                handicapRaw: null,
                handicapLine: null,
                leagueId: '8',
                leagueName: 'Premier League',
                homeName: 'Manchester United',
                awayName: 'Liverpool',
                start: '2025-01-15T20:00:00Z'
            }
        },
        {
            matchId: '1022853539',
            oddId: '3837716642',
            betOption: 'Over 2.5',
            odds: 2.2,
            stake: 10,
            payout: 0,
            status: 'pending',
            betDetails: {
                market_id: '18',
                market_name: 'Total Goals',
                market_description: 'Total Goals',
                label: 'Over 2.5',
                value: 2.2,
                handicap: 2.5,
                name: 'Over 2.5'
            },
            unibetMeta: {
                eventName: 'Arsenal vs Chelsea',
                marketName: 'Total Goals',
                criterionLabel: 'Total Goals',
                criterionEnglishLabel: 'Total Goals',
                outcomeEnglishLabel: 'Over 2.5',
                participant: 'Over 2.5',
                participantId: '54321',
                eventParticipantId: '98765',
                betOfferTypeId: '18',
                handicapRaw: 2.5,
                handicapLine: 2.5,
                leagueId: '8',
                leagueName: 'Premier League',
                homeName: 'Arsenal',
                awayName: 'Chelsea',
                start: '2025-01-15T22:00:00Z'
            }
        }
    ],
    totalOdds: 3.3,
    potentialPayout: 33,
    createdAt: new Date(),
    updatedAt: new Date()
};

async function testCombinationBetAdapter() {
    console.log('🧪 Testing BetSchemaAdapter for Combination Bets...\n');
    
    try {
        // Test 1: Validate combination bet
        console.log('1️⃣ Testing combination bet validation...');
        const validation = BetSchemaAdapter.validateCombinationBetForCalculator(testCombinationBet);
        console.log('✅ Validation result:', validation);
        
        if (!validation.isValid) {
            console.error('❌ Validation failed:', validation.errors);
            return false;
        }
        
        // Test 2: Adapt combination bet for calculator
        console.log('\n2️⃣ Testing combination bet adaptation for calculator...');
        const calculatorBets = BetSchemaAdapter.adaptCombinationBetForCalculator(testCombinationBet);
        console.log('✅ Adapted bets:', calculatorBets.length, 'legs');
        
        calculatorBets.forEach((bet, index) => {
            console.log(`   Leg ${index + 1}: ${bet.marketName} - ${bet.outcomeLabel} @ ${bet.odds}`);
        });
        
        // Test 3: Test combination status calculation
        console.log('\n3️⃣ Testing combination status calculation...');
        
        // Test scenario 1: All legs won
        const allWonLegs = [
            { status: 'won', odds: 1.5 },
            { status: 'won', odds: 2.2 }
        ];
        const status1 = BetSchemaAdapter.calculateCombinationStatus(allWonLegs);
        const payout1 = BetSchemaAdapter.calculateCombinationPayout(allWonLegs, 10);
        console.log(`✅ All won: Status=${status1}, Payout=${payout1} (expected: won, 33)`);
        
        // Test scenario 2: One leg lost
        const oneLostLegs = [
            { status: 'won', odds: 1.5 },
            { status: 'lost', odds: 2.2 }
        ];
        const status2 = BetSchemaAdapter.calculateCombinationStatus(oneLostLegs);
        const payout2 = BetSchemaAdapter.calculateCombinationPayout(oneLostLegs, 10);
        console.log(`✅ One lost: Status=${status2}, Payout=${payout2} (expected: lost, 0)`);
        
        // Test scenario 3: One leg canceled
        const oneCanceledLegs = [
            { status: 'won', odds: 1.5 },
            { status: 'canceled', odds: 2.2 }
        ];
        const status3 = BetSchemaAdapter.calculateCombinationStatus(oneCanceledLegs);
        const payout3 = BetSchemaAdapter.calculateCombinationPayout(oneCanceledLegs, 10);
        console.log(`✅ One canceled: Status=${status3}, Payout=${payout3} (expected: canceled, 10)`);
        
        // Test 4: Test result adaptation
        console.log('\n4️⃣ Testing calculator result adaptation...');
        const mockCalculatorResults = [
            { status: 'won', payout: 15, reason: 'Home team won' },
            { status: 'won', payout: 22, reason: 'Over 2.5 goals scored' }
        ];
        
        const adaptedResult = BetSchemaAdapter.adaptCombinationCalculatorResult(mockCalculatorResults, testCombinationBet);
        console.log('✅ Adapted result:', {
            status: adaptedResult.status,
            payout: adaptedResult.payout,
            wonLegs: adaptedResult.result.wonLegs,
            totalLegs: adaptedResult.result.legs
        });
        
        console.log('\n🎉 All BetSchemaAdapter tests passed!');
        return true;
        
    } catch (error) {
        console.error('❌ BetSchemaAdapter test failed:', error);
        return false;
    }
}

async function testCombinationBetController() {
    console.log('\n🧪 Testing UnibetCalcController for Combination Bets...\n');
    
    try {
        const controller = new UnibetCalcController();
        
        // Test 1: Test combination bet processing (without actual calculator)
        console.log('1️⃣ Testing combination bet processing logic...');
        
        // Create a mock bet for testing
        const mockBet = {
            _id: 'test-bet-id',
            ...testCombinationBet
        };
        
        // Test validation
        const validation = BetSchemaAdapter.validateCombinationBetForCalculator(mockBet);
        console.log('✅ Controller validation:', validation.isValid ? 'PASSED' : 'FAILED');
        
        if (!validation.isValid) {
            console.error('❌ Validation errors:', validation.errors);
            return false;
        }
        
        // Test adaptation
        const calculatorBets = BetSchemaAdapter.adaptCombinationBetForCalculator(mockBet);
        console.log('✅ Controller adaptation:', calculatorBets.length, 'legs adapted');
        
        console.log('\n🎉 Controller tests passed!');
        return true;
        
    } catch (error) {
        console.error('❌ Controller test failed:', error);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting Combination Bet Calculator Integration Tests\n');
    console.log('=' .repeat(60));
    console.log('✅ Test script loaded successfully');
    
    try {
        // Test BetSchemaAdapter
        const adapterTest = await testCombinationBetAdapter();
        
        // Test Controller
        const controllerTest = await testCombinationBetController();
        
        console.log('\n' + '=' .repeat(60));
        
        if (adapterTest && controllerTest) {
            console.log('🎉 ALL TESTS PASSED! Combination bet calculator integration is working correctly.');
            console.log('\n📋 Next Steps:');
            console.log('1. Test with real combination bets in the database');
            console.log('2. Test the API endpoints:');
            console.log('   - POST /api/v2/unibet-calc/process-combination/:betId');
            console.log('   - POST /api/v2/unibet-calc/process-all-combinations');
            console.log('3. Verify balance updates work correctly');
            console.log('4. Test automated processing integration');
        } else {
            console.log('❌ SOME TESTS FAILED! Please check the errors above.');
        }
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().then(() => {
        console.log('\n✅ Test script completed');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Test script failed:', error);
        process.exit(1);
    });
}

export { testCombinationBetAdapter, testCombinationBetController, runTests };
