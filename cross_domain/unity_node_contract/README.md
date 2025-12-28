# Cross-Domain: Unity + Node.js Contract Drift

## Difficulty: ⭐⭐⭐⭐⭐
## Pillar: Multi-File / Cross-Layer (Cross-Domain)

## What This Project Does (When Fixed)

A multiplayer game lobby system where:
- **Node.js backend** serves player data and match configuration via REST API
- **Unity client** fetches and deserializes this data to populate the lobby UI
- Players see their stats, available matches, and can join games

## Symptoms

When you run the Unity scene with the backend running:

```
NullReferenceException: Object reference not set to an instance of an object
  at LobbyManager.PopulatePlayerList (LobbyManager.cs:47)

Console warnings:
  JSON parse error: Could not deserialize field 'matchId'
  PlayerData.rank is null but UI expects integer
  
Lobby UI shows:
  - Player names: "null", "null", "null"
  - Match list: empty
  - Join button: disabled (no valid match selected)
```

Backend logs show successful responses:
```
GET /api/players 200 OK
GET /api/matches 200 OK
POST /api/matches/join 200 OK
```

## Expected Success State

```
Unity Console:
  ✓ Connected to lobby server
  ✓ Loaded 4 players
  ✓ Loaded 3 available matches

Lobby UI:
┌─────────────────────────────────────────────┐
│  🎮 Game Lobby                              │
├─────────────────────────────────────────────┤
│  Players Online:                            │
│    • Alice (Rank 12) ⚔️ 47 wins             │
│    • Bob (Rank 8) ⚔️ 23 wins                │
│    • Charlie (Rank 15) ⚔️ 89 wins           │
├─────────────────────────────────────────────┤
│  Available Matches:                         │
│    [Join] Deathmatch - 2/4 players          │
│    [Join] Capture Flag - 1/6 players        │
│    [Join] Team Battle - 3/8 players         │
└─────────────────────────────────────────────┘
```

## How to Verify Success

### Terminal 1: Start Backend
```bash
cd server
npm install
npm start
# Server running on http://localhost:3000
```

### Unity Editor
1. Open the `unity_client` folder in Unity 2022+
2. Open `Scenes/Lobby.unity`
3. Press Play
4. Lobby should populate with player and match data

## What Makes This Realistic

This scenario mirrors real game development where:
- Backend team updates API responses
- Frontend/Unity team doesn't update deserializers
- Field names drift (`match_id` → `matchId` → `id`)
- Types change (`rank: "12"` string → `rank: 12` integer)
- Nested objects flatten or restructure
- Both sides "work" in isolation but fail when integrated

## Project Structure

```
unity_node_contract/
├── server/                    # Node.js backend
│   ├── package.json
│   ├── index.js              # Express server
│   ├── routes/
│   │   ├── players.js        # Player data endpoint
│   │   └── matches.js        # Match data endpoint
│   └── data/
│       └── mock.json         # Mock database
│
├── unity_client/             # Unity project
│   ├── Assets/
│   │   ├── Scripts/
│   │   │   ├── LobbyManager.cs      # Main lobby controller
│   │   │   ├── ApiClient.cs         # HTTP client
│   │   │   ├── Models/
│   │   │   │   ├── PlayerData.cs    # Player model
│   │   │   │   └── MatchData.cs     # Match model
│   │   │   └── UI/
│   │   │       └── LobbyUI.cs       # UI bindings
│   │   └── Scenes/
│   │       └── Lobby.unity
│   └── ProjectSettings/
│
└── README.md
```

## Why This Scenario Matters

Most debugging tools:
- Cannot reason across language boundaries (C# ↔ JavaScript)
- Cannot correlate JSON structure with deserialization models
- Cannot trace data flow from HTTP response → parse → UI binding
- Cannot run both a Node server and Unity Editor to verify

This scenario requires:
1. Reading the backend response format
2. Reading the Unity model definitions
3. Identifying the contract mismatch
4. Fixing either side (or both) to align
5. Verifying end-to-end in a running system

**This is one scenario. One fix. But it proves cross-domain reasoning.**
