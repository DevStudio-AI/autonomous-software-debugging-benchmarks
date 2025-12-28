using System;

namespace LobbyClient.Models
{
    [Serializable]
    public class MatchData
    {
        public string matchId;       // Backend sends: id
        public string gameMode;      // Backend sends: game_mode
        public int playerCount;      // Backend sends: current_players
        public int maxPlayers;       // Backend sends: max_players
        public string hostName;      // Backend sends: host.name (nested)
        public string hostId;        // Backend sends: host.id (nested)
        public long createdAt;       // Backend sends: created
        public string region;        // This one matches!
    }

    [Serializable]
    public class MatchListResponse
    {
        public MatchData[] matches;  // Backend sends: raw array, no wrapper
    }

    [Serializable]
    public class JoinMatchResponse
    {
        public bool success;
        public string joinToken;     // Backend sends: join_token
        public string serverAddress; // Backend sends: server_address
    }
}
