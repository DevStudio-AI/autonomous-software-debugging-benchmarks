// Connection.h - Network Connection Management
#pragma once  // Modern include guard - but inconsistent with other files using #ifndef


// NetworkEngine.h forward declares Connection but tries to inherit from it

namespace Network {

using ConnectionId = uint32_t;

constexpr ConnectionId INVALID_CONNECTION = 0;
constexpr ConnectionId SERVER_CONNECTION = 1;

enum class ConnectionState : uint8_t {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    DISCONNECTING,
    ERROR
};

struct NetworkStats {
    uint64_t bytesSent = 0;
    uint64_t bytesReceived = 0;
    uint32_t packetsSent = 0;
    uint32_t packetsReceived = 0;
    uint32_t packetsLost = 0;
    float packetLoss = 0.0f;
    float roundTripTime = 0.0f;
    float jitter = 0.0f;
    
    std::chrono::steady_clock::time_point lastPacketTime;
    std::chrono::milliseconds averageLatency{0};
};

struct IPAddress {
    uint8_t octets[4];
    
    IPAddress() : octets{0, 0, 0, 0} {}
    IPAddress(uint8_t a, uint8_t b, uint8_t c, uint8_t d) : octets{a, b, c, d} {}
    
    std::string toString() const {
        return std::to_string(octets[0]) + "." + 
               std::to_string(octets[1]) + "." +
               std::to_string(octets[2]) + "." +
               std::to_string(octets[3]);
    }
    
    static IPAddress fromString(const std::string& str);
    
    bool operator==(const IPAddress& other) const {
        return std::memcmp(octets, other.octets, 4) == 0;
    }
};

struct Endpoint {
    IPAddress address;
    uint16_t port;
    
    std::string toString() const {
        return address.toString() + ":" + std::to_string(port);
    }
};

// Socket abstraction
class Socket {
public:
    virtual ~Socket() = default;
    
    virtual bool bind(const Endpoint& endpoint) = 0;
    virtual bool connect(const Endpoint& endpoint) = 0;
    virtual void close() = 0;
    
    virtual int send(const void* data, size_t length) = 0;
    virtual int receive(void* buffer, size_t maxLength) = 0;
    
    virtual bool isValid() const = 0;
    virtual Endpoint getLocalEndpoint() const = 0;
    virtual Endpoint getRemoteEndpoint() const = 0;
    
    // Non-blocking operations
    virtual void setBlocking(bool blocking) = 0;
    virtual bool hasData() const = 0;
};

// but NetworkEngine.h only forward declares this
class Connection {
public:
    Connection(ConnectionId id, std::unique_ptr<Socket> socket);
    virtual ~Connection();
    
    ConnectionId getId() const { return id; }
    ConnectionState getState() const { return state; }
    const NetworkStats& getStats() const { return stats; }
    const Endpoint& getRemoteEndpoint() const { return remoteEndpoint; }
    
    // Connection lifecycle
    virtual bool connect(const Endpoint& endpoint);
    virtual void disconnect();
    virtual void update(float deltaTime);
    
    // Data transfer
    virtual void send(const std::vector<uint8_t>& data);
    virtual std::optional<std::vector<uint8_t>> receive();
    
    // Keep-alive
    void sendPing();
    void onPong(uint32_t timestamp);
    bool isTimedOut() const;
    
    // Events
    using StateChangedCallback = std::function<void(ConnectionState, ConnectionState)>;
    void onStateChanged(StateChangedCallback callback) { stateCallback = callback; }
    
protected:
    void setState(ConnectionState newState);
    void updateStats(size_t sent, size_t received);
    
    ConnectionId id;
    ConnectionState state = ConnectionState::DISCONNECTED;
    NetworkStats stats;
    Endpoint remoteEndpoint;
    
    std::unique_ptr<Socket> socket;
    StateChangedCallback stateCallback;
    
    // Reliability
    std::queue<std::vector<uint8_t>> outgoingQueue;
    std::queue<std::vector<uint8_t>> incomingQueue;
    uint32_t localSequence = 0;
    uint32_t remoteSequence = 0;
    
    // Timing
    std::chrono::steady_clock::time_point lastSendTime;
    std::chrono::steady_clock::time_point lastReceiveTime;
    std::chrono::milliseconds timeout{5000};
};

// Reliable UDP connection with acknowledgments
class ReliableConnection : public Connection {
public:
    using Connection::Connection;
    
    void send(const std::vector<uint8_t>& data) override;
    std::optional<std::vector<uint8_t>> receive() override;
    void update(float deltaTime) override;
    
    void setMaxRetries(uint32_t retries) { maxRetries = retries; }
    void setRetryInterval(std::chrono::milliseconds interval) { retryInterval = interval; }
    
private:
    struct PendingPacket {
        std::vector<uint8_t> data;
        uint32_t sequenceNumber;
        uint32_t retryCount = 0;
        std::chrono::steady_clock::time_point sendTime;
    };
    
    std::map<uint32_t, PendingPacket> pendingAcks;
    std::set<uint32_t> receivedSequences;
    
    uint32_t maxRetries = 5;
    std::chrono::milliseconds retryInterval{100};
    
    void processAcks();
    void resendTimedOut();
};

}  // namespace Network
