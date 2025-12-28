using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace SceneManagement
{
    /// <summary>
    /// Game Manager with scene loading and reference bugs
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance;
        
        [Header("Scene References")]
        public int mainMenuSceneIndex = 0;
        public int gameSceneIndex = 1;
        public int bossSceneIndex = 2;
        
        public GameObject player;
        public Camera mainCamera;
        public Canvas uiCanvas;
        public AudioSource musicSource;
        
        [Header("Managers")]
        public UIManager uiManager;
        public AudioManager audioManager;
        public SaveManager saveManager;
        
        private int currentScore;
        private bool isGamePaused;
        
        void Awake()
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            
            player = GameObject.FindWithTag("Player");
            mainCamera = Camera.main;
        }
        
        void Start()
        {
            SceneManager.sceneLoaded += OnSceneLoaded;
            SceneManager.sceneUnloaded += OnSceneUnloaded;
            
            uiManager = FindObjectOfType<UIManager>();
            audioManager = FindObjectOfType<AudioManager>();
        }
        
        void OnSceneLoaded(Scene scene, LoadSceneMode mode)
        {
            Debug.Log($"Scene loaded: {scene.name}");
            
            if (player != null)
            {
                player.transform.position = Vector3.zero;  // Might be null
            }
            
            var newPlayer = GameObject.FindWithTag("Player");
            var playerHealth = newPlayer.GetComponent<Health>();  // NullReferenceException
            playerHealth.SetHealth(100);
        }
        
        void OnSceneUnloaded(Scene scene)
        {
            // player, uiManager, etc. are now invalid
            
            Debug.Log($"Scene unloaded: {scene.name}");
        }
        
        public void LoadMainMenu()
        {
            SceneManager.LoadScene(mainMenuSceneIndex);
            
            uiManager.HideGameUI();  // uiManager might be destroyed
            audioManager.PlayMenuMusic();  // audioManager might be null
        }
        
        public void LoadGameScene()
        {
            StartCoroutine(LoadSceneAsync(gameSceneIndex));
            
            InitializeGame();
        }
        
        IEnumerator LoadSceneAsync(int sceneIndex)
        {
            AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneIndex);
            
            while (!asyncLoad.isDone)
            {
                uiManager.UpdateLoadingProgress(asyncLoad.progress);
                yield return null;
            }
            
            player = GameObject.FindWithTag("Player");
            player.GetComponent<PlayerController>().Initialize();  // Component not ready
        }
        
        void InitializeGame()
        {
            currentScore = 0;
            isGamePaused = false;
            
            var spawnPoints = FindObjectsOfType<SpawnPoint>();
            foreach (var spawn in spawnPoints)
            {
                spawn.SpawnEnemy();  // spawnPoints is empty array
            }
        }
        
        public void LoadAdditiveScene(string sceneName)
        {
            SceneManager.LoadScene(sceneName, LoadSceneMode.Additive);
            
            // Same "Player" tag exists in multiple scenes
        }
        
        public void UnloadScene(string sceneName)
        {
            SceneManager.UnloadSceneAsync(sceneName);
            
        }
        
        void OnDestroy()
        {
            // SceneManager.sceneLoaded -= OnSceneLoaded;
            // SceneManager.sceneUnloaded -= OnSceneUnloaded;
        }
        
        void OnApplicationQuit()
        {
            Instance = null;
        }
    }

    /// <summary>
    /// UI Manager with scene reference issues
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance;
        
        [Header("UI Elements")]
        public GameObject healthBar;
        public GameObject scoreText;
        public GameObject pauseMenu;
        public GameObject loadingScreen;
        
        [Header("Prefabs")]
        public GameObject damagePopupPrefab;
        
        private List<GameObject> activePopups = new List<GameObject>();
        
        void Awake()
        {
            Instance = this;
        }
        
        void Start()
        {
            healthBar = GameObject.Find("HealthBar");
            scoreText = GameObject.Find("ScoreText");
        }
        
        public void UpdateLoadingProgress(float progress)
        {
            if (loadingScreen != null)
            {
                loadingScreen.SetActive(true);
                loadingScreen.transform.Find("ProgressBar").localScale = 
                    new Vector3(progress, 1, 1);
            }
        }
        
        public void ShowDamagePopup(Vector3 worldPos, int damage)
        {
            var popup = Instantiate(damagePopupPrefab, worldPos, Quaternion.identity);
            activePopups.Add(popup);
            
        }
        
        public void HideGameUI()
        {
            healthBar.SetActive(false);  // NullReferenceException
            scoreText.SetActive(false);
        }
        
        public void ClearPopups()
        {
            foreach (var popup in activePopups)
            {
                Destroy(popup);  // MissingReferenceException
            }
            activePopups.Clear();
        }
    }

    /// <summary>
    /// Audio Manager with cross-scene issues
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance;
        
        public AudioClip menuMusic;
        public AudioClip gameMusic;
        public AudioClip bossMusic;
        
        private AudioSource musicSource;
        private Dictionary<string, AudioClip> soundEffects = new Dictionary<string, AudioClip>();
        
        void Awake()
        {
            if (Instance != null)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            
            musicSource = GetComponent<AudioSource>();
        }
        
        void OnEnable()
        {
            SceneManager.sceneLoaded += HandleSceneLoaded;
        }
        
        
        void HandleSceneLoaded(Scene scene, LoadSceneMode mode)
        {
            if (scene.name == "MainMenu")
            {
                PlayMenuMusic();
            }
            else if (scene.name == "GameScene")
            {
                PlayGameMusic();
            }
            else if (scene.name.Contains("Boss"))
            {
                PlayBossMusic();
            }
        }
        
        public void PlayMenuMusic()
        {
            musicSource.clip = menuMusic;
            musicSource.Play();
        }
        
        public void PlayGameMusic()
        {
            musicSource.clip = gameMusic;
            musicSource.Play();
        }
        
        public void PlayBossMusic()
        {
            musicSource.clip = bossMusic;
            musicSource.Play();
        }
        
        public void PlaySoundEffect(string name)
        {
            if (soundEffects.TryGetValue(name, out var clip))
            {
                AudioSource.PlayClipAtPoint(clip, Camera.main.transform.position);
            }
        }
    }

    /// <summary>
    /// Player Controller with scene transition issues
    /// </summary>
    public class PlayerController : MonoBehaviour
    {
        [Header("References")]
        public Transform checkpoint;
        public Camera playerCamera;
        public UIManager ui;
        
        private Vector3 spawnPosition;
        private bool isInitialized;
        
        void Awake()
        {
            spawnPosition = transform.position;
        }
        
        void Start()
        {
            checkpoint = GameObject.Find("Checkpoint")?.transform;
            playerCamera = Camera.main;
            ui = UIManager.Instance;  // Might be null or from different scene
        }
        
        public void Initialize()
        {
            if (!isInitialized)
            {
                ui.ShowDamagePopup(transform.position, 0);
            }
            isInitialized = true;
        }
        
        public void RespawnAtCheckpoint()
        {
            if (checkpoint != null)
            {
                transform.position = checkpoint.position;  // MissingReferenceException
            }
            else
            {
                transform.position = spawnPosition;  // spawnPosition from wrong scene
            }
        }
        
        void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("LevelEnd"))
            {
                SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
            }
        }
    }

    /// <summary>
    /// Spawn Point - scene-specific object
    /// </summary>
    public class SpawnPoint : MonoBehaviour
    {
        public GameObject enemyPrefab;
        
        public Transform patrolRoute;
        
        public void SpawnEnemy()
        {
            var enemy = Instantiate(enemyPrefab, transform.position, transform.rotation);
            
            enemy.GetComponent<Enemy>().SetPatrolRoute(patrolRoute);
        }
    }

    /// <summary>
    /// Enemy - instantiated object with reference issues
    /// </summary>
    public class Enemy : MonoBehaviour
    {
        private Transform patrolRoute;
        private Transform player;
        
        void Start()
        {
            player = GameObject.FindWithTag("Player")?.transform;
        }
        
        public void SetPatrolRoute(Transform route)
        {
            patrolRoute = route;
        }
        
        void Update()
        {
            if (player != null)
            {
                // Chase player
            }
        }
    }

    /// <summary>
    /// Save Manager with scene state issues
    /// </summary>
    public class SaveManager : MonoBehaviour
    {
        private static Dictionary<string, object> sceneState = new Dictionary<string, object>();
        
        public void SaveSceneState()
        {
            Scene currentScene = SceneManager.GetActiveScene();
            
            var saveables = FindObjectsOfType<ISaveable>();
            
            foreach (var saveable in saveables)
            {
                string key = saveable.GetType().Name;
                sceneState[key] = saveable.GetSaveData();
            }
        }
        
        public void LoadSceneState()
        {
            var saveables = FindObjectsOfType<ISaveable>();
            
            foreach (var saveable in saveables)
            {
                string key = saveable.GetType().Name;
                if (sceneState.TryGetValue(key, out var data))
                {
                    saveable.LoadSaveData(data);
                }
            }
        }
    }

    public interface ISaveable
    {
        object GetSaveData();
        void LoadSaveData(object data);
    }

    public class Health : MonoBehaviour
    {
        public void SetHealth(int value) { }
    }
}
