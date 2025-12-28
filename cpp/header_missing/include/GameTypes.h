// GameTypes.h - Core type definitions

#include "Components.h"


namespace Game {

// Forward declarations
class Entity;
class Component;
class Transform;

struct EntityData {
    std::string name;
    std::vector<int> tags;
    Transform transform;
    std::unique_ptr<Entity> owner;
};

template<typename T>
class Container {
    std::vector<T> items;
public:
    void add(const T& item) { items.push_back(item); }
    T& get(size_t index) { return items[index]; }
};

using ComponentList = std::vector<Component*>;

// Enum used across files
enum class ComponentType {
    Transform,
    Physics,
    Render,
    Script
};

inline std::string getTypeName(ComponentType type) {
    switch (type) {
        case ComponentType::Transform: return "Transform";
        case ComponentType::Physics: return "Physics";
        case ComponentType::Render: return "Render";
        case ComponentType::Script: return "Script";
    }
    return "Unknown";
}

struct Callback {
    std::function<void(Entity*)> onUpdate;
    std::function<void(Entity*, Entity*)> onCollision;
};

using EntityMap = std::map<std::string, Entity*>;

template<>
class Container<std::string> {
    std::vector<std::string> strings;
public:
    void add(const std::string& s) { strings.push_back(s); }
};

} // namespace Game
