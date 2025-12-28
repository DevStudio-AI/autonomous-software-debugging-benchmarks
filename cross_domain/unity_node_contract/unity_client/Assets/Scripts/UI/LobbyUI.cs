using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System;

namespace LobbyClient
{
    public class LobbyUI : MonoBehaviour
    {
        [Header("Player List")]
        [SerializeField] private Transform playerListContainer;
        [SerializeField] private GameObject playerEntryPrefab;

        [Header("Match List")]
        [SerializeField] private Transform matchListContainer;
        [SerializeField] private GameObject matchEntryPrefab;

        [Header("Status")]
        [SerializeField] private TextMeshProUGUI statusText;
        [SerializeField] private GameObject errorPanel;
        [SerializeField] private TextMeshProUGUI errorText;

        public event Action<string> OnJoinClicked;

        public void ClearPlayerList()
        {
            foreach (Transform child in playerListContainer)
            {
                Destroy(child.gameObject);
            }
        }

        public void AddPlayerEntry(string displayText, bool isOnline)
        {
            var entry = Instantiate(playerEntryPrefab, playerListContainer);
            var text = entry.GetComponentInChildren<TextMeshProUGUI>();
            if (text != null)
            {
                text.text = displayText;
                text.color = isOnline ? Color.green : Color.gray;
            }
        }

        public void ClearMatchList()
        {
            foreach (Transform child in matchListContainer)
            {
                Destroy(child.gameObject);
            }
        }

        public void AddMatchEntry(string matchId, string displayText, bool canJoin)
        {
            var entry = Instantiate(matchEntryPrefab, matchListContainer);
            
            var text = entry.GetComponentInChildren<TextMeshProUGUI>();
            if (text != null)
            {
                text.text = displayText;
            }

            var button = entry.GetComponentInChildren<Button>();
            if (button != null)
            {
                button.interactable = canJoin;
                button.onClick.AddListener(() => OnJoinClicked?.Invoke(matchId));
            }
        }

        public void ShowJoinSuccess(string serverAddress)
        {
            statusText.text = $"Connecting to {serverAddress}...";
            statusText.color = Color.green;
        }

        public void ShowJoinError(string message)
        {
            statusText.text = message;
            statusText.color = Color.red;
        }

        public void ShowError(string message)
        {
            errorPanel.SetActive(true);
            errorText.text = message;
        }

        public void HideError()
        {
            errorPanel.SetActive(false);
        }
    }
}
