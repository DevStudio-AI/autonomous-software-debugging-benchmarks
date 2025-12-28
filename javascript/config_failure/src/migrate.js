#!/usr/bin/env node
/**
 * Database Migration CLI
 */

// Currently, config is loaded first, so env vars aren't available
const config = require('./config/loader');

// Load environment variables
require('dotenv').config();

const { validateConfig } = require('./config/validator');
const { connect, disconnect } = require('./services/database');
const { Migrator } = require('./services/migrator');

const COMMANDS = {
    up: runMigrations,
    down: rollbackMigration,
    status: showStatus,
    create: createMigration
};

async function main() {
    const command = process.argv[2] || 'status';
    const args = process.argv.slice(3);

    const handler = COMMANDS[command];
    
    if (!handler) {
        console.error(`Unknown command: ${command}`);
        console.log('Available commands: up, down, status, create');
        process.exit(1);
    }

    try {
        // Validate configuration
        validateConfig(config);

        // Connect to database
        await connect(config.database);

        // Run command
        await handler(args);

    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        await disconnect();
    }
}

async function runMigrations(args) {
    const migrator = new Migrator(config);
    
    console.log('Running pending migrations...');
    const results = await migrator.up();
    
    if (results.length === 0) {
        console.log('No pending migrations.');
        return;
    }

    results.forEach(r => {
        console.log(`  ✓ ${r.name} (${r.duration}ms)`);
    });
    
    console.log(`\n${results.length} migration(s) complete!`);
}

async function rollbackMigration(args) {
    const migrator = new Migrator(config);
    const steps = parseInt(args[0]) || 1;
    
    console.log(`Rolling back ${steps} migration(s)...`);
    const results = await migrator.down(steps);
    
    results.forEach(r => {
        console.log(`  ↩ ${r.name}`);
    });
}

async function showStatus() {
    const migrator = new Migrator(config);
    
    console.log(`Connected to: ${config.database.host}:${config.database.port}/${config.database.name}`);
    
    const pending = await migrator.getPending();
    const completed = await migrator.getCompleted();
    
    console.log(`\nCompleted migrations: ${completed.length}`);
    console.log(`Pending migrations: ${pending.length}`);
    
    if (pending.length > 0) {
        console.log('\nPending:');
        pending.forEach(m => console.log(`  - ${m}`));
    }
}

async function createMigration(args) {
    const name = args[0];
    
    if (!name) {
        console.error('Usage: migrate create <name>');
        process.exit(1);
    }

    const migrator = new Migrator(config);
    const filename = await migrator.create(name);
    
    console.log(`Created: ${filename}`);
}

main();
