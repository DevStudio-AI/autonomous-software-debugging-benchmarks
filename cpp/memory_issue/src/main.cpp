#include "EntitySystem.h"
#include <iostream>
#include <cstring>

using namespace ECS;

// =============================================================================
// Demonstrates various memory management bugs
// Run with Valgrind or AddressSanitizer to detect issues
// =============================================================================

void demonstrateMemoryLeak() {
    std::cout << "\n=== Memory Leak Demo ===" << std::endl;
    
    Entity* entity = new Entity("LeakyEntity");
    entity->addComponent(new Sprite(256, 256));  // ~256KB leaked
    delete entity;  // Entity deleted, but Sprite::textureData not freed
}

void demonstrateDanglingPointer() {
    std::cout << "\n=== Dangling Pointer Demo ===" << std::endl;
    
    Entity* entity = new Entity("Test");
    entity->addComponent(new Transform());
    
    // Get pointer to component
    Component* transform = entity->getComponent("Transform");
    
    // Remove and delete the component
    entity->removeComponent("Transform");
    
    std::cout << "Component name: " << transform->name << std::endl;  // Undefined behavior!
    
    delete entity;
}

void demonstrateDoubleFree() {
    std::cout << "\n=== Double Free Demo ===" << std::endl;
    
    Entity* entity = new Entity("Test");
    
    Entity* clone = entity->shallowClone();
    
    entity->addComponent(new Transform());
    // Both entity and clone now have pointer to same Transform
    
    delete entity;  // Deletes Transform
    delete clone;   // Tries to delete same Transform again - double free!
}

void demonstrateUseAfterFree() {
    std::cout << "\n=== Use After Free Demo ===" << std::endl;
    
    int* ptr = new int(42);
    delete ptr;
    
    *ptr = 100;  // Undefined behavior
    std::cout << "Value: " << *ptr << std::endl;  // Might print anything
}

void demonstrateArrayOutOfBounds() {
    std::cout << "\n=== Array Out of Bounds Demo ===" << std::endl;
    
    DynamicArray arr(5);
    arr.push(1);
    arr.push(2);
    arr.push(3);
    
    std::cout << "arr[10]: " << arr[10] << std::endl;  // Out of bounds read
    arr[10] = 999;  // Out of bounds write - corrupts memory
}

void demonstrateResizeMemoryLeak() {
    std::cout << "\n=== Resize Memory Leak Demo ===" << std::endl;
    
    DynamicArray arr(2);  // Capacity 2
    arr.push(1);
    arr.push(2);
    arr.push(3);  // Triggers resize - old array leaked
    arr.push(4);
    arr.push(5);  // Triggers another resize - another leak
}

void demonstrateShallowCopyString() {
    std::cout << "\n=== Shallow Copy String Demo ===" << std::endl;
    
    MyString str1("Hello");
    MyString str2 = str1;
    
    std::cout << "str1: " << str1.c_str() << std::endl;
    std::cout << "str2: " << str2.c_str() << std::endl;
    
    // When str1 and str2 go out of scope, both try to delete same buffer
    // Double free!
}

void demonstrateParentChildLeak() {
    std::cout << "\n=== Parent/Child Memory Leak Demo ===" << std::endl;
    
    Entity* parent = new Entity("Parent");
    Entity* child = new Entity("Child");
    
    parent->addChild(child);
    
    // Remove child from parent
    parent->removeChild(child);
    
    delete parent;
    // child is leaked
}

void demonstrateSingletonLeak() {
    std::cout << "\n=== Singleton Leak Demo ===" << std::endl;
    
    EntityManager* mgr = EntityManager::getInstance();
    mgr->createEntity("Entity1");
    mgr->createEntity("Entity2");
    
    // All created entities are leaked when program exits
}

void demonstrateRefCountBug() {
    std::cout << "\n=== Reference Count Bug Demo ===" << std::endl;
    
    Texture* tex = new Texture(64, 64);
    
    tex->addRef();  // refCount = 2
    tex->release(); // refCount = 1
    tex->release(); // refCount = 0, deleted
    
    tex->release(); // refCount = -1, condition fails, memory corruption
}

void demonstrateVoidPointerLeak() {
    std::cout << "\n=== Void Pointer Leak Demo ===" << std::endl;
    
    Script script;
    
    int* data1 = new int(42);
    script.setUserData(data1);
    
    int* data2 = new int(100);
    script.setUserData(data2);
    
    // data1 was never deleted
}

void demonstrateCircularReference() {
    std::cout << "\n=== Circular Reference Demo ===" << std::endl;
    
    Entity* a = new Entity("A");
    Entity* b = new Entity("B");
    
    // Create circular reference
    a->addChild(b);
    b->addChild(a);  // Circular!
    
    // Entity* clone = a->deepClone();  // Stack overflow!
    
    // Manually break cycle:
    b->children.clear();
    delete a;  // Still problematic - deletes b which tries to delete a
}

int main() {
    std::cout << "=== C++ Memory Issues Demo ===" << std::endl;
    std::cout << "Run with: valgrind ./memory_demo" << std::endl;
    std::cout << "Or compile with: -fsanitize=address" << std::endl;
    
    // Uncomment to trigger specific bugs:
    
    demonstrateMemoryLeak();
    // demonstrateDanglingPointer();     // Undefined behavior
    // demonstrateDoubleFree();          // Crash
    // demonstrateUseAfterFree();        // Undefined behavior
    demonstrateArrayOutOfBounds();       // May crash
    demonstrateResizeMemoryLeak();
    // demonstrateShallowCopyString();   // Double free
    demonstrateParentChildLeak();
    demonstrateSingletonLeak();
    // demonstrateRefCountBug();         // Memory corruption
    demonstrateVoidPointerLeak();
    // demonstrateCircularReference();   // Complex issues
    
    std::cout << "\n=== Demo Complete ===" << std::endl;
    
    return 0;
}
