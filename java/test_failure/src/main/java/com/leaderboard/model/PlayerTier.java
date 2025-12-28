package com.leaderboard.model;

public enum PlayerTier {
    BRONZE(0, 999),
    SILVER(1000, 4999),
    GOLD(5000, 14999),
    PLATINUM(15000, 29999),
    DIAMOND(30000, Long.MAX_VALUE);
    
    private final long minScore;
    private final long maxScore;
    
    PlayerTier(long minScore, long maxScore) {
        this.minScore = minScore;
        this.maxScore = maxScore;
    }
    
    public long getMinScore() { return minScore; }
    public long getMaxScore() { return maxScore; }
    
    public static PlayerTier fromScore(long score) {
        for (PlayerTier tier : values()) {
            if (score >= tier.minScore && score <= tier.maxScore) {
                return tier;
            }
        }
        return BRONZE;
    }
}
