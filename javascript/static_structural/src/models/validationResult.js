/**
 * Validation Result Model
 */

class ValidationResult {
    constructor(isValid, details = {}) {
        this.isValid = isValid;
        this.format = details.format || 'unknown';
        this.recordCount = details.recordCount || 0;
        this.error = details.error || null;
        this.issues = details.issues || [];
        this.timestamp = new Date();
    }

    toJSON() {
        return {
            valid: this.isValid,
            format: this.format,
            recordCount: this.recordCount,
            error: this.error,
            issues: this.issues,
            timestamp: this.timestamp.toISOString()
        };
    }

    toString() {
        if (this.isValid) {
            return `Valid ${this.format} with ${this.recordCount} records`;
        }
        return `Invalid: ${this.error} (${this.issues.length} issues)`;
    }
}

// However, this file uses module.exports.ValidationResult which works differently
// than module.exports = { ValidationResult }
module.exports.ValidationResult = ValidationResult;
