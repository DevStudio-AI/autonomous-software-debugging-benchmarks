// Components.h - Component definitions

#include "GameTypes.h"
#include "Entity.h"

// Should have: <string>, <cmath>, <iostream>

namespace Game {

class Component {
protected:
    Entity* owner;
    
public:
    Component() : owner(nullptr) {}
    virtual ~Component() = default;
    
    void setOwner(Entity* e) { owner = e; }
    Entity* getOwner() const { return owner; }
    
    virtual ComponentType getType() const = 0;
    virtual void update(float deltaTime) = 0;
    
    virtual void debug() {
        std::cout << "Component on entity" << std::endl;
    }
};

// Transform component
class Transform : public Component {
public:
    float x, y, z;
    float rotX, rotY, rotZ;
    float scaleX, scaleY, scaleZ;
    
    Transform() : x(0), y(0), z(0), 
                  rotX(0), rotY(0), rotZ(0),
                  scaleX(1), scaleY(1), scaleZ(1) {}
    
    ComponentType getType() const override { return ComponentType::Transform; }
    
    void update(float deltaTime) override {
        x += std::sin(rotY) * deltaTime;
        z += std::cos(rotY) * deltaTime;
    }
    
    float distanceTo(const Transform& other) const {
        float dx = other.x - x;
        float dy = other.y - y;
        float dz = other.z - z;
        return std::sqrt(dx*dx + dy*dy + dz*dz);
    }
    
    void debug() override {
        std::cout << "Transform: (" << x << ", " << y << ", " << z << ")" << std::endl;
    }
};

// Physics component
class Physics : public Component {
public:
    float velocityX, velocityY, velocityZ;
    float mass;
    bool isKinematic;
    
    void applyForce(float fx, float fy, float fz) {
        if (!isKinematic && mass > 0) {
            velocityX += fx / mass;
            velocityY += fy / mass;
            velocityZ += fz / mass;
            
            // Clamp velocity
            velocityX = std::clamp(velocityX, -100.0f, 100.0f);
            velocityY = std::clamp(velocityY, -100.0f, 100.0f);
            velocityZ = std::clamp(velocityZ, -100.0f, 100.0f);
        }
    }
    
    ComponentType getType() const override { return ComponentType::Physics; }
    
    void update(float deltaTime) override {
        if (owner) {
            Transform* transform = owner->getComponent<Transform>();
            if (transform) {
                transform->x += velocityX * deltaTime;
                transform->y += velocityY * deltaTime;
                transform->z += velocityZ * deltaTime;
            }
        }
    }
    
    float getSpeed() const {
        return std::sqrt(velocityX*velocityX + velocityY*velocityY + velocityZ*velocityZ);
    }
};

// Render component
class Render : public Component {
public:
    std::string meshPath;
    std::string texturePath;
    bool visible;
    float opacity;
    
    std::array<float, 4> color;  // RGBA
    
    Render() : visible(true), opacity(1.0f), color{1, 1, 1, 1} {}
    
    ComponentType getType() const override { return ComponentType::Render; }
    
    void update(float deltaTime) override {
        // Rendering logic would go here
    }
    
    void setOpacity(float o) {
        opacity = std::min(1.0f, std::max(0.0f, o));
    }
};

// Script component with callback
class Script : public Component {
public:
    Callback callbacks;  // From GameTypes.h
    std::string scriptName;
    
    ComponentType getType() const override { return ComponentType::Script; }
    
    void update(float deltaTime) override {
        if (callbacks.onUpdate) {
            callbacks.onUpdate(owner);
        }
    }
    
    void setUpdateCallback(std::function<void(Entity*)> callback) {
        callbacks.onUpdate = callback;
    }
};

template<typename T>
class ComponentPool {
    std::vector<T*> pool;
    std::queue<T*> freeList;
    size_t maxSize;
    
public:
    ComponentPool(size_t max) : maxSize(max) {
        pool.reserve(maxSize);
    }
    
    T* acquire() {
        if (!freeList.empty()) {
            T* item = freeList.front();
            freeList.pop();
            return item;
        }
        if (pool.size() < maxSize) {
            T* item = new T();
            pool.push_back(item);
            return item;
        }
        return nullptr;
    }
    
    void release(T* item) {
        freeList.push(item);
    }
    
    ~ComponentPool() {
        for (T* item : pool) {
            delete item;
        }
    }
};

} // namespace Game
