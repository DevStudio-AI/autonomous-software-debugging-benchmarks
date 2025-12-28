#include "GameEngine.h"
#include <iostream>

using namespace GameEngine;

// =============================================================================
// This file attempts to use all the buggy declarations, triggering linker errors
// =============================================================================

int main() {
    std::cout << "Starting Game Engine..." << std::endl;
    
    std::cout << "Engine version: " << engineVersion << std::endl;
    std::cout << "Max entities: " << maxEntities << std::endl;
    
    GameConfig::screenWidth = 1920;
    GameConfig::screenHeight = 1080;
    GameConfig::debugMode = true;
    
    float value = MathUtils::lerp(0.0f, 100.0f, 0.5f);
    float clamped = MathUtils::clamp(150.0f, 0.0f, 100.0f);
    
    Vector2 a(1.0f, 2.0f);
    Vector2 b(3.0f, 4.0f);
    Vector2 c = a + b;  // undefined reference to operator+
    Vector2 d = a - b;  // undefined reference to operator-
    Vector2 e = a * 2.0f;  // undefined reference to operator*
    float dotProduct = dot(a, b);  // undefined reference to dot
    
    AudioManager& audio = AudioManager::getInstance();
    audio.playMusic("background.mp3");
    audio.setVolume(0.8f);
    
    ResourceManager<int> intResources;
    intResources.load("numbers.dat");  // undefined reference
    
    // Entity works partially
    Entity player("Player");
    
    std::cout << "Entity count: " << Entity::entityCount << std::endl;
    
    if (globalRenderer) {
        globalRenderer->initialize();
    }
    
    int damage = calculateDamage(100, 20);
    
    std::cout << "Game Engine initialized!" << std::endl;
    
    return 0;
}
