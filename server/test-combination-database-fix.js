const mongoose = require('mongoose');
const { UnibetCalcController } = require('./src/controllers/unibetCalc.controller.js');
const Bet = require('./src/models/Bet.js');

async function testCombinationDatabaseFix() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/bet-app');
        console.log('✅ Connected to MongoDB');

        // Find the combination bet that's been processed
        const combinationBet = await Bet.findOne({ 
            'combination': { $exists: true, $ne: [] },
            status: 'pending'
        });

        if (!combinationBet) {
            console.log('❌ No pending combination bets found');
            return;
        }

        console.log('📋 Found combination bet:', {
            id: combinationBet._id,
            status: combinationBet.status,
            payout: combinationBet.payout,
            legs: combinationBet.combination.length,
            userId: combinationBet.userId
        });

        console.log('\n🔍 Before processing - Bet details:');
        console.log('Status:', combinationBet.status);
        console.log('Payout:', combinationBet.payout);
        console.log('Legs:', combinationBet.combination.map(leg => ({
            betOption: leg.betOption,
            odds: leg.odds,
            status: leg.status
        })));

        console.log('\n🚀 Starting combination bet processing...');
        const controller = new UnibetCalcController();
        const result = await controller.processAll();

        console.log('\n📊 Processing result:', JSON.stringify(result, null, 2));

        // Check the bet after processing
        const updatedBet = await Bet.findById(combinationBet._id);
        console.log('\n🔍 After processing - Bet details:');
        console.log('Status:', updatedBet.status);
        console.log('Payout:', updatedBet.payout);
        console.log('Updated At:', updatedBet.updatedAt);
        console.log('Legs:', updatedBet.combination.map(leg => ({
            betOption: leg.betOption,
            odds: leg.odds,
            status: leg.status
        })));

        // Verify the fix
        if (updatedBet.status === 'won' && updatedBet.payout > 0) {
            console.log('\n🎉 SUCCESS! Combination bet processing is working correctly!');
            console.log('✅ Status updated from pending to won');
            console.log('✅ Payout calculated correctly');
            console.log('✅ Database updated successfully');
        } else {
            console.log('\n❌ ISSUE: Database update may not be working properly');
            console.log('Expected: status=won, payout>0');
            console.log('Actual: status=' + updatedBet.status + ', payout=' + updatedBet.payout);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testCombinationDatabaseFix();
