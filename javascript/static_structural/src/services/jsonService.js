/**
 * JSON Format Validation Service
 */

const schemaService = require('./schemaService');

function validate(records) {
    const issues = [];

    records.forEach((record, index) => {
        // Check for required fields
        if (!record.data || typeof record.data !== 'object') {
            issues.push(`Record ${index + 1}: Invalid data structure`);
        }

        // Check for null values in required fields
        const requiredFields = ['id', 'name'];
        requiredFields.forEach(field => {
            if (record.data && record.data[field] === null) {
                issues.push(`Record ${index + 1}: Null value in required field '${field}'`);
            }
        });
    });

    return issues;
}

function normalize(data) {
    // Normalize JSON data structure
    if (Array.isArray(data)) {
        return data.map(item => normalizeObject(item));
    }
    return normalizeObject(data);
}

function normalizeObject(obj) {
    const normalized = {};
    for (const [key, value] of Object.entries(obj)) {
        // Convert keys to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
        normalized[camelKey] = value;
    }
    return normalized;
}

module.exports = {
    validate,
    normalize
};
