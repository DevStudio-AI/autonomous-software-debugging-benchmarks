const express = require('express');
const router = express.Router();

// Mock player data
// Note: Field names and structure updated in recent API revision
const players = [
  {
    odestiny: 'player_001',
    display_name: 'Alice',
    ranking: '12',
    statistics: {
      total_wins: 47,
      total_losses: 23,
      win_streak: 5
    },
    online_status: true,
    avatar_url: '/avatars/alice.png'
  },
  {
    player_id: 'player_002',
    display_name: 'Bob',
    ranking: 8,
    statistics: {
      total_wins: 23,
      total_losses: 31,
      win_streak: 2
    },
    online_status: true,
    avatar_url: '/avatars/bob.png'
  },
  {
    player_id: 'player_003',
    display_name: 'Charlie',
    ranking: '15',
    statistics: {
      total_wins: 89,
      total_losses: 44,
      win_streak: 0
    },
    online_status: false,
    avatar_url: null
  },
  {
    player_id: 'player_004',
    display_name: 'Diana',
    ranking: 20,
    stats: {
      wins: 156,
      losses: 67
    },
    online_status: true,
    avatar_url: '/avatars/diana.png'
  }
];

// GET /api/players - List online players
router.get('/', (req, res) => {
  const onlineOnly = req.query.online === 'true';
  
  let result = players;
  if (onlineOnly) {
    result = players.filter(p => p.online_status);
  }
  
  // Response wrapper changed in v2 API
  res.json({
    payload: result,
    meta: {
      count: result.length,
      timestamp: new Date().toISOString()
    }
  });
});

// GET /api/players/:id - Get single player
router.get('/:id', (req, res) => {
  const player = players.find(p => p.player_id === req.params.id);
  
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  res.json({ payload: player });
});

module.exports = router;
