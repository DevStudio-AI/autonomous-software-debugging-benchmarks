/**
 * CSV Format Validation Service
 */

function validate(records) {
    const issues = [];
    
    if (records.length === 0) {
        issues.push('CSV file contains no data rows');
        return issues;
    }

    // Get expected columns from first record
    const expectedColumns = Object.keys(records[0].data);

    records.forEach((record, index) => {
        const actualColumns = Object.keys(record.data);
        
        // Check for column count mismatch
        if (actualColumns.length !== expectedColumns.length) {
            issues.push(`Row ${index + 1}: Column count mismatch (expected ${expectedColumns.length}, got ${actualColumns.length})`);
        }

        // Check for empty required values
        actualColumns.forEach(col => {
            if (record.data[col] === '' && isRequiredColumn(col)) {
                issues.push(`Row ${index + 1}: Empty value in required column '${col}'`);
            }
        });
    });

    return issues;
}

function isRequiredColumn(columnName) {
    const required = ['id', 'name', 'email'];
    return required.includes(columnName.toLowerCase());
}

module.exports = {
    validate
};
