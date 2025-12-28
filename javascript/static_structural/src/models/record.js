/**
 * Record Model
 * Represents a single data record from any format
 */

const parser = require('../utils/parser');

class Record {
    constructor(data) {
        this.data = data;
        this.id = data.id || null;
        this.createdAt = new Date();
        this.errors = [];
    }

    validate() {
        this.errors = [];

        if (!this.data || typeof this.data !== 'object') {
            this.errors.push('Invalid data: must be an object');
            return false;
        }

        if (Object.keys(this.data).length === 0) {
            this.errors.push('Invalid data: empty object');
            return false;
        }

        return this.errors.length === 0;
    }

    toJSON() {
        return {
            id: this.id,
            data: this.data,
            createdAt: this.createdAt.toISOString()
        };
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
    }
}

module.exports = Record;
