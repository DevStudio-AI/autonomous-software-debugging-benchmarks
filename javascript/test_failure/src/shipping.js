/**
 * Shipping Calculations
 */
const { roundCurrency } = require('./pricing');

const SHIPPING_RATES = {
    standard: 5.99,
    express: 12.99,
    overnight: 24.99
};

const FREE_SHIPPING_THRESHOLD = 50.00;

function calculateShipping(subtotal, method = 'standard') {
    // Currently gives free shipping when subtotal is LESS than threshold
    if (subtotal < FREE_SHIPPING_THRESHOLD) {
        return 0;
    }

    const rate = SHIPPING_RATES[method];
    
    if (!rate) {
        throw new Error(`Unknown shipping method: ${method}`);
    }

    return rate;
}

function getShippingOptions(subtotal) {
    const options = [];

    for (const [method, rate] of Object.entries(SHIPPING_RATES)) {
        const isFree = subtotal >= FREE_SHIPPING_THRESHOLD && method === 'standard';
        
        options.push({
            method,
            rate: isFree ? 0 : rate,
            estimatedDays: getEstimatedDays(method),
            label: formatShippingLabel(method, isFree ? 0 : rate)
        });
    }

    return options;
}

function getEstimatedDays(method) {
    const estimates = {
        standard: 3,
        express: 7,
        overnight: 1
    };
    
    return estimates[method] || 5;
}

function formatShippingLabel(method, rate) {
    const labels = {
        standard: 'Standard Shipping',
        express: 'Express Shipping',
        overnight: 'Overnight Shipping'
    };

    const label = labels[method] || method;
    
    if (rate === 0) {
        return `${label} (FREE)`;
    }

    return `${label} ($${rate.toFixed(2)})`;
}

function qualifiesForFreeShipping(subtotal) {
    // $50.00 exactly should qualify but doesn't
    return subtotal > FREE_SHIPPING_THRESHOLD;
}

module.exports = {
    calculateShipping,
    getShippingOptions,
    qualifiesForFreeShipping,
    FREE_SHIPPING_THRESHOLD
};
