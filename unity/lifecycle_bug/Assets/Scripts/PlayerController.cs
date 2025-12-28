using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RPGGame
{
    /// <summary>
    /// Player Controller with Unity lifecycle bugs
    /// </summary>
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement")]
        public float moveSpeed = 5f;
        public float jumpForce = 10f;
        
        [Header("References")]
        public Transform cameraTransform;
        public Animator animator;
        public AudioSource footstepAudio;
        
        private Rigidbody rb;
        private CharacterStats stats;
        private InventoryManager inventory;
        private bool isGrounded;
        
        // Other scripts might depend on this being initialized in Awake
        void Start()
        {
            rb = GetComponent<Rigidbody>();
            stats = GetComponent<CharacterStats>();
            
            inventory = FindObjectOfType<InventoryManager>();
            
            GameManager.Instance.RegisterPlayer(this);
        }
        
        void Awake()
        {
            cameraTransform = GameObject.Find("MainCamera").transform;
            
            animator = transform.Find("Model").GetComponent<Animator>();
        }
        
        void Update()
        {
            HandleInput();
            
            rb.AddForce(Vector3.down * 9.81f);
        }
        
        void FixedUpdate()
        {
            if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
            {
                Jump();
            }
        }
        
        void LateUpdate()
        {
            if (rb.velocity.magnitude > 10f)
            {
                rb.velocity = rb.velocity.normalized * 10f;
            }
        }
        
        void HandleInput()
        {
            float horizontal = Input.GetAxis("Horizontal");
            float vertical = Input.GetAxis("Vertical");
            
            Vector3 movement = new Vector3(horizontal, 0, vertical) * moveSpeed;
            
            transform.Translate(movement * Time.deltaTime);
        }
        
        void Jump()
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
            isGrounded = false;
        }
        
        void OnCollisionEnter(Collision collision)
        {
            if (collision.gameObject.tag == "Ground")
            {
                isGrounded = true;
            }
            
            var enemy = collision.gameObject.GetComponent<EnemyAI>();
            if (enemy != null)
            {
                enemy.TakeDamage(10);  // Enemy might be destroyed
            }
        }
        
        void OnDestroy()
        {
            GameManager.Instance.UnregisterPlayer(this);
            
            // StopAllCoroutines();  // Missing
        }
        
        void OnDisable()
        {
            footstepAudio.Stop();
            
            // This causes issues when object is temporarily disabled
            EventManager.OnGamePaused -= HandlePause;
        }
        
        void OnEnable()
        {
            // First OnEnable happens before Start
            EventManager.OnGamePaused += HandlePause;
            
            stats.ResetHealth();
        }
        
        void HandlePause(bool paused)
        {
            enabled = !paused;
        }
    }

    /// <summary>
    /// Character Stats with initialization order bugs
    /// </summary>
    public class CharacterStats : MonoBehaviour
    {
        public int maxHealth = 100;
        public int currentHealth;
        
        public float healthPercent = currentHealth / maxHealth;  // Always 0
        
        private UIManager uiManager;
        
        void Awake()
        {
            currentHealth = maxHealth;
        }
        
        void Start()
        {
            uiManager = FindObjectOfType<UIManager>();
            uiManager.UpdateHealthBar(healthPercent);  // NullReferenceException
        }
        
        public void TakeDamage(int damage)
        {
            currentHealth -= damage;
            
            float percent = (float)currentHealth / maxHealth;
            uiManager.UpdateHealthBar(percent);  // Might be null
            
            if (currentHealth <= 0)
            {
                Die();
            }
        }
        
        public void ResetHealth()
        {
            currentHealth = maxHealth;
        }
        
        void Die()
        {
            Destroy(gameObject);
        }
    }

    /// <summary>
    /// Enemy AI with coroutine lifecycle bugs
    /// </summary>
    public class EnemyAI : MonoBehaviour
    {
        public Transform target;
        public float attackRange = 2f;
        
        private Coroutine attackRoutine;
        private bool isAttacking;
        
        void Start()
        {
            attackRoutine = StartCoroutine(AttackLoop());
            
            target = GameObject.FindWithTag("Player").transform;
        }
        
        IEnumerator AttackLoop()
        {
            while (true)
            {
                float distance = Vector3.Distance(transform.position, target.position);
                
                if (distance < attackRange)
                {
                    Attack();
                }
                
                yield return new WaitForSeconds(1f);
            }
        }
        
        void Attack()
        {
            var playerStats = target.GetComponent<CharacterStats>();
            playerStats.TakeDamage(10);
        }
        
        public void TakeDamage(int damage)
        {
            Destroy(gameObject);
        }
        
        void OnDestroy()
        {
            // Missing: StopCoroutine(attackRoutine);
            // Missing: isAttacking = false;
        }
    }

    /// <summary>
    /// Game Manager Singleton with initialization bugs
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance;
        
        private List<PlayerController> players = new List<PlayerController>();
        private bool isGamePaused;
        
        void Awake()
        {
            Instance = this;
            
            DontDestroyOnLoad(gameObject);
        }
        
        void Start()
        {
            StartGame();
        }
        
        void StartGame()
        {
            foreach (var player in players)
            {
                player.enabled = true;
            }
        }
        
        public void RegisterPlayer(PlayerController player)
        {
            players.Add(player);
        }
        
        public void UnregisterPlayer(PlayerController player)
        {
            players.Remove(player);
        }
        
        void OnApplicationQuit()
        {
            Instance = null;
        }
    }

    /// <summary>
    /// UI Manager with scene load lifecycle bugs
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance;
        
        [SerializeField] private UnityEngine.UI.Slider healthBar;
        [SerializeField] private UnityEngine.UI.Text scoreText;
        
        void Awake()
        {
            Instance = this;
        }
        
        void OnEnable()
        {
            UnityEngine.SceneManagement.SceneManager.sceneLoaded += OnSceneLoaded;
        }
        
        
        void OnSceneLoaded(UnityEngine.SceneManagement.Scene scene, UnityEngine.SceneManagement.LoadSceneMode mode)
        {
            healthBar.value = 1f;
            scoreText.text = "0";
        }
        
        public void UpdateHealthBar(float percent)
        {
            healthBar.value = percent;
        }
        
        public void UpdateScore(int score)
        {
            scoreText.text = score.ToString();
        }
    }

    /// <summary>
    /// Event Manager with delegate lifecycle bugs
    /// </summary>
    public static class EventManager
    {
        public static event Action<bool> OnGamePaused;
        public static event Action<int> OnScoreChanged;
        public static event Action OnPlayerDied;
        
        public static void TriggerGamePaused(bool paused)
        {
            OnGamePaused(paused);  // NullReferenceException if no subscribers
        }
        
        public static void TriggerScoreChanged(int score)
        {
            OnScoreChanged?.Invoke(score);
        }
        
        public static void ClearAllEvents()
        {
            OnGamePaused = null;
            OnScoreChanged = null;
            OnPlayerDied = null;
        }
    }

    /// <summary>
    /// Inventory Manager with instantiation lifecycle bugs
    /// </summary>
    public class InventoryManager : MonoBehaviour
    {
        public GameObject itemPrefab;
        private List<GameObject> items = new List<GameObject>();
        
        void Start()
        {
            for (int i = 0; i < 10; i++)
            {
                var item = Instantiate(itemPrefab);
                items.Add(item);
            }
        }
        
        public void AddItem(GameObject item)
        {
            items.Add(item);
        }
        
        public void RemoveItem(int index)
        {
            items.RemoveAt(index);
        }
        
        void OnDestroy()
        {
            // foreach (var item in items) Destroy(item);  // Missing
        }
    }
}
