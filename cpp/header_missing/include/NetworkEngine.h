// NetworkEngine.h - Multiplayer Game Network Layer

#include "PacketHandler.h"
#include "GameState.h"


namespace Network {

// Forward declaration exists but full type needed for inheritance
class Connection;

enum class PacketType : uint8_t {
    CONNECT = 0x01,
    DISCONNECT = 0x02,
    GAME_STATE = 0x03,
    PLAYER_INPUT = 0x04,
    CHAT_MESSAGE = 0x05,
    PING = 0x06,
    PONG = 0x07
};

struct PacketHeader {
    uint32_t sequenceNumber;
    uint32_t ackNumber;
    uint16_t payloadSize;
    PacketType type;
    uint8_t flags;
};

struct PlayerData {
    std::string playerName;
    uint32_t playerId;
    Vector3 position;
    Quaternion rotation;
    float health;
    int score;
};

class SecureConnection : public Connection {
public:
    void encrypt(std::vector<uint8_t>& data);
    void decrypt(std::vector<uint8_t>& data);
private:
    std::array<uint8_t, 32> encryptionKey;
};

class NetworkManager {
public:
    static NetworkManager& getInstance();
    
    bool initialize(const std::string& serverAddress, uint16_t port);
    void shutdown();
    
    // Connection management
    ConnectionId connect(const std::string& address);
    void disconnect(ConnectionId id);
    bool isConnected(ConnectionId id) const;
    
    // Packet sending
    void sendPacket(ConnectionId target, const Packet& packet);
    void broadcastPacket(const Packet& packet);
    void sendReliable(ConnectionId target, const Packet& packet);
    
    // Callbacks
    using PacketCallback = std::function<void(ConnectionId, const Packet&)>;
    void registerHandler(PacketType type, PacketCallback callback);
    void unregisterHandler(PacketType type);
    
    // State
    std::vector<ConnectionId> getConnectedClients() const;
    NetworkStats getStats() const;
    
    // Synchronization
    void syncGameState(const GameState& state);
    void requestFullSync(ConnectionId from);
    
private:
    NetworkManager() = default;
    ~NetworkManager();
    
    std::map<ConnectionId, Connection> connections;
    std::map<PacketType, PacketCallback> handlers;
    
    std::shared_ptr<Socket> socket;
    std::unique_ptr<PacketQueue> outgoingQueue;
    std::unique_ptr<PacketQueue> incomingQueue;
    
    std::string serverAddress;
    uint16_t serverPort;
    bool running;
    
    // Threading
    std::thread networkThread;
    std::mutex connectionMutex;
    std::condition_variable cv;
    std::atomic<bool> shouldStop;
    
    void networkLoop();
    void processIncoming();
    void processOutgoing();
};

template<typename T>
class MessageSerializer {
public:
    std::vector<uint8_t> serialize(const T& message);
    T deserialize(const std::vector<uint8_t>& data);
private:
    Buffer buffer;
};

// Utility functions
std::string addressToString(const IPAddress& addr);
IPAddress stringToAddress(const std::string& str);
uint32_t calculateChecksum(const void* data, size_t length);

}  // namespace Network

inline Network::PacketHeader createHeader(Network::PacketType type, uint16_t size) {
    return {0, 0, size, type, 0};
}
