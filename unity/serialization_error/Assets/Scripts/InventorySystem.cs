using System;
using System.Collections.Generic;
using UnityEngine;

namespace InventorySystem
{
    /// <summary>
    /// Inventory System with Unity serialization bugs
    /// </summary>
    
    public class ItemData
    {
        public string itemName;
        public int quantity;
        public float weight;
    }

    [Serializable]
    public struct WeaponStats
    {
        public int damage;
        public float attackSpeed;
        
        public int DPS => (int)(damage * attackSpeed);
        
        public static int GlobalDamageBonus = 0;
    }

    [Serializable]
    public class Container<T>
    {
        public T item;
        public int count;
    }

    public interface IItem
    {
        string Name { get; }
        void Use();
    }

    [Serializable]
    public class Potion : IItem
    {
        public string potionName;
        public int healAmount;
        
        public string Name => potionName;
        public void Use() { }
    }

    /// <summary>
    /// Player Inventory with serialization bugs
    /// </summary>
    public class PlayerInventory : MonoBehaviour
    {
        [Header("Inventory Settings")]
        public int maxSlots = 20;
        
        public Dictionary<string, int> itemCounts = new Dictionary<string, int>();
        
        public HashSet<string> discoveredItems = new HashSet<string>();
        
        public List<ItemData> items = new List<ItemData>();
        
        public IItem equippedItem;
        
        public int? lastSelectedSlot;
        
        public ItemData[,] inventoryGrid = new ItemData[4, 5];
        
        public ItemData[][] equipmentSlots;
        
        private int gold;
        
        public int Gold
        {
            get => gold;
            set => gold = value;
        }
        
        public readonly string inventoryVersion = "1.0";
        
        public const int MAX_STACK = 99;
        
        public Action<ItemData> OnItemAdded;
        public event Action<int> OnGoldChanged;
        
        // This WILL serialize - for comparison
        [SerializeField]
        private List<string> itemNames = new List<string>();
        
        void Start()
        {
            // Initialize non-serializable collections
            itemCounts["sword"] = 1;
            discoveredItems.Add("potion");
        }
        
        void OnValidate()
        {
            if (items == null)
            {
                items = new List<ItemData>();
            }
            
            Debug.Log($"Inventory validated with {items.Count} items");
        }
    }

    /// <summary>
    /// ScriptableObject with serialization issues
    /// </summary>
    [CreateAssetMenu(fileName = "ItemDatabase", menuName = "Inventory/Item Database")]
    public class ItemDatabase : ScriptableObject
    {
        public Dictionary<int, ItemData> itemsById = new Dictionary<int, ItemData>();
        
        public List<ItemData> allItems = new List<ItemData>();
        
        public ItemDatabase parentDatabase;
        
        public ItemDatabase linkedDatabase;
        
        void OnEnable()
        {
            RebuildDictionary();
        }
        
        void RebuildDictionary()
        {
            itemsById.Clear();
            for (int i = 0; i < allItems.Count; i++)
            {
                if (allItems[i] != null)
                {
                    itemsById[i] = allItems[i];
                }
            }
        }
    }

    /// <summary>
    /// Save System with serialization bugs
    /// </summary>
    [Serializable]
    public class SaveData
    {
        public string playerName;
        public Vector3 position;  // Vector3 serializes fine
        
        public Transform playerTransform;
        
        public GameObject playerObject;
        
        public Quaternion rotation;
        
        public Color playerColor;
        
        public Material playerMaterial;
        public Sprite playerIcon;
        public AudioClip footstepSound;
        
        public DateTime saveTime;
        
        public Guid saveId;
        
        public SaveData nestedSave;  // Recursive reference
    }

    public class SaveManager : MonoBehaviour
    {
        public SaveData currentSave;
        
        public void Save()
        {
            currentSave = new SaveData
            {
                playerName = "Test",
                position = transform.position,
                playerTransform = transform,
                playerObject = gameObject,
                rotation = transform.rotation,
                saveTime = DateTime.Now
            };
            
            string json = JsonUtility.ToJson(currentSave);
            PlayerPrefs.SetString("save", json);
        }
        
        public void Load()
        {
            string json = PlayerPrefs.GetString("save");
            currentSave = JsonUtility.FromJson<SaveData>(json);
            
            Debug.Log($"Transform: {currentSave.playerTransform}");  // null
            Debug.Log($"GameObject: {currentSave.playerObject}");    // null
        }
    }

    /// <summary>
    /// Polymorphism serialization bugs
    /// </summary>
    [Serializable]
    public class BaseItem
    {
        public string name;
        public int value;
    }

    [Serializable]
    public class Weapon : BaseItem
    {
        public int damage;
        public float range;
    }

    [Serializable]
    public class Armor : BaseItem
    {
        public int defense;
        public float weight;
    }

    public class Equipment : MonoBehaviour
    {
        public List<BaseItem> items = new List<BaseItem>();
        
        public BaseItem weapon;  // Will lose Weapon-specific data
        public BaseItem armor;   // Will lose Armor-specific data
        
        // Correct way (Unity 2019.3+)
        [SerializeReference]
        public List<BaseItem> properItems = new List<BaseItem>();
        
        void Start()
        {
            // Add derived types
            items.Add(new Weapon { name = "Sword", damage = 10 });
            items.Add(new Armor { name = "Shield", defense = 5 });
            
        }
    }

    /// <summary>
    /// Custom class in arrays
    /// </summary>
    public class GridInventory : MonoBehaviour
    {
        public ItemData[,] grid;
        
        // Workaround that also has issues
        [Serializable]
        public class InventoryRow
        {
            public ItemData[] items;
        }
        
        public InventoryRow[] rows;
        
        public List<ItemData[]> itemArrays;
        
        void Awake()
        {
            grid = new ItemData[4, 5];
            
        }
    }

    /// <summary>
    /// Unity Object references in serializable classes
    /// </summary>
    [Serializable]
    public class ItemSpawnData
    {
        public string itemId;
        public Vector3 spawnPosition;
        
        public GameObject prefab;
        
        public Collider spawnTrigger;
    }

    public class ItemSpawner : MonoBehaviour
    {
        // This works because it's on a MonoBehaviour
        public GameObject prefab;
        
        public List<ItemSpawnData> spawnPoints;
        
        void SpawnItems()
        {
            foreach (var spawn in spawnPoints)
            {
                if (spawn.prefab != null)
                {
                    Instantiate(spawn.prefab, spawn.spawnPosition, Quaternion.identity);
                }
            }
        }
    }
}
