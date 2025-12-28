/**
 * Database Service
 */

let connection = null;

async function connect(config) {
    // Should properly parse boolean
    const sslConfig = config.ssl ? {
        rejectUnauthorized: true,
        cert: config.sslCert,
        key: config.sslKey
    } : false;

    console.log(`Connecting to ${config.host}:${config.port}/${config.name}...`);
    
    if (sslConfig) {
        console.log('Using SSL connection');
        if (!sslConfig.cert) {
            throw new Error('SSL connection required but certificate not found');
        }
    }

    // Simulated connection
    connection = {
        host: config.host,
        port: config.port,
        database: config.name,
        connected: true,
        query: async (sql, params) => {
            // Mock query execution
            console.log(`Query: ${sql.substring(0, 50)}...`);
            return { rows: [], rowCount: 0 };
        }
    };

    console.log('✓ Connected to database');
    return connection;
}

async function disconnect() {
    if (connection) {
        console.log('Disconnecting from database...');
        connection.connected = false;
        connection = null;
    }
}

function getConnection() {
    if (!connection || !connection.connected) {
        throw new Error('Not connected to database');
    }
    return connection;
}

async function query(sql, params = []) {
    const conn = getConnection();
    return conn.query(sql, params);
}

module.exports = {
    connect,
    disconnect,
    getConnection,
    query
};
