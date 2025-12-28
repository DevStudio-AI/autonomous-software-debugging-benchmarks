/**
 * Main Validation Orchestrator
 */

const fs = require('fs').promises;
const path = require('path');

const parser = require('./utils/parser');
const jsonService = require('./sevices/jsonService');
const csvService = require('./services/csvService');
const schemaService = require('./services/schemaService');
const { ValidationResult } = require('./models/validationResult');
const logger = require('./utils/logger');

const FORMAT_HANDLERS = {
    '.json': jsonService,
    '.csv': csvService,
    '.xml': null, // Not implemented
    '.yaml': null, // Not implemented
    '.yml': null
};

class Validator {
    constructor(options = {}) {
        this.strict = options.strict || false;
        this.schemaPath = options.schemaPath || null;
    }

    async validate(filepath) {
        // Check file exists
        try {
            await fs.access(filepath);
        } catch {
            return new ValidationResult(false, {
                error: 'File not found',
                issues: [`Cannot access file: ${filepath}`]
            });
        }

        // Determine format
        const ext = path.extname(filepath).toLowerCase();
        const handler = FORMAT_HANDLERS[ext];

        if (!handler) {
            return new ValidationResult(false, {
                error: 'Unsupported format',
                issues: [`Format '${ext}' is not supported`]
            });
        }

        // Read and parse file
        const content = await fs.readFile(filepath, 'utf-8');
        const parseResult = parser.parse(content, ext);

        if (!parseResult.success) {
            return new ValidationResult(false, {
                format: ext.slice(1).toUpperCase(),
                error: 'Parse error',
                issues: parseResult.errors
            });
        }

        // Validate against schema if provided
        let schemaIssues = [];
        if (this.schemaPath) {
            schemaIssues = await schemaService.validate(
                parseResult.data,
                this.schemaPath
            );
        }

        // Run format-specific validation
        const formatIssues = handler.validate(parseResult.data);
        const allIssues = [...schemaIssues, ...formatIssues];

        return new ValidationResult(allIssues.length === 0, {
            format: ext.slice(1).toUpperCase(),
            recordCount: parseResult.recordCount || parseResult.data.length || 1,
            issues: allIssues
        });
    }
}

module.exports = Validator;
