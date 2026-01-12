import mongoose from 'mongoose';

const leagueMappingSchema = new mongoose.Schema({
    unibetId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    unibetName: {
        type: String,
        required: true
    },
    fotmobId: {
        type: Number,
        required: true,
        index: true
        // ✅ REMOVED: unique: true - Allow multiple Unibet IDs to map to one Fotmob ID
    },
    fotmobName: {
        type: String,
        required: true
    },
    matchType: {
        type: String,
        enum: ['Exact Match', 'Different Name'],
        required: true
    },
    country: {
        type: String,
        default: ''
    },
    unibetUrl: {
        type: String,
        default: ''
    },
    fotmobUrl: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
leagueMappingSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Compound index (non-unique) to support multiple unibetIds per fotmobId
leagueMappingSchema.index({ unibetId: 1, fotmobId: 1 });
// Index for querying by fotmobId (for finding all unibetIds mapped to a fotmobId)
leagueMappingSchema.index({ fotmobId: 1 });

const LeagueMapping = mongoose.model('LeagueMapping', leagueMappingSchema);

export default LeagueMapping;
