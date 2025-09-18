import Bet from '../models/Bet.js';

export const preventConflictingBet = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let betsToCheck = [];

    console.log('[conflictingBet] Request body:', JSON.stringify(req.body, null, 2));

    // Determine the bets/legs to check based on request structure
    if (req.body.combinationData && Array.isArray(req.body.combinationData)) {
      // Combination bet - check all legs
      betsToCheck = req.body.combinationData;
      console.log('[conflictingBet] Processing combination bet with', betsToCheck.length, 'legs');
    } else if (Array.isArray(req.body)) {
      // Array of bets
      betsToCheck = req.body;
      console.log('[conflictingBet] Processing array of', betsToCheck.length, 'bets');
    } else {
      // Single bet
      betsToCheck = [req.body];
      console.log('[conflictingBet] Processing single bet');
    }

    // Check for missing required fields in any bet (with graceful market key inference)
    for (const bet of betsToCheck) {
      const inferredMarketKey = bet.marketId || bet.betDetails?.market_id || bet.betDetails?.marketId || bet.betDetails?.market_description || bet.betDetails?.market_name || bet.betDetails?.label;
      if (!userId || !bet.matchId || !inferredMarketKey) {
        console.log('[conflictingBet] Missing required fields:', { userId, matchId: bet.matchId, marketId: inferredMarketKey });
        return res.status(400).json({ 
          success: false, 
          message: 'Missing userId, matchId, or marketId for conflict check.' 
        });
      }
      // Attach inferred key so we consistently use it below
      bet.__marketKey = String(inferredMarketKey);
    }

    // Check for conflicts within the current request (same matchId + marketId in multiple bets)
    const seenCombos = new Set();
    const seenMatchIds = new Set();
    
    for (const bet of betsToCheck) {
      const matchId = bet.matchId;
      const marketKey = bet.__marketKey || bet.marketId || (bet.betDetails && bet.betDetails.market_id);
      const comboKey = `${matchId}:${marketKey}`;
      
      // Check for duplicate match + market combinations
      if (seenCombos.has(comboKey)) {
        console.log('[conflictingBet] Conflict within request:', comboKey);
        return res.status(400).json({ 
          success: false, 
          message: 'Conflicting bets within the current request (same match and market).' 
        });
      }
      seenCombos.add(comboKey);
      
      // Check for duplicate match IDs in combination bets
      if (seenMatchIds.has(matchId)) {
        console.log('[conflictingBet] Duplicate match ID in combination bet:', matchId);
        return res.status(400).json({ 
          success: false, 
          message: 'Combination bets cannot contain the same match multiple times.' 
        });
      }
      seenMatchIds.add(matchId);
    }

    // Determine if this is a combination bet request
    const isCombinationBetRequest = req.body.combinationData && Array.isArray(req.body.combinationData);

    // Check for conflicts with existing pending bets in the DB
    for (const bet of betsToCheck) {
      const matchId = bet.matchId;
      const marketKey = bet.__marketKey || bet.marketId || (bet.betDetails && bet.betDetails.market_id);
      
      console.log('[conflictingBet] Checking for conflicts with:', { matchId, marketKey, isCombinationBetRequest });

      if (isCombinationBetRequest) {
        // For combination bets, only check conflicts with other combination bets that have the exact same leg
        // Allow combination bets to coexist with single bets and other combination bets
        const existingCombinationBet = await Bet.findOne({
          userId,
          matchId,
          status: 'pending',
          combination: { $exists: true, $ne: [] },
          $or: [
            { 'betDetails.market_id': marketKey },
            { 'betDetails.market_description': bet.betDetails?.market_description },
            { 'betDetails.market_name': bet.betDetails?.market_name }
          ],
          'combination': {
            $elemMatch: {
              matchId: matchId,
              $or: [
                { 'betDetails.market_id': marketKey },
                { 'betDetails.market_description': bet.betDetails?.market_description },
                { 'betDetails.market_name': bet.betDetails?.market_name }
              ],
              'betDetails.label': bet.betDetails?.label,
              'betDetails.name': bet.betDetails?.name
            }
          }
        });

        if (existingCombinationBet) {
          console.log('[conflictingBet] Found conflicting combination bet with identical leg:', existingCombinationBet._id);
          return res.status(400).json({ 
            success: false, 
            message: 'You already have a pending combination bet with the exact same selection on this market for this match.' 
          });
        }
      } else {
        // For single bets, check conflicts with other single bets only
        // Allow single bets to coexist with combination bets
        const existingSingleBet = await Bet.findOne({
          userId,
          matchId,
          status: 'pending',
          // Ensure it's not a combination bet
          $or: [
            { combination: { $exists: false } },
            { combination: { $size: 0 } }
          ],
          $or: [
            { 'betDetails.market_id': marketKey },
            { 'betDetails.market_description': bet.betDetails?.market_description },
            { 'betDetails.market_name': bet.betDetails?.market_name }
          ]
        });

        if (existingSingleBet) {
          console.log('[conflictingBet] Found conflicting single bet:', existingSingleBet._id);
          return res.status(400).json({ 
            success: false, 
            message: 'You already have a pending bet on this market for this match.' 
          });
        }
      }
    }

    console.log('[conflictingBet] No conflicts found, proceeding with bet placement');
    next();
  } catch (err) {
    console.error('[conflictingBet] Error:', err);
    next(err);
  }
}; 