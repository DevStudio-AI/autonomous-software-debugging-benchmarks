cmake_minimum_required(VERSION 3.16)
project(GameEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(${CMAKE_SOURCE_DIR}/include)

# Source files
set(SOURCES
    src/main.cpp
    src/GameEngine.cpp
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES})

# BUG: This CMakeLists.txt is correct - the bugs are in the code
# The linker errors come from missing symbol definitions
