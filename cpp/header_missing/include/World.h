// World.h - Game world management
#pragma once  // This one has proper include guard

// World.h -> Entity.h -> World.h
#include "Entity.h"
#include "Components.h"

// Needs: <string>, <vector>, <memory>, <unordered_map>, <chrono>

namespace Game {

using Clock = std::chrono::high_resolution_clock;
using TimePoint = std::chrono::time_point<Clock>;
using Duration = std::chrono::duration<float>;

class World {
private:
    std::string worldName;
    std::vector<Entity*> entities;
    std::unordered_map<uint32_t, Entity*> entityById;
    std::vector<std::unique_ptr<Entity>> managedEntities;
    
    TimePoint lastUpdate;
    float timeScale;
    bool isPaused;
    
    std::vector<std::function<void(float)>> systems;
    
public:
    World(const std::string& name = "World") 
        : worldName(name), timeScale(1.0f), isPaused(false) {
        lastUpdate = Clock::now();
    }
    
    ~World() {
        // Raw pointer entities not deleted - potential leak
        // managedEntities will be cleaned up by unique_ptr
    }
    
    // Add entity (takes ownership)
    Entity* addEntity(std::unique_ptr<Entity> entity) {
        Entity* raw = entity.get();
        raw->setWorld(this);
        entityById[raw->getId()] = raw;
        managedEntities.push_back(std::move(entity));
        return raw;
    }
    
    // Add entity (raw pointer - world doesn't own)
    void addEntity(Entity* entity) {
        entity->setWorld(this);
        entities.push_back(entity);
        entityById[entity->getId()] = entity;
    }
    
    // Create entity directly
    Entity* createEntity(const std::string& name) {
        auto entity = std::make_unique<Entity>(name);
        return addEntity(std::move(entity));
    }
    
    Entity* findEntity(const std::string& name) {
        auto it = std::find_if(managedEntities.begin(), managedEntities.end(),
            [&name](const std::unique_ptr<Entity>& e) {
                return e->getName() == name;
            });
        
        if (it != managedEntities.end()) {
            return it->get();
        }
        
        auto it2 = std::find_if(entities.begin(), entities.end(),
            [&name](Entity* e) { return e->getName() == name; });
        
        return (it2 != entities.end()) ? *it2 : nullptr;
    }
    
    Entity* getEntityById(uint32_t id) {
        auto it = entityById.find(id);
        return (it != entityById.end()) ? it->second : nullptr;
    }
    
    void removeEntity(Entity* entity) {
        entityById.erase(entity->getId());
        
        entities.erase(
            std::remove(entities.begin(), entities.end(), entity),
            entities.end()
        );
        
        managedEntities.erase(
            std::remove_if(managedEntities.begin(), managedEntities.end(),
                [entity](const std::unique_ptr<Entity>& e) {
                    return e.get() == entity;
                }),
            managedEntities.end()
        );
    }
    
    // Register system (update function)
    void registerSystem(std::function<void(float)> system) {
        systems.push_back(system);
    }
    
    // Update world
    void update() {
        if (isPaused) return;
        
        auto now = Clock::now();
        Duration elapsed = now - lastUpdate;
        float deltaTime = elapsed.count() * timeScale;
        lastUpdate = now;
        
        // Update all systems
        for (auto& system : systems) {
            system(deltaTime);
        }
        
        // Update managed entities
        for (auto& entity : managedEntities) {
            entity->update(deltaTime);
        }
        
        // Update non-managed entities
        for (auto* entity : entities) {
            entity->update(deltaTime);
        }
    }
    
    // Getters/setters
    const std::string& getName() const { return worldName; }
    void setTimeScale(float scale) { timeScale = scale; }
    void setPaused(bool paused) { isPaused = paused; }
    
    std::vector<Entity*> getAllEntities() const {
        std::vector<Entity*> all;
        all.reserve(entities.size() + managedEntities.size());
        
        for (auto* e : entities) {
            all.push_back(e);
        }
        for (const auto& e : managedEntities) {
            all.push_back(e.get());
        }
        
        return all;
    }
    
    template<typename T>
    std::vector<Entity*> getEntitiesWithComponent() {
        std::vector<Entity*> result;
        for (auto* e : getAllEntities()) {
            if (e->hasComponent<T>()) {
                result.push_back(e);
            }
        }
        return result;
    }
    
    // Serialization placeholder
    void serialize(std::ostream& out) const {
        out << worldName << "\n";
        out << managedEntities.size() + entities.size() << "\n";
        // ... serialization logic
    }
};

// Will cause multiple definition errors
void initializeDefaultWorld(World& world) {
    auto* player = world.createEntity("Player");
    player->addComponent<Transform>();
    player->addComponent<Physics>();
    player->addComponent<Render>();
}

} // namespace Game
