// Math.h - Game Math Library
#ifndef MATH_H
#define MATH_H


namespace Math {

constexpr float PI = 3.14159265358979323846f;
constexpr float DEG_TO_RAD = PI / 180.0f;
constexpr float RAD_TO_DEG = 180.0f / PI;
constexpr float EPSILON = 1e-6f;

struct Vector2 {
    float x = 0, y = 0;
    
    Vector2() = default;
    Vector2(float x, float y) : x(x), y(y) {}
    
    float length() const { return std::sqrt(x*x + y*y); }
    float lengthSquared() const { return x*x + y*y; }
    Vector2 normalized() const {
        float len = length();
        return len > EPSILON ? Vector2(x/len, y/len) : Vector2();
    }
    
    static float dot(const Vector2& a, const Vector2& b) { return a.x*b.x + a.y*b.y; }
    static float cross(const Vector2& a, const Vector2& b) { return a.x*b.y - a.y*b.x; }
    
    Vector2 operator+(const Vector2& other) const { return {x + other.x, y + other.y}; }
    Vector2 operator-(const Vector2& other) const { return {x - other.x, y - other.y}; }
    Vector2 operator*(float scalar) const { return {x * scalar, y * scalar}; }
    Vector2 operator/(float scalar) const { return {x / scalar, y / scalar}; }
    bool operator==(const Vector2& other) const { 
        return std::abs(x - other.x) < EPSILON && std::abs(y - other.y) < EPSILON;
    }
};

struct Vector3 {
    float x = 0, y = 0, z = 0;
    
    Vector3() = default;
    Vector3(float x, float y, float z) : x(x), y(y), z(z) {}
    
    float length() const { return std::sqrt(x*x + y*y + z*z); }
    float lengthSquared() const { return x*x + y*y + z*z; }
    Vector3 normalized() const {
        float len = length();
        return len > EPSILON ? Vector3(x/len, y/len, z/len) : Vector3();
    }
    
    static float dot(const Vector3& a, const Vector3& b) { 
        return a.x*b.x + a.y*b.y + a.z*b.z; 
    }
    static Vector3 cross(const Vector3& a, const Vector3& b) {
        return {
            a.y*b.z - a.z*b.y,
            a.z*b.x - a.x*b.z,
            a.x*b.y - a.y*b.x
        };
    }
    static Vector3 lerp(const Vector3& a, const Vector3& b, float t) {
        t = std::clamp(t, 0.0f, 1.0f);
        return a + (b - a) * t;
    }
    
    Vector3 operator+(const Vector3& other) const { return {x + other.x, y + other.y, z + other.z}; }
    Vector3 operator-(const Vector3& other) const { return {x - other.x, y - other.y, z - other.z}; }
    Vector3 operator*(float scalar) const { return {x * scalar, y * scalar, z * scalar}; }
    Vector3 operator/(float scalar) const { return {x / scalar, y / scalar, z / scalar}; }
    Vector3& operator+=(const Vector3& other) { x += other.x; y += other.y; z += other.z; return *this; }
    
    static const Vector3 Zero;
    static const Vector3 One;
    static const Vector3 Up;
    static const Vector3 Forward;
    static const Vector3 Right;
};


struct Vector4 {
    float x = 0, y = 0, z = 0, w = 0;
    
    Vector4() = default;
    Vector4(float x, float y, float z, float w) : x(x), y(y), z(z), w(w) {}
    Vector4(const Vector3& v, float w) : x(v.x), y(v.y), z(v.z), w(w) {}
};

struct Quaternion {
    float x = 0, y = 0, z = 0, w = 1;
    
    Quaternion() = default;
    Quaternion(float x, float y, float z, float w) : x(x), y(y), z(z), w(w) {}
    
    static Quaternion identity() { return {0, 0, 0, 1}; }
    
    static Quaternion fromEuler(float pitch, float yaw, float roll) {
        float cy = std::cos(yaw * 0.5f);
        float sy = std::sin(yaw * 0.5f);
        float cp = std::cos(pitch * 0.5f);
        float sp = std::sin(pitch * 0.5f);
        float cr = std::cos(roll * 0.5f);
        float sr = std::sin(roll * 0.5f);
        
        return {
            sr * cp * cy - cr * sp * sy,
            cr * sp * cy + sr * cp * sy,
            cr * cp * sy - sr * sp * cy,
            cr * cp * cy + sr * sp * sy
        };
    }
    
    static Quaternion fromAxisAngle(const Vector3& axis, float angle) {
        float halfAngle = angle * 0.5f;
        float s = std::sin(halfAngle);
        Vector3 n = axis.normalized();
        return {n.x * s, n.y * s, n.z * s, std::cos(halfAngle)};
    }
    
    Vector3 toEuler() const {
        Vector3 euler;
        // Roll
        float sinr = 2.0f * (w * x + y * z);
        float cosr = 1.0f - 2.0f * (x * x + y * y);
        euler.x = std::atan2(sinr, cosr);
        
        // Pitch
        float sinp = 2.0f * (w * y - z * x);
        euler.y = std::abs(sinp) >= 1 ? std::copysign(PI / 2, sinp) : std::asin(sinp);
        
        // Yaw
        float siny = 2.0f * (w * z + x * y);
        float cosy = 1.0f - 2.0f * (y * y + z * z);
        euler.z = std::atan2(siny, cosy);
        
        return euler;
    }
    
    Quaternion operator*(const Quaternion& other) const {
        return {
            w*other.x + x*other.w + y*other.z - z*other.y,
            w*other.y - x*other.z + y*other.w + z*other.x,
            w*other.z + x*other.y - y*other.x + z*other.w,
            w*other.w - x*other.x - y*other.y - z*other.z
        };
    }
    
    Vector3 operator*(const Vector3& v) const;
    
    static Quaternion slerp(const Quaternion& a, const Quaternion& b, float t);
};

struct Matrix4x4 {
    float m[4][4] = {};
    
    Matrix4x4() { setIdentity(); }
    
    void setIdentity() {
        std::memset(m, 0, sizeof(m));
        m[0][0] = m[1][1] = m[2][2] = m[3][3] = 1.0f;
    }
    
    static Matrix4x4 translation(const Vector3& v) {
        Matrix4x4 result;
        result.m[0][3] = v.x;
        result.m[1][3] = v.y;
        result.m[2][3] = v.z;
        return result;
    }
    
    static Matrix4x4 scale(const Vector3& s) {
        Matrix4x4 result;
        result.m[0][0] = s.x;
        result.m[1][1] = s.y;
        result.m[2][2] = s.z;
        return result;
    }
    
    static Matrix4x4 rotation(const Quaternion& q);
    
    static Matrix4x4 perspective(float fov, float aspect, float near, float far) {
        Matrix4x4 result;
        float tanHalfFov = std::tan(fov * 0.5f);
        
        result.m[0][0] = 1.0f / (aspect * tanHalfFov);
        result.m[1][1] = 1.0f / tanHalfFov;
        result.m[2][2] = -(far + near) / (far - near);
        result.m[2][3] = -1.0f;
        result.m[3][2] = -(2.0f * far * near) / (far - near);
        result.m[3][3] = 0.0f;
        
        return result;
    }
    
    static Matrix4x4 lookAt(const Vector3& eye, const Vector3& target, const Vector3& up);
    
    Matrix4x4 operator*(const Matrix4x4& other) const {
        Matrix4x4 result;
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                result.m[i][j] = 0;
                for (int k = 0; k < 4; k++) {
                    result.m[i][j] += m[i][k] * other.m[k][j];
                }
            }
        }
        return result;
    }
    
    Vector4 operator*(const Vector4& v) const;
    
    Matrix4x4 inverse() const;
    Matrix4x4 transpose() const;
    float determinant() const;
};

// Utility functions
inline float lerp(float a, float b, float t) {
    return a + (b - a) * std::clamp(t, 0.0f, 1.0f);
}

inline float inverseLerp(float a, float b, float value) {
    return (value - a) / (b - a);
}

inline float smoothstep(float edge0, float edge1, float x) {
    float t = std::clamp((x - edge0) / (edge1 - edge0), 0.0f, 1.0f);
    return t * t * (3 - 2 * t);
}

inline float degToRad(float degrees) { return degrees * DEG_TO_RAD; }
inline float radToDeg(float radians) { return radians * RAD_TO_DEG; }

template<typename T>
T clamp(T value, T min, T max) {
    return std::max(min, std::min(max, value));
}

}  // namespace Math

using Vector2 = Math::Vector2;
using Vector3 = Math::Vector3;
using Vector4 = Math::Vector4;
using Quaternion = Math::Quaternion;
using Matrix4x4 = Math::Matrix4x4;

#endif  // MATH_H
