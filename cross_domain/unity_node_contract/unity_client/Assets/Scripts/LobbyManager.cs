using UnityEngine;
using LobbyClient.Models;

namespace LobbyClient
{
    public class LobbyManager : MonoBehaviour
    {
        [SerializeField] private ApiClient apiClient;
        [SerializeField] private LobbyUI lobbyUI;

        private PlayerData[] currentPlayers;
        private MatchData[] currentMatches;
        private string localPlayerId = "player_001";

        private void Start()
        {
            if (apiClient == null)
            {
                apiClient = GetComponent<ApiClient>();
            }

            apiClient.OnPlayersLoaded += HandlePlayersLoaded;
            apiClient.OnMatchesLoaded += HandleMatchesLoaded;
            apiClient.OnError += HandleError;

            // Fetch initial data
            RefreshLobby();
        }

        public void RefreshLobby()
        {
            Debug.Log("Refreshing lobby data...");
            apiClient.FetchPlayers();
            apiClient.FetchMatches();
        }

        private void HandlePlayersLoaded(PlayerData[] players)
        {
            currentPlayers = players;
            Debug.Log($"Loaded {players?.Length ?? 0} players");
            PopulatePlayerList();
        }

        private void HandleMatchesLoaded(MatchData[] matches)
        {
            currentMatches = matches;
            Debug.Log($"Loaded {matches?.Length ?? 0} matches");
            PopulateMatchList();
        }

        private void PopulatePlayerList()
        {
            if (currentPlayers == null)
            {
                Debug.LogWarning("No players to display");
                return;
            }

            lobbyUI.ClearPlayerList();

            foreach (var player in currentPlayers)
            {
                // Access fields expecting our model structure
                var displayText = $"{player.name} (Rank {player.rank}) - {player.wins} wins";
                lobbyUI.AddPlayerEntry(displayText, player.isOnline);
            }
        }

        private void PopulateMatchList()
        {
            if (currentMatches == null)
            {
                Debug.LogWarning("No matches to display");
                return;
            }

            lobbyUI.ClearMatchList();

            foreach (var match in currentMatches)
            {
                var displayText = $"{match.gameMode} - {match.playerCount}/{match.maxPlayers} players";
                lobbyUI.AddMatchEntry(match.matchId, displayText, match.playerCount < match.maxPlayers);
            }
        }

        public void JoinMatch(string matchId)
        {
            Debug.Log($"Joining match: {matchId}");
            
            apiClient.JoinMatch(matchId, localPlayerId, (response) =>
            {
                if (response != null && response.success)
                {
                    Debug.Log($"Joined! Server: {response.serverAddress}, Token: {response.joinToken}");
                    lobbyUI.ShowJoinSuccess(response.serverAddress);
                }
                else
                {
                    lobbyUI.ShowJoinError("Failed to join match");
                }
            });
        }

        private void HandleError(string error)
        {
            Debug.LogError(error);
            lobbyUI.ShowError(error);
        }

        private void OnDestroy()
        {
            if (apiClient != null)
            {
                apiClient.OnPlayersLoaded -= HandlePlayersLoaded;
                apiClient.OnMatchesLoaded -= HandleMatchesLoaded;
                apiClient.OnError -= HandleError;
            }
        }
    }
}
