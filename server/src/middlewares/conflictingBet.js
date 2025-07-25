import Bet from '../models/Bet.js';

export const preventConflictingBet = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { matchId, marketId } = req.body;
    if (!userId || !matchId || !marketId) {
      return res.status(400).json({ error: 'Missing userId, matchId, or marketId for conflict check.' });
    }
    // Check for any pending bet by this user on this match and market
    const existingBet = await Bet.findOne({
      userId,
      matchId,
      'betDetails.market_id': marketId,
      status: 'pending'
    });
    console.log( "THIS IS FROM MIDDLEWARE" , existingBet);
    
    if (existingBet) {
      return res.status(400).json({success:false,message: "You already have a pending bet on this market for this match" });
    }
    next();
  } catch (err) {
    next(err);
  }
}; 