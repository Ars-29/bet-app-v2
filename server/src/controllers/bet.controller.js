import BetService from "../services/bet.service.js";
import { CustomError } from "../utils/customErrors.js";
import FixtureOptimizationService from "../services/fixture.service.js";
import mongoose from "mongoose";

class BetController {
  async placeBet(req, res, next) {
    console.log("Placing bet with data:", req.body);
    try {
      const { matchId, oddId, stake, betOption, marketId, combinationData } = req.body;
      const userId = req.user._id; 

      // Handle combination bets
      if (combinationData && Array.isArray(combinationData)) {
        // Validate combination bet inputs
        if (combinationData.length < 2) {
          throw new CustomError(
            "Combination bet must have at least 2 legs",
            400,
            "INVALID_COMBINATION_BET"
          );
        }
        if (!stake || isNaN(stake) || stake <= 0) {
          throw new CustomError(
            "Stake must be a positive number",
            400,
            "INVALID_STAKE"
          );
        }

        console.log(`Processing combination bet with ${combinationData.length} legs`);
        const result = await BetService.placeBet(userId, null, null, stake, null, false, combinationData);
        
        res.status(201).json({
          success: true,
          bet: result.bet,
          user: result.user,
          message: "Combination bet placed successfully",
        });
        return;
      }

      // Handle single bets
      // Validate single bet inputs
      if (!matchId || !oddId || !stake || !betOption) {
        throw new CustomError(
          "Missing required fields: matchId, oddId, stake, betOption",
          400,
          "INVALID_INPUT"
        );
      }
      if (isNaN(stake) || stake <= 0) {
        throw new CustomError(
          "Stake must be a positive number",
          400,
          "INVALID_STAKE"
        );
      }

      // Log marketId if provided (for middleware to use)
      if (marketId) {
        console.log(`Market ID provided: ${marketId}`);
      }

      // Check if the match is live
      const isLive = global.liveFixturesService ? global.liveFixturesService.isMatchLive(matchId) : false;
      console.log(`Match ${matchId} is live: ${isLive}`);

      const result = await BetService.placeBet(userId, matchId, oddId, stake, betOption, isLive);
      res.status(201).json({
        success: true,
        bet: result.bet,
        user: result.user,
        message: "Bet placed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async checkBetOutcome(req, res, next) {
    try {
      const { betId } = req.params;

      // Validate betId
      if (!betId || !mongoose.isValidObjectId(betId)) {
        throw new CustomError("Invalid bet ID", 400, "INVALID_BET_ID");
      }

      console.log(`[BetController.checkBetOutcome] Checking outcome for bet: ${betId}`);

      const result = await BetService.checkBetOutcome(betId);
      
      // Enhanced response with additional details for combination bets
      const response = {
        success: true,
        data: {
          ...result,
          // Add combination details if it's a combination bet
          ...(result.combination && {
            combination: result.combination,
            legStatuses: result.combination?.map(leg => ({
              matchId: leg.matchId,
              status: leg.status,
              payout: leg.payout
            }))
          })
        },
        message: result.combination 
          ? "Combination bet outcome checked" 
          : "Bet outcome checked",
      };

      res.status(200).json(response);
    } catch (error) {
      console.error(`[BetController.checkBetOutcome] Error:`, error);
      next(error);
    }
  }

  async checkPendingBets(req, res, next) {
    try {
      const results = await BetService.checkPendingBets();
      res.status(200).json({
        success: true,
        data: results,
        message: "Pending bets processed",
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserBets(req, res, next) {
    try {
      const userId = req.user._id;
      const bets = await BetService.getUserBets(userId);
      console.log(`Fetched bets for user ${userId}:`, bets);
      
      res.status(200).json({
        success: true,
        data: bets,
        message: "Fetched user bets successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllBets(req, res, next) {
    try {
      const groupedBets = await BetService.getAllBets();
      res.status(200).json({
        success: true,
        data: groupedBets,
        message: "Fetched all bets grouped by user successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getBetsByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      console.log(`[BetController.getBetsByUserId] Requesting bets for user ID: ${userId}`);
      
      const bets = await BetService.getBetsByUserId(userId);
      console.log(`[BetController.getBetsByUserId] Fetched ${bets.length} bets for user ${userId}`);
      
      res.status(200).json({
        success: true,
        data: bets,
        message: "Fetched user bets successfully",
      });
    } catch (error) {
      console.error(`[BetController.getBetsByUserId] Error:`, error);
      next(error);
    }
  }
}

export default new BetController();

