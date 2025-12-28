#ifndef GAME_ENGINE_H
#define GAME_ENGINE_H

#include <string>
#include <vector>
#include <memory>

namespace GameEngine {

// Forward declarations
class Entity;
class Component;
class Renderer;

// =============================================================================
// =============================================================================

template<typename T>
class ResourceManager {
public:
    void load(const std::string& path);
    T* get(const std::string& id);
    void unload(const std::string& id);
    
private:
    std::vector<T*> resources;
};

// =============================================================================
// =============================================================================

class GameConfig {
public:
    static int screenWidth;
    static int screenHeight;
    static std::string gameName;
    static bool debugMode;
    
    static void loadConfig(const std::string& path);
    static void saveConfig(const std::string& path);
};

// =============================================================================
// =============================================================================

int calculateDamage(int baseDamage, int armor) {
    return baseDamage - (armor / 2);
}

// =============================================================================
// =============================================================================

class Component {
public:
    virtual ~Component();
    virtual void update(float deltaTime) = 0;
    virtual void render() = 0;
    
    std::string getName() const { return name; }
    
protected:
    std::string name;
    Entity* owner;
};

// =============================================================================
// =============================================================================

class Renderer {
public:
    virtual void initialize() = 0;
    virtual void shutdown() = 0;
    virtual void beginFrame() = 0;
    virtual void endFrame() = 0;
    virtual void drawSprite(int x, int y, int w, int h) = 0;
};

// =============================================================================
// =============================================================================

extern Renderer* globalRenderer;
extern int maxEntities;
extern const char* engineVersion;

// =============================================================================
// Entity class with linker issues
// =============================================================================

class Entity {
public:
    Entity();
    Entity(const std::string& name);
    ~Entity();
    
    void addComponent(Component* component);
    void removeComponent(const std::string& name);
    Component* getComponent(const std::string& name);
    
    void update(float deltaTime);
    void render();
    
    static int entityCount;
    
    static const int MAX_COMPONENTS = 32;
    
private:
    std::string entityName;
    std::vector<Component*> components;
    bool isActive;
    
    static std::vector<Entity*> allEntities;
};

// =============================================================================
// =============================================================================

class AudioManager {
public:
    static AudioManager& getInstance();
    
    void playSound(const std::string& name);
    void playMusic(const std::string& name);
    void stopMusic();
    void setVolume(float volume);
    
private:
    AudioManager();
    AudioManager(const AudioManager&) = delete;
    
    float masterVolume;
    bool isMuted;
};

// =============================================================================
// =============================================================================

namespace MathUtils {
    float lerp(float a, float b, float t);
    float clamp(float value, float min, float max);
    float randomRange(float min, float max);
}

// =============================================================================
// =============================================================================

class Vector2 {
public:
    float x, y;
    
    Vector2() : x(0), y(0) {}
    Vector2(float x, float y) : x(x), y(y) {}
    
    friend Vector2 operator+(const Vector2& a, const Vector2& b);
    friend Vector2 operator-(const Vector2& a, const Vector2& b);
    friend Vector2 operator*(const Vector2& v, float scalar);
    friend float dot(const Vector2& a, const Vector2& b);
};

}  // namespace GameEngine

#endif // GAME_ENGINE_H
