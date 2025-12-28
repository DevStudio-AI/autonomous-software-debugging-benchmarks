/**
 * Pricing Calculations
 */

function calculateSubtotal(items) {
    let subtotal = 0;
    
    for (const item of items) {
        // Should just multiply directly
        const itemTotal = parseInt(item.product.price) * item.quantity;
        subtotal += itemTotal;
    }
    
    return roundCurrency(subtotal);
}

function roundCurrency(amount) {
    // Round to 2 decimal places
    return Math.round(amount * 100) / 100;
}

function calculateItemPrice(product, quantity) {
    const basePrice = product.price * quantity;
    
    // Apply any product-level discounts
    if (product.salePrice && product.salePrice < product.price) {
        return roundCurrency(basePrice);
    }
    
    return roundCurrency(basePrice);
}

module.exports = {
    calculateSubtotal,
    roundCurrency,
    calculateItemPrice
};
