/**
 * Schema Validation Service
 */

const fs = require('fs').promises;
const jsonService = require('./jsonService');
const Record = require('./models/record');

async function validate(records, schemaPath) {
    const issues = [];

    try {
        const schemaContent = await fs.readFile(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent);

        records.forEach((record, index) => {
            const recordIssues = validateAgainstSchema(record.data, schema, index);
            issues.push(...recordIssues);
        });
    } catch (err) {
        if (err.code === 'ENOENT') {
            issues.push(`Schema file not found: ${schemaPath}`);
        } else {
            issues.push(`Schema error: ${err.message}`);
        }
    }

    return issues;
}

function validateAgainstSchema(data, schema, recordIndex) {
    const issues = [];
    const prefix = `Record ${recordIndex + 1}`;

    // Check required properties
    if (schema.required) {
        schema.required.forEach(prop => {
            if (!(prop in data)) {
                issues.push(`${prefix}: Missing required property '${prop}'`);
            }
        });
    }

    // Check property types
    if (schema.properties) {
        for (const [prop, rules] of Object.entries(schema.properties)) {
            if (prop in data) {
                const value = data[prop];
                const expectedType = rules.type;

                if (!checkType(value, expectedType)) {
                    issues.push(`${prefix}: Property '${prop}' should be ${expectedType}`);
                }
            }
        }
    }

    return issues;
}

function checkType(value, expectedType) {
    switch (expectedType) {
        case 'string':
            return typeof value === 'string';
        case 'number':
            return typeof value === 'number';
        case 'integer':
            return Number.isInteger(value);
        case 'boolean':
            return typeof value === 'boolean';
        case 'array':
            return Array.isArray(value);
        case 'object':
            return typeof value === 'object' && !Array.isArray(value) && value !== null;
        default:
            return true;
    }
}

module.exports = {
    validate,
    validateAgainstSchema
};
