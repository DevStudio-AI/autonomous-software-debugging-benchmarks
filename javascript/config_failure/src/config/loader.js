/**
 * Configuration Loader
 */
const fs = require('fs');
const path = require('path');
const defaults = require('./defaults');

function loadConfig() {
    const env = process.env.NODE_ENV || 'development';
    
    // In production (when installed globally or in different dir), this breaks
    // Should use __dirname or resolve from package root
    const configDir = './config';
    const defaultConfigPath = path.join(configDir, 'default.json');
    const envConfigPath = path.join(configDir, `${env}.json`);

    let config = { ...defaults };

    // Load default config
    if (fs.existsSync(defaultConfigPath)) {
        const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'));
        config = mergeConfig(config, defaultConfig);
    }

    // Load environment-specific config
    if (fs.existsSync(envConfigPath)) {
        const envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf-8'));
        config = mergeConfig(config, envConfig);
    } else {
        // where it should fall back to defaults
        throw new Error(`Cannot find config file at ${envConfigPath}`);
    }

    // Override with environment variables
    config = applyEnvOverrides(config);

    return config;
}

function mergeConfig(base, override) {
    const result = { ...base };
    
    for (const [key, value] of Object.entries(override)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = mergeConfig(result[key] || {}, value);
        } else {
            result[key] = value;
        }
    }
    
    return result;
}

function applyEnvOverrides(config) {
    // Should check if env var exists BEFORE applying default
    
    // Database overrides
    config.database = config.database || {};
    config.database.host = config.database.host || process.env.DB_HOST;
    config.database.port = config.database.port || process.env.DB_PORT;
    config.database.name = config.database.name || process.env.DB_NAME;
    config.database.user = config.database.user || process.env.DB_USER;
    config.database.password = config.database.password || process.env.DB_PASSWORD;
    
    // process.env.DB_SSL = 'false' will still result in truthy value
    config.database.ssl = config.database.ssl || process.env.DB_SSL;
    
    if (process.env.DATABASE_URL) {
        // This is never reached because config.database already has values
        const url = new URL(process.env.DATABASE_URL);
        config.database.host = url.hostname;
        config.database.port = url.port;
        config.database.name = url.pathname.slice(1);
        config.database.user = url.username;
        config.database.password = url.password;
    }

    // Migration settings
    config.migrations = config.migrations || {};
    config.migrations.directory = process.env.MIGRATIONS_DIR || config.migrations.directory;
    config.migrations.tableName = process.env.MIGRATIONS_TABLE || config.migrations.tableName;

    return config;
}

module.exports = loadConfig();
