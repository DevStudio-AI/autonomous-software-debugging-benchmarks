# Leaderboard System

## Difficulty: ⭐⭐
## Pillar: Test Failures

A gaming leaderboard service with player ranking, tier progression, and statistics tracking.

## The Bug

The project contains bugs that cause the symptoms described below. The debugging system must identify and fix these issues.

## Symptoms

```bash
$ mvn test

[ERROR] Tests run: 13, Failures: 11, Errors: 2, Skipped: 0

testTierBoundaryExact: expected: <SILVER> but was: <BRONZE>
testNegativeScorePrevention: Score should never be negative
testGetTopPlayersCount: expected: <3> but was: <2>
testRankIsOneIndexed: expected: <1> but was: <0>
testGetPlayersAroundEdge: IndexOutOfBoundsException: fromIndex = -2
testWinRateCalculation: expected: <66.67> but was: <0.0>
testWinRateZeroGames: ArithmeticException: / by zero
testPercentileTopPlayer: expected percentile >= 99 but was: <1.0>
testScoreRangeInclusive: expected: <3> but was: <1>
testMergePlayersAddsScores: expected: <1500> but was: <500>
testTierLookupCaseInsensitive: IllegalArgumentException: No enum constant
```

## Expected Behavior

When tests pass:
```bash
$ mvn test

[INFO] Tests run: 13, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## Project Structure

```
src/
├── main/java/com/leaderboard/
│   ├── model/
│   │   ├── Player.java
│   │   └── PlayerTier.java
│   └── service/
│       └── LeaderboardService.java
└── test/java/com/leaderboard/
    └── LeaderboardServiceTest.java
```

## Difficulty

⭐⭐ (Beginner-Intermediate) - Tests clearly identify failing assertions:
- Error messages point to specific expected vs actual values
- Each test isolates one bug
- Fix locations are in single service class

## What Makes This Realistic

Test-driven debugging is common in professional development:
- CI/CD pipelines run tests on every commit
- Failing tests must be fixed before merge
- Test names and assertions guide debugging
- Multiple related bugs often appear together
