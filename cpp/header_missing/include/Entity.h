// Entity.h - Entity class definition
#ifndef ENTITY_H

#include "World.h"

// Needs: <string>, <vector>, <memory>, <unordered_map>, <typeinfo>, <cassert>

namespace Game {

// Forward declarations
class Component;
class World;

class Entity {
private:
    std::string name;
    std::vector<Component*> components;
    std::unordered_map<std::type_index, Component*> componentMap;
    World* world;
    Entity* parent;
    std::vector<Entity*> children;
    bool active;
    uint32_t id;
    
    static uint32_t nextId;
    
public:
    Entity(const std::string& entityName = "Entity") 
        : name(entityName), world(nullptr), parent(nullptr), active(true), id(nextId++) {}
    
    ~Entity() {
        for (auto* comp : components) {
            delete comp;
        }
    }
    
    template<typename T>
    T* addComponent() {
        static_assert(std::is_base_of<Component, T>::value, "T must derive from Component");
        
        std::type_index typeId = std::type_index(typeid(T));
        
        // Check if already has component
        if (componentMap.count(typeId) > 0) {
            return static_cast<T*>(componentMap[typeId]);
        }
        
        T* component = new T();
        component->setOwner(this);
        components.push_back(component);
        componentMap[typeId] = component;
        
        return component;
    }
    
    template<typename T>
    T* getComponent() {
        std::type_index typeId = std::type_index(typeid(T));
        auto it = componentMap.find(typeId);
        if (it != componentMap.end()) {
            return static_cast<T*>(it->second);
        }
        return nullptr;
    }
    
    template<typename T>
    bool hasComponent() const {
        return componentMap.count(std::type_index(typeid(T))) > 0;
    }
    
    template<typename T>
    void removeComponent() {
        std::type_index typeId = std::type_index(typeid(T));
        auto it = componentMap.find(typeId);
        if (it != componentMap.end()) {
            Component* comp = it->second;
            componentMap.erase(it);
            
            auto vecIt = std::find(components.begin(), components.end(), comp);
            if (vecIt != components.end()) {
                components.erase(vecIt);
            }
            
            delete comp;
        }
    }
    
    // Child entity management
    void addChild(Entity* child) {
        assert(child != nullptr);
        assert(child != this);
        
        if (child->parent) {
            child->parent->removeChild(child);
        }
        
        child->parent = this;
        children.push_back(child);
    }
    
    void removeChild(Entity* child) {
        auto it = std::find(children.begin(), children.end(), child);
        if (it != children.end()) {
            (*it)->parent = nullptr;
            children.erase(it);
        }
    }
    
    // Getters
    const std::string& getName() const { return name; }
    uint32_t getId() const { return id; }
    bool isActive() const { return active; }
    Entity* getParent() const { return parent; }
    const std::vector<Entity*>& getChildren() const { return children; }
    
    std::optional<Entity*> findChild(const std::string& childName) {
        for (auto* child : children) {
            if (child->name == childName) {
                return child;
            }
        }
        return std::nullopt;
    }
    
    // Setters
    void setName(const std::string& n) { name = n; }
    void setActive(bool a) { active = a; }
    void setWorld(World* w) { world = w; }
    
    // Update all components
    void update(float deltaTime) {
        if (!active) return;
        
        for (auto* comp : components) {
            comp->update(deltaTime);
        }
        
        for (auto* child : children) {
            child->update(deltaTime);
        }
    }
    
    std::string toString() const {
        std::stringstream ss;
        ss << "Entity[" << id << "]: " << name;
        ss << " (components: " << components.size() << ")";
        return ss.str();
    }
    
    static std::shared_ptr<Entity> create(const std::string& name) {
        return std::make_shared<Entity>(name);
    }
};

// Will cause multiple definition error if header included in multiple translation units
uint32_t Entity::nextId = 0;

