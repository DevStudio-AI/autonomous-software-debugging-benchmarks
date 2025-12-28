/**
 * Data Formatting Utilities
 */

function formatCommit(commit) {
    return {
        id: commit.id.substring(0, 7),
        message: commit.message.split('\n')[0], // First line only
        author: commit.author.name,
        timestamp: new Date(commit.timestamp).toISOString()
    };
}

function formatCurrency(amount, currency = 'usd') {
    const symbols = {
        usd: '$',
        eur: '€',
        gbp: '£'
    };
    
    const symbol = symbols[currency.toLowerCase()];
    return `${symbol}${amount}`;
}

function formatDate(input) {
    const date = new Date(input);
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function truncate(text, maxLength = 100) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + '...';
}

module.exports = {
    formatCommit,
    formatCurrency,
    formatDate,
    truncate
};
