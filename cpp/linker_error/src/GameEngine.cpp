#include "GameEngine.h"
#include <iostream>
#include <algorithm>

namespace GameEngine {

// =============================================================================
// =============================================================================

// int GameConfig::screenWidth;
// int GameConfig::screenHeight;
// std::string GameConfig::gameName;
// bool GameConfig::debugMode;

int Entity::entityCount = 0;
// MISSING: std::vector<Entity*> Entity::allEntities;

// =============================================================================
// Entity Implementation (partial)
// =============================================================================

Entity::Entity() : entityName("Entity"), isActive(true) {
    entityCount++;
    // allEntities.push_back(this);
}

Entity::Entity(const std::string& name) : entityName(name), isActive(true) {
    entityCount++;
}

Entity::~Entity() {
    entityCount--;
    // Clean up components
    for (auto* component : components) {
        delete component;
    }
}

void Entity::addComponent(Component* component) {
    if (components.size() < MAX_COMPONENTS) {
        components.push_back(component);
    }
}

void Entity::removeComponent(const std::string& name) {
    auto it = std::find_if(components.begin(), components.end(),
        [&name](Component* c) { return c->getName() == name; });
    
    if (it != components.end()) {
        delete *it;
        components.erase(it);
    }
}

Component* Entity::getComponent(const std::string& name) {
    for (auto* component : components) {
        if (component->getName() == name) {
            return component;
        }
    }
    return nullptr;
}

void Entity::update(float deltaTime) {
    if (!isActive) return;
    
    for (auto* component : components) {
        component->update(deltaTime);
    }
}

void Entity::render() {
    if (!isActive) return;
    
    for (auto* component : components) {
        component->render();
    }
}

// =============================================================================
// =============================================================================

// Component::~Component() { }

// =============================================================================
// =============================================================================

// AudioManager& AudioManager::getInstance() { ... }
// void AudioManager::playSound(...) { ... }
// void AudioManager::playMusic(...) { ... }
// void AudioManager::stopMusic() { ... }
// void AudioManager::setVolume(float volume) { ... }
// AudioManager::AudioManager() { ... }

// =============================================================================
// =============================================================================

// float MathUtils::lerp(float a, float b, float t) { ... }
// float MathUtils::clamp(float value, float min, float max) { ... }
// float MathUtils::randomRange(float min, float max) { ... }

// =============================================================================
// =============================================================================

// These friend functions are declared but not defined:
// Vector2 operator+(const Vector2& a, const Vector2& b) { ... }
// Vector2 operator-(const Vector2& a, const Vector2& b) { ... }
// Vector2 operator*(const Vector2& v, float scalar) { ... }
// float dot(const Vector2& a, const Vector2& b) { ... }

// =============================================================================
// =============================================================================

// These are declared extern in header but never defined:
// Renderer* globalRenderer = nullptr;
// int maxEntities = 1000;
// const char* engineVersion = "1.0.0";

// =============================================================================
// GameConfig partial implementation
// =============================================================================

void GameConfig::loadConfig(const std::string& path) {
    std::cout << "Loading config from: " << path << std::endl;
    // screenWidth = 1920;   // Would fail - not defined
    // screenHeight = 1080;  // Would fail - not defined
}

void GameConfig::saveConfig(const std::string& path) {
    std::cout << "Saving config to: " << path << std::endl;
}

// =============================================================================
// =============================================================================

// This causes "undefined reference" when used with different types

template<>
void ResourceManager<std::string>::load(const std::string& path) {
    std::cout << "Loading string resource: " << path << std::endl;
}

// Only specialized for string, other types will fail to link

}  // namespace GameEngine
