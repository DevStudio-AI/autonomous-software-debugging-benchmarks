cmake_minimum_required(VERSION 3.16)
project(HeaderDemo VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Include directories
include_directories(${CMAKE_SOURCE_DIR}/include)

# Source files
# NOTE: Having multiple .cpp files that include the broken headers
# will demonstrate ODR (One Definition Rule) violations
set(SOURCES
    src/main.cpp
    src/helper.cpp
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Build will fail with many errors:
# 1. Missing include guards -> redefinition errors
# 2. Circular includes -> incomplete type errors
# 3. Missing standard library includes -> unknown type errors
# 4. Static member in header -> multiple definition errors
# 5. Non-inline function in header -> multiple definition errors

# Useful flags for detailed error messages
target_compile_options(${PROJECT_NAME} PRIVATE
    -Wall
    -Wextra
    -Wpedantic
    -ftemplate-backtrace-limit=0  # Show full template errors
)
