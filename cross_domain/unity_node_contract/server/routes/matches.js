const express = require('express');
const router = express.Router();

// Mock match data
const matches = [
  {
    id: 'match_001',
    game_mode: 'Deathmatch',
    current_players: 2,
    max_players: 4,
    host: {
      id: 'player_001',
      name: 'Alice'
    },
    created: Date.now() - 300000,
    region: 'us-west'
  },
  {
    id: 'match_002',
    game_mode: 'Capture Flag',
    current_players: 1,
    max_players: 6,
    host: {
      id: 'player_002',
      name: 'Bob'
    },
    created: Date.now() - 120000,
    region: 'eu-central'
  },
  {
    id: 'match_003',
    game_mode: 'Team Battle',
    current_players: 3,
    max_players: 8,
    host: {
      id: 'player_004',
      name: 'Diana'
    },
    created: Date.now() - 60000,
    region: 'us-east'
  }
];

// GET /api/matches - List available matches
router.get('/', (req, res) => {
  const region = req.query.region;
  
  let result = matches;
  if (region) {
    result = matches.filter(m => m.region === region);
  }
  
  // Return as flat array (v1 style, but Unity expects wrapped)
  res.json(result);
});

// GET /api/matches/:id - Get match details
router.get('/:id', (req, res) => {
  const match = matches.find(m => m.id === req.params.id);
  
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  
  res.json(match);
});

// POST /api/matches/join - Join a match
router.post('/join', (req, res) => {
  const { matchId, playerId } = req.body;
  
  const match = matches.find(m => m.id === matchId);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  
  if (match.current_players >= match.max_players) {
    return res.status(400).json({ error: 'Match is full' });
  }
  
  match.current_players++;
  
  // Return success with join token
  res.json({
    success: true,
    join_token: `token_${Date.now()}`,
    server_address: `game-${match.region}.example.com:7777`
  });
});

module.exports = router;
