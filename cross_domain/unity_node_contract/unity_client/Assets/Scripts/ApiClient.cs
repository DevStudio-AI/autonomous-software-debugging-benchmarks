using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using LobbyClient.Models;

namespace LobbyClient
{
    public class ApiClient : MonoBehaviour
    {
        [SerializeField] private string baseUrl = "http://localhost:3000/api";
        
        public event Action<PlayerData[]> OnPlayersLoaded;
        public event Action<MatchData[]> OnMatchesLoaded;
        public event Action<string> OnError;

        public void FetchPlayers()
        {
            StartCoroutine(GetPlayers());
        }

        public void FetchMatches()
        {
            StartCoroutine(GetMatches());
        }

        public void JoinMatch(string matchId, string playerId, Action<JoinMatchResponse> callback)
        {
            StartCoroutine(PostJoinMatch(matchId, playerId, callback));
        }

        private IEnumerator GetPlayers()
        {
            using (var request = UnityWebRequest.Get($"{baseUrl}/players?online=true"))
            {
                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    OnError?.Invoke($"Failed to fetch players: {request.error}");
                    yield break;
                }

                var json = request.downloadHandler.text;
                Debug.Log($"Players response: {json}");

                // Deserialize expecting our model structure
                var response = JsonUtility.FromJson<PlayerListResponse>(json);
                OnPlayersLoaded?.Invoke(response.players);
            }
        }

        private IEnumerator GetMatches()
        {
            using (var request = UnityWebRequest.Get($"{baseUrl}/matches"))
            {
                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    OnError?.Invoke($"Failed to fetch matches: {request.error}");
                    yield break;
                }

                var json = request.downloadHandler.text;
                Debug.Log($"Matches response: {json}");

                // Expecting wrapped response, but backend sends raw array
                var response = JsonUtility.FromJson<MatchListResponse>(json);
                OnMatchesLoaded?.Invoke(response.matches);
            }
        }

        private IEnumerator PostJoinMatch(string matchId, string playerId, Action<JoinMatchResponse> callback)
        {
            var body = JsonUtility.ToJson(new JoinRequest { matchId = matchId, playerId = playerId });
            
            using (var request = new UnityWebRequest($"{baseUrl}/matches/join", "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(System.Text.Encoding.UTF8.GetBytes(body));
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");

                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    OnError?.Invoke($"Failed to join match: {request.error}");
                    callback?.Invoke(null);
                    yield break;
                }

                var response = JsonUtility.FromJson<JoinMatchResponse>(request.downloadHandler.text);
                callback?.Invoke(response);
            }
        }

        [Serializable]
        private class JoinRequest
        {
            public string matchId;
            public string playerId;
        }
    }
}
