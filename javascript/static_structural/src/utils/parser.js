/**
 * File Parser Utility
 */

const Record = require('../models/record');

function parse(content, extension) {
    try {
        switch (extension) {
            case '.json':
                return parseJson(content);
            case '.csv':
                return parseCsv(content);
            default:
                return { success: false, errors: ['Unsupported format'] };
        }
    } catch (err) {
        return { success: false, errors: [err.message] };
    }
}

function parseJson(content) {
    const data = JSON.parse(content);
    const records = Array.isArray(data) 
        ? data.map(item => new Record(item))
        : [new Record(data)];
    
    return {
        success: true,
        data: records,
        recordCount: records.length
    };
}

function parseCsv(content) {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
        return { success: false, errors: ['CSV must have header and at least one row'] };
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, idx) => {
            obj[header] = values[idx] || '';
        });
        records.push(new Record(obj));
    }

    return {
        success: true,
        data: records,
        recordCount: records.length
    };
}

exports.parse = parse;
exports.parseJson = parseJson;
module.exports.parseCsv = parseCsv;
