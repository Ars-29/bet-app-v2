import BetOutcomeCalculationService from "./betOutcomeCalculation.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printResult(label, result) {
  console.log(`\n=== ${label} ===`);
  console.log("Status:", result.status);
  console.log("Payout:", result.payout);
  console.log("Reason:", result.reason);
  if (result.playerName) console.log("Player:", result.playerName);
  if (result.betType) console.log("Bet Type:", result.betType);
  if (result.goalsScored !== undefined) console.log("Goals Scored:", result.goalsScored);
  if (result.goalDetails) console.log("Goal Details:", result.goalDetails);
}

function runGoalscorerTests() {
  console.log('Running runGoalscorerTests...');
  // Load response.json and get the fixture from the 'data' property
  const responsePath = path.join(__dirname, "../../response.json");
  const responseData = JSON.parse(fs.readFileSync(responsePath, "utf8"));

  // Use the fixture directly from responseData.data
  const matchData = responseData.data;

  if (!matchData || !Array.isArray(matchData.events) || !matchData.events.some(e => e.type_id === 14)) {
    console.log("No fixture with goal events found in response.json");
    return;
  }

  const goalEvents = matchData.events.filter(e => e.type_id === 14);
  console.log('Number of goal events found:', goalEvents.length);
  if (goalEvents.length === 0) {
    console.log("No goal events found in the selected fixture.");
    return;
  }

  // Sort goal events by minute and extra_minute
  const sortedGoals = [...goalEvents].sort((a, b) => {
    const minuteA = (a.minute || 0) + (a.extra_minute || 0);
    const minuteB = (b.minute || 0) + (b.extra_minute || 0);
    return minuteA - minuteB;
  });

  // Use first and last goal scorer from the sorted data
  const firstGoal = sortedGoals[0];
  const lastGoal = sortedGoals[sortedGoals.length - 1];
  const anytimeGoal = sortedGoals[1] || sortedGoals[0]; // pick a middle or first scorer

  // Test First Goalscorer
  const firstBet = {
    betOption: "First",
    odds: 5.0,
    stake: 100,
    betDetails: {
      market_id: "90",
      market_name: "Goalscorers",
      label: "First",
      name: firstGoal.player_name
    }
  };

  // Test Last Goalscorer
  const lastBet = {
    betOption: "Last",
    odds: 5.0,
    stake: 100,
    betDetails: {
      market_id: "90",
      market_name: "Goalscorers",
      label: "Last",
      name: lastGoal.player_name
    }
  };

  // Test Anytime Goalscorer
  const anytimeBet = {
    betOption: "Anytime",
    odds: 2.5,
    stake: 100,
    betDetails: {
      market_id: "90",
      market_name: "Goalscorers",
      label: "Anytime",
      name: anytimeGoal.player_name
    }
  };

  // Test Losing Case (player not in goal events)
  const losingBet = {
    betOption: "First",
    odds: 10.0,
    stake: 100,
    betDetails: {
      market_id: "90",
      market_name: "Goalscorers",
      label: "First",
      name: "Non-Existent Player"
    }
  };

  const service = new BetOutcomeCalculationService();

  printResult(`First Goalscorer (${firstGoal.player_name})`, service.calculateGoalscorers(firstBet, matchData));
  printResult(`Last Goalscorer (${lastGoal.player_name})`, service.calculateGoalscorers(lastBet, matchData));
  printResult(`Anytime Goalscorer (${anytimeGoal.player_name})`, service.calculateGoalscorers(anytimeBet, matchData));
  printResult(`Losing First Goalscorer (Non-Existent Player)`, service.calculateGoalscorers(losingBet, matchData));
}

runGoalscorerTests();
