// GameState.h - Game State Management
#ifndef GAMESTATE_H
#define GAMESTATE_H


// Forward declarations - some are incomplete/wrong
class Entity;           // OK but used in ways that need full definition
class Component;        // OK
struct Transform;
class PhysicsBody;

namespace Game {

using EntityId = uint64_t;
using ComponentMask = std::bitset<64>;

enum class ComponentType : uint16_t {
    TRANSFORM = 0,
    RENDERER,
    PHYSICS,
    COLLIDER,
    SCRIPT,
    AUDIO,
    PARTICLE,
    LIGHT,
    CAMERA
};

struct Transform {
    Vector3 position;
    Quaternion rotation;
    Vector3 scale;
    
    Matrix4x4 getWorldMatrix() const;
    Transform getInverse() const;
};

struct PhysicsState {
    Vector3 velocity;
    Vector3 angularVelocity;
    Vector3 acceleration;
    float mass;
    float drag;
    float angularDrag;
    bool isKinematic;
    bool useGravity;
};

using PropertyValue = std::variant<int, float, bool, std::string, Vector3>;

class Component {
public:
    virtual ~Component() = default;
    virtual ComponentType getType() const = 0;
    virtual std::unique_ptr<Component> clone() const = 0;
    
    EntityId getOwner() const { return ownerId; }
    void setOwner(EntityId id) { ownerId = id; }
    
    // Serialization
    virtual json serialize() const = 0;
    virtual void deserialize(const json& data) = 0;
    
protected:
    EntityId ownerId = 0;
};

class Entity {
public:
    Entity(EntityId id);
    ~Entity();
    
    EntityId getId() const { return id; }
    const std::string& getName() const { return name; }
    void setName(const std::string& newName) { name = newName; }
    
    // Component management -
    template<typename T>
    T* addComponent() {
        auto component = std::make_unique<T>();
        component->setOwner(id);
        T* ptr = component.get();
        components[T::Type] = std::move(component);
        return ptr;
    }
    
    template<typename T>
    T* getComponent() {
        auto it = components.find(T::Type);
        if (it != components.end()) {
            return static_cast<T*>(it->second.get());
        }
        return nullptr;
    }
    
    template<typename T>
    bool hasComponent() const {
        return components.count(T::Type) > 0;
    }
    
    void removeComponent(ComponentType type);
    ComponentMask getComponentMask() const;
    
    // Hierarchy
    Entity* getParent() const { return parent; }
    void setParent(Entity* newParent);
    const std::vector<Entity*>& getChildren() const { return children; }
    void addChild(Entity* child);
    void removeChild(Entity* child);
    
    // State
    bool isActive() const { return active; }
    void setActive(bool value);
    
private:
    EntityId id;
    std::string name;
    bool active = true;
    
    Entity* parent = nullptr;
    std::vector<Entity*> children;
    
    std::map<ComponentType, std::unique_ptr<Component>> components;
};

class GameState {
public:
    GameState();
    ~GameState();
    
    // Entity management
    Entity* createEntity(const std::string& name = "Entity");
    void destroyEntity(EntityId id);
    Entity* getEntity(EntityId id);
    const std::vector<Entity*>& getAllEntities() const;
    
    // Queries
    template<typename... Components>
    std::vector<Entity*> getEntitiesWith() {
        std::vector<Entity*> result;
        for (auto* entity : entities) {
            if ((entity->hasComponent<Components>() && ...)) {
                result.push_back(entity);
            }
        }
        return result;
    }
    
    // Serialization
    json serialize() const;
    void deserialize(const json& data);
    
    // State management
    void clear();
    void reset();
    
    // Delta compression for networking
    GameStateDelta computeDelta(const GameState& previous) const;
    void applyDelta(const GameStateDelta& delta);
    
private:
    std::vector<Entity*> entities;
    std::unordered_map<EntityId, Entity*> entityLookup;
    EntityId nextEntityId = 1;
    
    // Object pool for performance
    ObjectPool<Entity> entityPool;
};

class GameStateManager {
public:
    static GameStateManager& getInstance();
    
    // State stack
    void pushState(std::unique_ptr<GameState> state);
    void popState();
    GameState* getCurrentState();
    
    // Snapshots for rollback
    void saveSnapshot();
    void loadSnapshot(size_t index);
    void clearSnapshots();
    
    // Interpolation for networking
    GameState interpolate(const GameState& from, const GameState& to, float alpha);
    
private:
    GameStateManager() = default;
    
    std::stack<std::unique_ptr<GameState>> stateStack;
    std::deque<GameState> snapshots;
    size_t maxSnapshots = 60;
};

}  // namespace Game

#endif  // GAMESTATE_H
