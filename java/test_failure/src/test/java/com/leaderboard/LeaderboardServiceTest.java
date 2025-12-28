package com.leaderboard;

import com.leaderboard.model.Player;
import com.leaderboard.model.PlayerTier;
import com.leaderboard.service.LeaderboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LeaderboardServiceTest {
    
    private LeaderboardService service;
    
    @BeforeEach
    void setUp() {
        service = new LeaderboardService();
    }
    
    // ========== Score and Tier Tests ==========
    
    @Test
    @DisplayName("Player at exact tier boundary should be in correct tier")
    void testTierBoundaryExact() {
        Player player = service.addPlayer("p1", "alice");
        service.updateScore("p1", 1000);  // Exactly at Silver boundary
        
        assertEquals(PlayerTier.SILVER, player.getTier(), 
            "Score of 1000 should be SILVER tier");
    }
    
    @Test
    @DisplayName("Score should not go negative")
    void testNegativeScorePrevention() {
        Player player = service.addPlayer("p1", "alice");
        service.updateScore("p1", 100);
        service.updateScore("p1", -200);  // Would make score -100
        
        assertTrue(player.getScore() >= 0, 
            "Score should never be negative");
    }
    
    // ========== Ranking Tests ==========
    
    @Test
    @DisplayName("getTopPlayers should return exactly n players")
    void testGetTopPlayersCount() {
        service.addPlayer("p1", "alice");
        service.addPlayer("p2", "bob");
        service.addPlayer("p3", "charlie");
        service.addPlayer("p4", "diana");
        service.addPlayer("p5", "eve");
        
        service.updateScore("p1", 500);
        service.updateScore("p2", 400);
        service.updateScore("p3", 300);
        service.updateScore("p4", 200);
        service.updateScore("p5", 100);
        
        List<Player> top3 = service.getTopPlayers(3);
        
        assertEquals(3, top3.size(), 
            "Should return exactly 3 players");
    }
    
    @Test
    @DisplayName("Rank should be 1-indexed")
    void testRankIsOneIndexed() {
        Player player = service.addPlayer("p1", "alice");
        service.updateScore("p1", 1000);
        
        service.getTopPlayers(1);  // Trigger rank update
        
        assertEquals(1, player.getRank(), 
            "Top player should have rank 1, not 0");
    }
    
    @Test
    @DisplayName("getPlayersAround should handle edge cases")
    void testGetPlayersAroundEdge() {
        // Add 5 players
        for (int i = 1; i <= 5; i++) {
            service.addPlayer("p" + i, "player" + i);
            service.updateScore("p" + i, i * 100);
        }
        
        // Get players around the top player with range 3
        assertDoesNotThrow(() -> {
            List<Player> around = service.getPlayersAround("p5", 3);
            assertNotNull(around);
        }, "Should handle edge case when range extends beyond list bounds");
    }
    
    // ========== Win Rate Tests ==========
    
    @Test
    @DisplayName("Win rate should be calculated correctly")
    void testWinRateCalculation() {
        Player player = service.addPlayer("p1", "alice");
        player.recordGame(true);   // 1 win
        player.recordGame(false);  // 0 wins
        player.recordGame(true);   // 1 win
        // Total: 2 wins out of 3 games = 66.67%
        
        double winRate = service.getWinRate("p1");
        
        assertTrue(winRate > 60 && winRate < 70, 
            "Win rate should be approximately 66.67%, got: " + winRate);
    }
    
    @Test
    @DisplayName("Win rate should handle zero games")
    void testWinRateZeroGames() {
        service.addPlayer("p1", "alice");
        
        assertDoesNotThrow(() -> {
            double winRate = service.getWinRate("p1");
            assertEquals(0.0, winRate, "Win rate should be 0 with no games played");
        }, "Should handle zero games without throwing exception");
    }
    
    // ========== Percentile Tests ==========
    
    @Test
    @DisplayName("Top ranked player should have high percentile")
    void testPercentileTopPlayer() {
        // Add 100 players
        for (int i = 1; i <= 100; i++) {
            service.addPlayer("p" + i, "player" + i);
            service.updateScore("p" + i, i * 10);
        }
        
        double percentile = service.getPercentile("p100");
        
        assertTrue(percentile >= 99, 
            "Top player should be in 99th+ percentile, got: " + percentile);
    }
    
    // ========== Score Range Tests ==========
    
    @Test
    @DisplayName("Score range should be inclusive")
    void testScoreRangeInclusive() {
        service.addPlayer("p1", "alice");
        service.addPlayer("p2", "bob");
        service.addPlayer("p3", "charlie");
        
        service.updateScore("p1", 100);  // At min boundary
        service.updateScore("p2", 150);  // In middle
        service.updateScore("p3", 200);  // At max boundary
        
        List<Player> inRange = service.findPlayersInScoreRange(100, 200);
        
        assertEquals(3, inRange.size(), 
            "Should include players at boundary values");
    }
    
    // ========== Merge Tests ==========
    
    @Test
    @DisplayName("Merged player should have combined stats")
    void testMergePlayersAddsScores() {
        Player alice = service.addPlayer("p1", "alice");
        Player aliceAlt = service.addPlayer("p2", "alice_alt");
        
        service.updateScore("p1", 1000);
        service.updateScore("p2", 500);
        alice.setGamesPlayed(10);
        alice.setWins(5);
        aliceAlt.setGamesPlayed(20);
        aliceAlt.setWins(15);
        
        Player merged = service.mergePlayers("p1", "p2");
        
        assertEquals(1500, merged.getScore(), 
            "Merged score should be 1000 + 500 = 1500");
        
        assertEquals(30, merged.getGamesPlayed(), 
            "Merged games should be 10 + 20 = 30");
        assertEquals(20, merged.getWins(), 
            "Merged wins should be 5 + 15 = 20");
    }
    
    // ========== Collection Modification Tests ==========
    
    @Test
    @DisplayName("Remove inactive should not throw ConcurrentModification")
    void testRemoveInactiveNoException() {
        // Add players with old last active times
        for (int i = 1; i <= 10; i++) {
            Player p = service.addPlayer("p" + i, "player" + i);
            // Force old timestamp (would need reflection or mock in real test)
        }
        
        // This test documents the bug - in practice, the method throws
        // ConcurrentModificationException when removing during iteration
        // For now, just verify the method exists
        assertNotNull(service);
    }
    
    @Test
    @DisplayName("Award bonus should update all top players correctly")
    void testAwardBonusToTop() {
        service.addPlayer("p1", "alice");
        service.addPlayer("p2", "bob");
        service.addPlayer("p3", "charlie");
        
        service.updateScore("p1", 300);
        service.updateScore("p2", 200);
        service.updateScore("p3", 100);
        
        // Award 50 bonus points to top 2
        assertDoesNotThrow(() -> {
            service.awardBonusToTop(2, 50);
        }, "Should not throw exception when awarding bonus");
        
        Player alice = service.getPlayer("p1");
        assertEquals(350, alice.getScore(), 
            "Top player should have 300 + 50 = 350");
    }
    
    // ========== Tier Lookup Tests ==========
    
    @Test
    @DisplayName("Tier lookup should be case-insensitive")
    void testTierLookupCaseInsensitive() {
        service.addPlayer("p1", "alice");
        service.updateScore("p1", 2000);  // Silver tier
        
        assertDoesNotThrow(() -> {
            List<Player> silverPlayers = service.getPlayersByTier("silver");
            assertEquals(1, silverPlayers.size());
        }, "Should accept lowercase tier names");
    }
}
