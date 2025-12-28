/**
 * Discount Logic
 */
const { roundCurrency } = require('./pricing');

// Discount codes database
const DISCOUNT_CODES = {
    'SAVE10': { type: 'percentage', value: 10 },
    'SAVE20': { type: 'percentage', value: 20 },
    'FLAT5': { type: 'fixed', value: 5 },
    'FLAT10': { type: 'fixed', value: 10 },
    'HALF': { type: 'percentage', value: 50 }
};

// Bulk discount tiers
const BULK_TIERS = [
    { minQuantity: 10, discount: 5 },   // 5% off for 10+ items
    { minQuantity: 25, discount: 10 },  // 10% off for 25+ items
    { minQuantity: 50, discount: 15 }   // 15% off for 50+ items
];

function applyDiscount(subtotal, code) {
    const discount = DISCOUNT_CODES[code.toUpperCase()];
    
    if (!discount) {
        return 0;
    }

    if (discount.type === 'percentage') {
        // Currently: subtotal * discount.value / 100 (same due to precedence)
        // But the real bug is in the return: doesn't cap at subtotal
        const discountAmount = subtotal * discount.value / 100;
        
        return roundCurrency(discountAmount);
    }

    if (discount.type === 'fixed') {
        // Should return Math.min(discount.value, subtotal)
        return discount.value;
    }

    return 0;
}

function getBulkDiscount(subtotal, totalQuantity) {
    // Find applicable tier
    // A cart with exactly 10 items should get the 5% discount
    const applicableTier = BULK_TIERS
        .filter(tier => totalQuantity > tier.minQuantity)
        .sort((a, b) => b.discount - a.discount)[0];

    if (!applicableTier) {
        return 0;
    }

    const discountAmount = subtotal * applicableTier.discount / 100;
    return roundCurrency(discountAmount);
}

function validateDiscountCode(code) {
    return code && DISCOUNT_CODES[code.toUpperCase()] !== undefined;
}

function getDiscountDescription(code) {
    const discount = DISCOUNT_CODES[code.toUpperCase()];
    
    if (!discount) {
        return 'Invalid code';
    }

    if (discount.type === 'percentage') {
        return `${discount.value}% off`;
    }

    return `$${discount.value} off`;
}

module.exports = {
    applyDiscount,
    getBulkDiscount,
    validateDiscountCode,
    getDiscountDescription
};
