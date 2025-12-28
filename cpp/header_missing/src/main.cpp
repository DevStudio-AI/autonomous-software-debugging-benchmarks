// main.cpp - Demonstrates header include issues
// This file attempts to use the broken headers

// The compiler will produce many errors before reaching this code
#include "World.h"      // Has circular dependency with Entity.h
#include "GameTypes.h"  // Has circular dependency with Components.h
#include "Entity.h"     // Missing #endif for include guard
#include "Components.h" // Has circular dependency with GameTypes.h

// Even with correct includes here, the headers are broken
// These would be needed if headers were fixed:
// #include <iostream>
// #include <string>
// #include <vector>
// #include <memory>
// #include <functional>

using namespace Game;

void demonstrateHeaderIssues() {
    // 1. Try to create a World (circular dependency issues)
    World world("MyGame");
    
    // 2. Try to create EntityData (uses incomplete type Transform)
    EntityData data;
    data.name = "Player";
    data.tags = {1, 2, 3};
    // data.transform = ???  // Transform is incomplete type in GameTypes.h
    
    // 3. Try to use Container template (missing vector include)
    Container<int> intContainer;
    intContainer.add(42);
    
    // 4. Try to use ComponentList (depends on Component from broken circular include)
    ComponentList components;
    
    // 5. Try to use Callback struct (missing functional include)
    Callback callback;
    callback.onUpdate = [](Entity* e) {
        std::cout << "Update: " << e->getName() << std::endl;
    };
    
    // 6. Try to create entities and add components
    auto* player = world.createEntity("Player");
    player->addComponent<Transform>();
    player->addComponent<Physics>();
    
    // 7. Try to use getTypeName inline function (missing string include)
    std::string typeName = getTypeName(ComponentType::Transform);
    std::cout << "Type: " << typeName << std::endl;
    
    // 8. Try to use EntityMap (missing map include)
    EntityMap entityMap;
    entityMap["player"] = player;
    
    // 9. Try to use ComponentPool template (missing queue include)
    ComponentPool<Transform> transformPool(100);
    Transform* t = transformPool.acquire();
    t->x = 10.0f;
    
    // 10. Try to use Entity::create (missing memory include for shared_ptr)
    auto sharedEntity = Entity::create("SharedEntity");
    
    // 11. Try to find entity (missing algorithm include)
    auto* found = world.findEntity("Player");
    if (found) {
        std::cout << found->toString() << std::endl;  // toString uses stringstream
    }
    
    // 12. Try to serialize world (missing iostream)
    world.serialize(std::cout);
    
    // 13. Static member definition in header causes multiple definition
    // If this file and another .cpp both include Entity.h,
    // Entity::nextId will be defined twice
    
    // 14. Function in header without inline causes multiple definition
    // initializeDefaultWorld(world);  // Would cause linker error
}

// Another function to show multiple translation unit issues
void anotherFunction() {
    // If Entity.h and World.h are included in another .cpp file,
    // you'd get:
    // - Multiple definition of Entity::nextId
    // - Multiple definition of initializeDefaultWorld
    // - Redefinition errors from missing include guards
    
    World w("Another");
    auto* e = w.createEntity("Test");
    std::cout << "Created: " << e->getName() << std::endl;
}

int main() {
    std::cout << "=== C++ Header/Include Bug Demonstration ===" << std::endl;
    std::cout << std::endl;
    
    // This code won't compile due to header issues
    // The errors demonstrate:
    // 1. Circular dependencies between headers
    // 2. Missing include guards causing redefinitions
    // 3. Missing standard library includes
    // 4. Incomplete type errors from forward declarations
    // 5. Multiple definition errors from non-inline functions in headers
    // 6. Template instantiation errors from missing includes
    
    try {
        demonstrateHeaderIssues();
        anotherFunction();
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    std::cout << "Done!" << std::endl;
    return 0;
}

// Additional demonstration of ODR (One Definition Rule) violations
namespace {
    // This anonymous namespace helps, but the headers still have issues
    void localHelper() {
        Entity e("Local");
        e.addComponent<Transform>();
    }
}
