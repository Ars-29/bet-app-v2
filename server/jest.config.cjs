module.exports = {
  testEnvironment: "node",
  transform: { "^.+\\.js$": "babel-jest" },
  transformIgnorePatterns: [
    "node_modules/(?!@babel)/"
  ],
  moduleNameMapper: {
    "^(\\.[^/]+|\\.\\.?/.*)\\.js$": "$1"
  },
};
