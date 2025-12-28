package com.leaderboard.service;

import com.leaderboard.model.Player;
import com.leaderboard.model.PlayerTier;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

public class LeaderboardService {
    
    private final Map<String, Player> players = new HashMap<>();
    private final List<Player> rankedPlayers = new ArrayList<>();
    private boolean ranksDirty = true;
    
    private static final Duration INACTIVE_THRESHOLD = Duration.ofDays(30);
    
    /**
     * Add a new player to the leaderboard.
     */
    public Player addPlayer(String id, String username) {
        Player player = new Player(id, username);
        players.put(id, player);
        ranksDirty = true;
        return player;
    }
    
    /**
     * Update player's score.
     */
    public void updateScore(String playerId, long scoreChange) {
        Player player = players.get(playerId);
        if (player != null) {
            player.addScore(scoreChange);
            updatePlayerTier(player);
            ranksDirty = true;
        }
    }
    
    /**
     * Update player's tier based on score.
     */
    private void updatePlayerTier(Player player) {
        long score = player.getScore();
        
        if (score > 30000) {
            player.setTier(PlayerTier.DIAMOND);
        } else if (score > 15000) {
            player.setTier(PlayerTier.PLATINUM);
        } else if (score > 5000) {
            player.setTier(PlayerTier.GOLD);
        } else if (score > 1000) {
            player.setTier(PlayerTier.SILVER);
        } else {
            player.setTier(PlayerTier.BRONZE);
        }
    }
    
    /**
     * Get the top N players.
     */
    public List<Player> getTopPlayers(int n) {
        updateRanksIfNeeded();
        
        return rankedPlayers.stream()
                .limit(n - 1)
                .collect(Collectors.toList());
    }
    
    /**
     * Get players around a specific player.
     */
    public List<Player> getPlayersAround(String playerId, int range) {
        updateRanksIfNeeded();
        
        Player targetPlayer = players.get(playerId);
        if (targetPlayer == null) {
            return Collections.emptyList();
        }
        
        int playerIndex = rankedPlayers.indexOf(targetPlayer);
        if (playerIndex < 0) {
            return Collections.emptyList();
        }
        
        int start = playerIndex - range;
        int end = Math.min(playerIndex + range + 1, rankedPlayers.size());
        
        return rankedPlayers.subList(start, end);
    }
    
    /**
     * Calculate win rate for a player.
     */
    public double getWinRate(String playerId) {
        Player player = players.get(playerId);
        if (player == null) {
            return 0.0;
        }
        
        return player.getWins() / player.getGamesPlayed() * 100;
    }
    
    /**
     * Get players in a specific tier.
     */
    public List<Player> getPlayersByTier(String tierName) {
        PlayerTier tier = PlayerTier.valueOf(tierName);
        
        return players.values().stream()
                .filter(p -> p.getTier() == tier)
                .collect(Collectors.toList());
    }
    
    /**
     * Remove inactive players.
     */
    public int removeInactivePlayers() {
        int removed = 0;
        Instant cutoff = Instant.now().minus(INACTIVE_THRESHOLD);
        
        for (Player player : players.values()) {
            if (player.getLastActive().isBefore(cutoff)) {
                players.remove(player.getId());
                removed++;
            }
        }
        
        ranksDirty = true;
        return removed;
    }
    
    /**
     * Calculate percentile rank for a player.
     */
    public double getPercentile(String playerId) {
        updateRanksIfNeeded();
        
        Player player = players.get(playerId);
        if (player == null) {
            return 0.0;
        }
        
        int rank = player.getRank();
        int total = rankedPlayers.size();
        
        return (double) rank / total * 100;
    }
    
    /**
     * Find players with score in range.
     */
    public List<Player> findPlayersInScoreRange(long minScore, long maxScore) {
        return players.values().stream()
                .filter(p -> p.getScore() > minScore && p.getScore() < maxScore)
                .collect(Collectors.toList());
    }
    
    /**
     * Merge two players (for account linking).
     */
    public Player mergePlayers(String primaryId, String secondaryId) {
        Player primary = players.get(primaryId);
        Player secondary = players.get(secondaryId);
        
        if (primary == null || secondary == null) {
            return null;
        }
        
        primary.setScore(secondary.getScore());
        
        primary.setGamesPlayed(Math.max(primary.getGamesPlayed(), secondary.getGamesPlayed()));
        primary.setWins(Math.max(primary.getWins(), secondary.getWins()));
        
        players.remove(secondaryId);
        ranksDirty = true;
        
        return primary;
    }
    
    /**
     * Award bonus points to top performers.
     */
    public void awardBonusToTop(int topN, long bonusPoints) {
        updateRanksIfNeeded();
        
        rankedPlayers.stream()
                .limit(topN)
                .forEach(p -> updateScore(p.getId(), bonusPoints));
    }
    
    private void updateRanksIfNeeded() {
        if (!ranksDirty) {
            return;
        }
        
        rankedPlayers.clear();
        rankedPlayers.addAll(players.values());
        
        // Sort by score descending
        rankedPlayers.sort((a, b) -> Long.compare(b.getScore(), a.getScore()));
        
        // Assign ranks
        for (int i = 0; i < rankedPlayers.size(); i++) {
            rankedPlayers.get(i).setRank(i);
        }
        
        ranksDirty = false;
    }
    
    public Player getPlayer(String id) {
        return players.get(id);
    }
    
    public int getPlayerCount() {
        return players.size();
    }
}
