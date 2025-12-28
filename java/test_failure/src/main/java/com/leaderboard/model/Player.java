package com.leaderboard.model;

import java.time.Instant;
import java.util.Objects;

public class Player {
    
    private String id;
    private String username;
    private long score;
    private int rank;
    private int gamesPlayed;
    private int wins;
    private Instant lastActive;
    private PlayerTier tier;
    
    public Player(String id, String username) {
        this.id = id;
        this.username = username;
        this.score = 0;
        this.rank = 0;
        this.gamesPlayed = 0;
        this.wins = 0;
        this.lastActive = Instant.now();
        this.tier = PlayerTier.BRONZE;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public long getScore() { return score; }
    public void setScore(long score) { this.score = score; }
    
    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
    
    public int getGamesPlayed() { return gamesPlayed; }
    public void setGamesPlayed(int gamesPlayed) { this.gamesPlayed = gamesPlayed; }
    
    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }
    
    public Instant getLastActive() { return lastActive; }
    public void setLastActive(Instant lastActive) { this.lastActive = lastActive; }
    
    public PlayerTier getTier() { return tier; }
    public void setTier(PlayerTier tier) { this.tier = tier; }
    
    public void addScore(long points) {
        this.score += points;
        this.lastActive = Instant.now();
    }
    
    public void recordGame(boolean won) {
        this.gamesPlayed++;
        if (won) {
            this.wins++;
        }
        this.lastActive = Instant.now();
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Player player = (Player) o;
        return Objects.equals(id, player.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return String.format("Player{username='%s', score=%d, rank=%d, tier=%s}", 
                           username, score, rank, tier);
    }
}
