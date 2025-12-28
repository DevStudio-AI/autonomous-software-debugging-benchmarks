// PacketHandler.h - Packet Processing System
#ifndef _PACKET_HANDLER_H_
#define _PACKET_HANDLER_H_

#include "NetworkEngine.h"


namespace Network {

struct PacketMetadata {
    PacketHeader header;  // From NetworkEngine.h - may fail due to circular dependency
    std::chrono::steady_clock::time_point timestamp;
    uint8_t retryCount;
    bool acknowledged;
};

class Packet {
public:
    Packet(PacketType type);  // PacketType from NetworkEngine.h
    Packet(const PacketHeader& header, std::vector<uint8_t> payload);
    
    PacketHeader& getHeader();
    const PacketHeader& getHeader() const;
    
    std::vector<uint8_t>& getPayload();
    const std::vector<uint8_t>& getPayload() const;
    
    // Serialization
    std::vector<uint8_t> toBytes() const;
    static std::optional<Packet> fromBytes(const std::vector<uint8_t>& data);
    
    // Validation
    bool isValid() const;
    uint32_t getChecksum() const;
    
private:
    PacketHeader header;
    std::vector<uint8_t> payload;
    mutable std::optional<uint32_t> cachedChecksum;
};

class PacketQueue {
public:
    PacketQueue(size_t maxSize = 1000);
    
    void push(Packet packet);
    std::optional<Packet> pop();
    std::optional<Packet> peek() const;
    
    bool empty() const;
    size_t size() const;
    void clear();
    
    // Priority queue operations
    void pushPriority(Packet packet, int priority);
    
private:
    std::queue<Packet> normalQueue;
    std::priority_queue<std::pair<int, Packet>> priorityQueue;
    size_t maxSize;
    std::mutex queueMutex;
};

class PacketHandler {
public:
    virtual ~PacketHandler() = default;
    
    virtual void handlePacket(ConnectionId sender, const Packet& packet) = 0;
    virtual PacketType getHandledType() const = 0;
    
    // Rate limiting
    void setRateLimit(std::chrono::milliseconds interval);
    bool checkRateLimit(ConnectionId sender);
    
protected:
    std::map<ConnectionId, std::chrono::steady_clock::time_point> lastPacketTime;
    std::chrono::milliseconds rateLimit{100};
};

class ConnectHandler : public PacketHandler {
public:
    void handlePacket(ConnectionId sender, const Packet& packet) override;
    PacketType getHandledType() const override { return PacketType::CONNECT; }
    
    // Events
    using ConnectCallback = std::function<void(ConnectionId, const PlayerData&)>;
    void onConnect(ConnectCallback callback);
    
private:
    std::vector<ConnectCallback> callbacks;
};

class GameStateHandler : public PacketHandler {
public:
    void handlePacket(ConnectionId sender, const Packet& packet) override;
    PacketType getHandledType() const override { return PacketType::GAME_STATE; }
    
    void setStateManager(GameStateManager* manager);
    
private:
    GameStateManager* stateManager = nullptr;
};

// Factory for creating handlers
class PacketHandlerFactory {
public:
    static std::unique_ptr<PacketHandler> createHandler(PacketType type);
    
    template<typename T>
    static void registerHandler() {
        creators[T::HandledType] = []() { return std::make_unique<T>(); };
    }
    
private:
    static std::map<PacketType, std::function<std::unique_ptr<PacketHandler>()>> creators;
};

}  // namespace Network

#endif  // _PACKET_HANDLER_H_
