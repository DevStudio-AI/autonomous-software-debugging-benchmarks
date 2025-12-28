using System;

namespace LobbyClient.Models
{
    [Serializable]
    public class PlayerData
    {
        public string playerId;      // Backend sends: player_id (snake_case)
        public string name;          // Backend sends: display_name
        public int rank;             // Backend sends: ranking (sometimes string)
        public int wins;             // Backend sends: statistics.total_wins (nested)
        public int losses;           // Backend sends: statistics.total_losses
        public bool isOnline;        // Backend sends: online_status
        public string avatarUrl;     // Backend sends: avatar_url
    }

    [Serializable]
    public class PlayerListResponse
    {
        public PlayerData[] players; // Backend sends: payload (different key)
        public int total;            // Backend sends: meta.count (nested)
    }
}
