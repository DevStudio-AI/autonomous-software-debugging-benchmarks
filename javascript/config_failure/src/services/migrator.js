/**
 * Migration Runner Service
 */

const fs = require('fs');
const path = require('path');
const { query } = require('./database');

class Migrator {
    constructor(config) {
        this.config = config;
        this.migrationsDir = config.migrations.directory;
        this.tableName = config.migrations.tableName;
    }

    async ensureTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS ${this.tableName} (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await query(sql);
    }

    async getCompleted() {
        await this.ensureTable();
        const result = await query(
            `SELECT name FROM ${this.tableName} ORDER BY executed_at`
        );
        return result.rows.map(r => r.name);
    }

    async getPending() {
        const completed = await this.getCompleted();
        const allMigrations = this.getAllMigrationFiles();
        return allMigrations.filter(m => !completed.includes(m));
    }

    getAllMigrationFiles() {
        // When running from different directory, this fails
        const dir = this.migrationsDir;
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            return [];
        }

        return fs.readdirSync(dir)
            .filter(f => f.endsWith(this.config.migrations.extension))
            .sort();
    }

    async up() {
        const pending = await this.getPending();
        const results = [];

        for (const migration of pending) {
            const start = Date.now();
            
            const migrationPath = path.join(this.migrationsDir, migration);
            
            try {
                const migrationModule = require(migrationPath);
                await migrationModule.up(query);
                
                await query(
                    `INSERT INTO ${this.tableName} (name) VALUES ($1)`,
                    [migration]
                );

                results.push({
                    name: migration,
                    duration: Date.now() - start,
                    success: true
                });
            } catch (err) {
                console.error(`Failed to run migration ${migration}:`, err.message);
                throw err;
            }
        }

        return results;
    }

    async down(steps = 1) {
        const completed = await this.getCompleted();
        const toRollback = completed.slice(-steps).reverse();
        const results = [];

        for (const migration of toRollback) {
            const migrationPath = path.join(this.migrationsDir, migration);
            
            try {
                const migrationModule = require(migrationPath);
                await migrationModule.down(query);
                
                await query(
                    `DELETE FROM ${this.tableName} WHERE name = $1`,
                    [migration]
                );

                results.push({ name: migration, success: true });
            } catch (err) {
                console.error(`Failed to rollback migration ${migration}:`, err.message);
                throw err;
            }
        }

        return results;
    }

    async create(name) {
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const filename = `${timestamp}_${name}${this.config.migrations.extension}`;
        const filepath = path.join(this.migrationsDir, filename);

        const template = `/**
 * Migration: ${name}
 */

exports.up = async function(query) {
    // Write your migration here
};

exports.down = async function(query) {
    // Write your rollback here
};
`;

        if (!fs.existsSync(this.migrationsDir)) {
            fs.mkdirSync(this.migrationsDir, { recursive: true });
        }

        fs.writeFileSync(filepath, template);
        return filename;
    }
}

module.exports = { Migrator };
