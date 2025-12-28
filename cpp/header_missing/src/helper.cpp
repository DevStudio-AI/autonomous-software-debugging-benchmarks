// helper.cpp - Second translation unit to demonstrate multiple definition errors
// When both main.cpp and helper.cpp include the broken headers,
// we get multiple definition errors

#include "Entity.h"   // Contains: uint32_t Entity::nextId = 0; (non-inline static)
#include "World.h"    // Contains: void initializeDefaultWorld(World&); (non-inline function)

// "multiple definition of `Game::Entity::nextId'"
// because the static member is defined in the header

// "multiple definition of `Game::initializeDefaultWorld(Game::World&)'"
// because the function is defined in the header without inline

using namespace Game;

// This helper function also uses the broken headers
void setupTestWorld(World& world) {
    // Create some test entities
    auto* enemy1 = world.createEntity("Enemy1");
    enemy1->addComponent<Transform>();
    enemy1->addComponent<Physics>();
    enemy1->addComponent<Render>();
    
    auto* enemy2 = world.createEntity("Enemy2");
    enemy2->addComponent<Transform>();
    enemy2->addComponent<Physics>();
    
    // Set up positions
    if (auto* t1 = enemy1->getComponent<Transform>()) {
        t1->x = 100.0f;
        t1->y = 0.0f;
        t1->z = 50.0f;
    }
    
    if (auto* t2 = enemy2->getComponent<Transform>()) {
        t2->x = -100.0f;
        t2->y = 0.0f;
        t2->z = 50.0f;
    }
    
    // Set up physics
    if (auto* p1 = enemy1->getComponent<Physics>()) {
        p1->mass = 10.0f;
        p1->isKinematic = false;
    }
}

// Another function that uses EntityData (incomplete type issue)
EntityData createPlayerData() {
    EntityData data;
    data.name = "Player";
    data.tags = {1, 2, 3};  // Player, Controllable, SavePoint
    // data.transform cannot be set because Transform is incomplete type in GameTypes.h
    return data;
}

// Function demonstrating template issues
void testContainers() {
    // Container uses std::vector internally but doesn't include <vector>
    Container<float> floatContainer;
    floatContainer.add(1.5f);
    floatContainer.add(2.5f);
    floatContainer.add(3.5f);
    
    // ComponentPool uses std::vector and std::queue but doesn't include them
    ComponentPool<Render> renderPool(50);
    Render* r1 = renderPool.acquire();
    Render* r2 = renderPool.acquire();
    
    r1->meshPath = "models/cube.obj";
    r2->meshPath = "models/sphere.obj";
    
    renderPool.release(r1);
}

// Function demonstrating callback issues (missing <functional>)
void setupCallbacks(Entity* entity) {
    if (auto* script = entity->getComponent<Script>()) {
        // Callback struct uses std::function but doesn't include <functional>
        script->setUpdateCallback([](Entity* e) {
            // Update logic
            if (auto* physics = e->getComponent<Physics>()) {
                physics->applyForce(0, -9.8f, 0);  // Gravity
            }
        });
        
        script->callbacks.onCollision = [](Entity* a, Entity* b) {
            // Collision response
            std::cout << a->getName() << " collided with " << b->getName() << std::endl;
        };
    }
}
