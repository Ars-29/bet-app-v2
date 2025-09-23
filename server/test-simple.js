console.log('Test script starting...');

try {
    console.log('Testing import...');
    import('./src/services/betSchemaAdapter.service.js').then(module => {
        console.log('✅ BetSchemaAdapter imported successfully');
        console.log('Available methods:', Object.getOwnPropertyNames(module.BetSchemaAdapter));
        console.log('Static methods:', Object.getOwnPropertyNames(module.BetSchemaAdapter.prototype));
        
        // Test a static method
        try {
            const testBet = { combination: [{ status: 'won', odds: 1.5 }, { status: 'won', odds: 2.0 }] };
            const status = module.BetSchemaAdapter.calculateCombinationStatus(testBet.combination);
            console.log('✅ Static method test:', status);
        } catch (error) {
            console.error('❌ Static method test failed:', error.message);
        }
    }).catch(error => {
        console.error('❌ Import failed:', error);
    });
} catch (error) {
    console.error('❌ Error:', error);
}

console.log('Test script completed');
