/**
 * File Format Validator - Entry Point
 * 
 * Usage: node src/index.js <filepath>
 */

const Validator = require('../validator');
const logger = require('../utils/logger');

async function main() {
    const filepath = process.argv[2];
    
    if (!filepath) {
        console.log('Usage: node src/index.js <filepath>');
        console.log('');
        console.log('Supported formats: .json, .csv, .xml, .yaml');
        process.exit(1);
    }

    logger.info(`Validating: ${filepath}`);
    
    try {
        const validator = new Validator();
        const result = await validator.validate(filepath);
        
        if (result.isValid) {
            logger.success(`Format: ${result.format}`);
            logger.success(`Schema: Valid`);
            logger.success(`${result.recordCount} records found`);
            console.log('\nValidation complete!');
        } else {
            logger.error(`Validation failed: ${result.error}`);
            result.issues.forEach((issue, i) => {
                logger.warn(`  ${i + 1}. ${issue}`);
            });
            process.exit(1);
        }
    } catch (err) {
        logger.error(`Error: ${err.message}`);
        process.exit(1);
    }
}

main();
