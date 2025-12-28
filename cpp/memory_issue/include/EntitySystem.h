#ifndef ENTITY_SYSTEM_H
#define ENTITY_SYSTEM_H

#include <string>
#include <vector>
#include <map>
#include <memory>

namespace ECS {

// =============================================================================
// Entity Component System with Memory Management Bugs
// =============================================================================

class Component {
public:
    virtual ~Component() = default;
    virtual void update(float dt) = 0;
    virtual Component* clone() const = 0;
    
    std::string name;
};

class Transform : public Component {
public:
    float x, y, z;
    float rotX, rotY, rotZ;
    float scaleX, scaleY, scaleZ;
    
    Transform() : x(0), y(0), z(0), rotX(0), rotY(0), rotZ(0),
                  scaleX(1), scaleY(1), scaleZ(1) {
        name = "Transform";
    }
    
    void update(float dt) override { }
    
    Component* clone() const override {
        return new Transform(*this);
    }
};

class Sprite : public Component {
public:
    unsigned char* textureData;
    int width, height;
    
    Sprite(int w, int h) : width(w), height(h) {
        name = "Sprite";
        textureData = new unsigned char[w * h * 4];  // RGBA
    }
    
    // ~Sprite() { delete[] textureData; }  // Missing!
    
    void update(float dt) override { }
    
    Component* clone() const override {
        return new Sprite(*this);  // Uses default copy constructor
    }
};

class Script : public Component {
public:
    void* userData;
    
    Script() : userData(nullptr) {
        name = "Script";
    }
    
    void setUserData(void* data) {
        userData = data;  // Previous data leaked
    }
    
    void update(float dt) override { }
    
    Component* clone() const override {
        Script* copy = new Script();
        copy->userData = userData;  // Both point to same memory
        return copy;
    }
};

// =============================================================================
// Entity class with memory issues
// =============================================================================

class Entity {
public:
    std::string name;
    
    std::vector<Component*> components;
    
    Entity* parent;
    
    std::vector<Entity*> children;
    
    Entity(const std::string& name) : name(name), parent(nullptr) { }
    
    ~Entity() {
        for (auto* child : children) {
            delete child;  // What if child is also in another container?
        }
        
        for (auto* comp : components) {
            delete comp;
        }
    }
    
    void addComponent(Component* comp) {
        components.push_back(comp);
    }
    
    Component* getComponent(const std::string& name) {
        for (auto* comp : components) {
            if (comp->name == name) {
                return comp;
            }
        }
        return nullptr;
    }
    
    void removeComponent(const std::string& name) {
        for (auto it = components.begin(); it != components.end(); ++it) {
            if ((*it)->name == name) {
                delete *it;  // Deleted, but caller might have pointer
                components.erase(it);
                return;
            }
        }
    }
    
    void addChild(Entity* child) {
        child->parent = this;
        children.push_back(child);
    }
    
    void removeChild(Entity* child) {
        for (auto it = children.begin(); it != children.end(); ++it) {
            if (*it == child) {
                (*it)->parent = nullptr;
                children.erase(it);
                return;
            }
        }
    }
    
    Entity* shallowClone() {
        Entity* clone = new Entity(name + "_clone");
        clone->components = components;  // Both entities share components!
        return clone;
    }
    
    Entity* deepClone() {
        Entity* clone = new Entity(name + "_clone");
        
        // Clone components
        for (auto* comp : components) {
            clone->components.push_back(comp->clone());
        }
        
        for (auto* child : children) {
            clone->addChild(child->deepClone());
        }
        
        return clone;
    }
};

// =============================================================================
// Entity Manager with memory management issues
// =============================================================================

class EntityManager {
public:
    std::map<int, Entity*> entities;
    int nextId = 0;
    
    static EntityManager* instance;
    
    static EntityManager* getInstance() {
        if (!instance) {
            instance = new EntityManager();
        }
        return instance;
    }
    
    int createEntity(const std::string& name) {
        int id = nextId++;
        entities[id] = new Entity(name);
        return id;
    }
    
    Entity* getEntity(int id) {
        auto it = entities.find(id);
        if (it != entities.end()) {
            return it->second;
        }
        return nullptr;
    }
    
    void destroyEntity(int id) {
        auto it = entities.find(id);
        if (it != entities.end()) {
            delete it->second;  // What about parent/child references?
            entities.erase(it);
        }
    }
    
    void clearWrong() {
        entities.clear();  // Memory leak - entities not deleted
    }
    
    // Attempts to clear but has double-delete risk
    void clearAlsoWrong() {
        for (auto& pair : entities) {
            delete pair.second;
        }
        entities.clear();
        // we get double delete
    }
    
};

EntityManager* EntityManager::instance = nullptr;

// =============================================================================
// Resource with reference counting bugs
// =============================================================================

class Texture {
public:
    unsigned char* data;
    int width, height;
    int refCount;
    
    Texture(int w, int h) : width(w), height(h), refCount(1) {
        data = new unsigned char[w * h * 4];
    }
    
    ~Texture() {
        delete[] data;
    }
    
    void addRef() {
        refCount++;
    }
    
    void release() {
        refCount--;
        if (refCount == 0) {
            delete this;
        }
        // and object is never deleted (memory leak) or deleted twice later
    }
};

// =============================================================================
// Array utilities with bounds issues
// =============================================================================

class DynamicArray {
public:
    int* data;
    int size;
    int capacity;
    
    DynamicArray(int initialCapacity = 10) : size(0), capacity(initialCapacity) {
        data = new int[capacity];
    }
    
    
    ~DynamicArray() {
        delete[] data;
    }
    
    void push(int value) {
        if (size >= capacity) {
            resize();
        }
        data[size++] = value;
    }
    
    int& operator[](int index) {
        return data[index];  // Out of bounds not checked
    }
    
    void resize() {
        capacity *= 2;
        int* newData = new int[capacity];
        
        // Copy old data
        for (int i = 0; i < size; i++) {
            newData[i] = data[i];
        }
        
        data = newData;  // Memory leak!
    }
    
    int pop() {
        return data[--size];  // Undefined behavior if size is 0
    }
};

// =============================================================================
// String class with memory issues
// =============================================================================

class MyString {
public:
    char* buffer;
    size_t length;
    
    MyString() : buffer(nullptr), length(0) { }
    
    MyString(const char* str) {
        length = strlen(str);
        buffer = new char[length + 1];
        strcpy(buffer, str);
    }
    
    MyString(const MyString& other) {
        buffer = other.buffer;  // Both share same buffer!
        length = other.length;
    }
    
    // Default assignment would also be shallow copy
    
    ~MyString() {
        delete[] buffer;
    }
    
    MyString operator+(const MyString& other) {
        MyString result;
        result.length = length + other.length;
        result.buffer = new char[result.length + 1];
        strcpy(result.buffer, buffer);
        strcat(result.buffer, other.buffer);
        // But return value optimization might save us... or not
        return result;
    }
    
    const char* c_str() const {
        return buffer;
    }
};

}  // namespace ECS

#endif // ENTITY_SYSTEM_H
