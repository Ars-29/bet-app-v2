import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: String,
        required: true
    },
    selection: {
        type: String,
        required: true
    },
    stake: {
        type: Number,
        required: true,
        min: 0
    },
    odds: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'won', 'lost', 'cancelled'],
        default: 'pending'
    },
    result: {
        type: String,
        enum: ['win', 'loss', 'push', 'cancelled'],
        default: null
    },
    settledAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
betSchema.index({ userId: 1, createdAt: -1 });
betSchema.index({ status: 1 });
betSchema.index({ event: 'text', selection: 'text' });

const Bet = mongoose.model('Bet', betSchema);

export default Bet; 