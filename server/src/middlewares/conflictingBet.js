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

    // Determine if this is a combination bet request (move this before the loop)
    const isCombinationBetRequest = req.body.combinationData && Array.isArray(req.body.combinationData);

    // Check for missing required fields in any bet (with graceful market key inference)
    for (const bet of betsToCheck) {
      const inferredMarketKey = bet.marketId || bet.betDetails?.market_id || bet.betDetails?.marketId || bet.betDetails?.market_description || bet.betDetails?.market_name || bet.betDetails?.label || bet.betOption || bet.selection;
      
      if (!userId || !bet.matchId) {
        console.log('[conflictingBet] Missing required fields:', { userId, matchId: bet.matchId, marketId: inferredMarketKey });
        return res.status(400).json({ 
          success: false, 
          message: 'Missing userId or matchId for conflict check.' 
        });
      }
      
      // For combination bets, we'll use a more flexible market key
      if (isCombinationBetRequest) {
        // Use oddId as market identifier for combination bets since betDetails isn't available yet
        bet.__marketKey = bet.oddId || bet.betOption || bet.selection || 'unknown';
      } else {
        bet.__marketKey = String(inferredMarketKey);
      }
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
      
      // Allow combination bets from the same match (different markets)
      // Only check for duplicate match + market combinations (handled above)
      seenMatchIds.add(matchId); // Still add to track, but don't block
    }

    // Check for conflicts with existing pending bets in the DB
    for (const bet of betsToCheck) {
      const matchId = bet.matchId;
      const marketKey = bet.__marketKey || bet.marketId || (bet.betDetails && bet.betDetails.market_id);
      
      console.log('[conflictingBet] Checking for conflicts with:', { matchId, marketKey, isCombinationBetRequest });

      if (isCombinationBetRequest) {
        // For combination bets, check for conflicts with existing combination bets that have the same oddId
        // This is more reliable than trying to match betDetails that don't exist yet
        const existingCombinationBet = await Bet.findOne({
          userId,
          status: 'pending',
          combination: { $exists: true, $ne: [] },
          'combination': {
            $elemMatch: {
              matchId: matchId,
              oddId: bet.oddId
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
        // Use oddId as the primary conflict identifier since it's unique per market+selection
        const existingSingleBet = await Bet.findOne({
          userId,
          matchId,
          status: 'pending',
          // Ensure it's not a combination bet
          $or: [
            { combination: { $exists: false } },
            { combination: { $size: 0 } }
          ],
          // Use oddId as the primary conflict identifier
          oddId: bet.oddId
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