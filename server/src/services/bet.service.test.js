const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const BetService = require("./bet.service.js").default;
const Bet = require("../models/Bet.js").default;
const User = require("../models/User.js").default;
const cron = require("node-cron");
const validObjectId = new mongoose.Types.ObjectId();

// Increase Jest timeout for async DB operations
jest.setTimeout(20000);

// Mock FixtureOptimizationService module and its getOptimizedFixtures, getAllCachedMatches, and fixtureCache methods
jest.mock("../../../server/src/services/fixture.service.js", () => ({
  __esModule: true,
  default: {
    getOptimizedFixtures: jest.fn().mockResolvedValue([
      {
        id: "123",
        odds: [
          {
            id: "odd1",
            value: 1.5,
            name: "Home",
            market_id: "1",
            winning: true,
          },
        ],
        participants: [{ name: "Team A" }, { name: "Team B" }],
        starting_at: new Date().toISOString(),
        state_id: 1,
        league_id: 1,
        teams: "Team A vs Team B",
      },
    ]),
    getAllCachedMatches: jest.fn().mockReturnValue([]),
    fixtureCache: {
      get: jest.fn().mockReturnValue(undefined),
      set: jest.fn(),
    },
  },
}));

// Mock cron to run jobs immediately and synchronously
jest.mock("node-cron", () => ({
  schedule: jest.fn((cronTime, fn) => {
    fn();
    return { stop: jest.fn() };
  }),
}));

// Mock fetchMatchResult to simulate a finished match
const mockMatchResult = {
  id: "123",
  state: { id: 5 }, // 5 = finished
  odds: [{ id: "odd1", winning: true }],
  participants: [],
  scores: [],
};

BetService.fetchMatchResult = jest.fn().mockResolvedValue(mockMatchResult);

describe("BetService - Scheduled Bet Updates", () => {
  let mongoServer;
  let user;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "test" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Bet.deleteMany({});
    await User.deleteMany({});
    user = await User.create({
      email: "test@example.com",
      password: "Testpass1!",
      firstName: "Test",
      lastName: "User",
      phoneNumber: "+1234567890",
      gender: "male",
      balance: 100,
    });
  });

  it("should update all bets for a match when the scheduled time arrives", async () => {
    // Place two bets on the same match
    const bet1 = await BetService.placeBet(user._id, "123", "odd1", 10);
    const bet2 = await BetService.placeBet(user._id, "123", "odd1", 20);

    // Wait for the scheduled job to run (immediate due to mock)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Fetch updated bets
    const updatedBets = await Bet.find({ matchId: "123" });
    expect(updatedBets.every((bet) => bet.status === "won")).toBe(true);

    // User balance should be updated (initial - stakes + payouts)
    const updatedUser = await User.findById(user._id);
    // Each bet: payout = stake * odds (mock odds = 1, so payout = stake)
    expect(updatedUser.balance).toBe(100 - 10 - 20 + 10 * 1.5 + 20 * 1.5);
  });
});

const mockBets = [
  {
    _id: "fakeid1",
    userId: "fakeuserid",
    matchId: "123",
    oddId: "odd1",
    betOption: "Home",
    odds: 1.5,
    stake: 10,
    payout: 0,
    matchDate: new Date(),
    estimatedMatchEnd: new Date(),
    teams: "Team A vs Team B",
    selection: "Home - ",
    status: "won",
    save: jest.fn().mockResolvedValue(true),
    populate: jest.fn().mockResolvedValue(this),
  },
  {
    _id: "fakeid2",
    userId: "fakeuserid",
    matchId: "123",
    oddId: "odd1",
    betOption: "Home",
    odds: 1.5,
    stake: 20,
    payout: 0,
    matchDate: new Date(),
    estimatedMatchEnd: new Date(),
    teams: "Team A vs Team B",
    selection: "Home - ",
    status: "won",
    save: jest.fn().mockResolvedValue(true),
    populate: jest.fn().mockResolvedValue(this),
  },
];

// Mock Bet.find to return a chainable object with .populate
jest.spyOn(Bet, "find").mockImplementation(() => ({
  populate: jest.fn().mockResolvedValue(mockBets),
}));

// Mock Bet.findById to return a valid bet object with a valid ObjectId and all required fields
jest.spyOn(Bet, "findById").mockImplementation((_id) => {
  return {
    _id: validObjectId,
    userId: validObjectId,
    matchId: "123",
    oddId: "odd1",
    betOption: "Home",
    odds: 1.5,
    stake: 10,
    payout: 0,
    matchDate: new Date(),
    estimatedMatchEnd: new Date(),
    teams: "Team A vs Team B",
    selection: "Home - ",
    status: "won",
    save: jest.fn().mockResolvedValue(true),
    populate: jest.fn().mockResolvedValue(this),
  };
});

// Mock User.findById to return a valid user object
jest.spyOn(User, "findById").mockResolvedValue({
  _id: validObjectId,
  balance: 100,
  save: jest.fn().mockResolvedValue(true),
});
