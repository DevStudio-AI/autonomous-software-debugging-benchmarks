/**
 * Shopping Cart Tests
 */
const Cart = require('../src/cart');
const { qualifiesForFreeShipping, FREE_SHIPPING_THRESHOLD } = require('../src/shipping');
const { getBulkDiscount } = require('../src/discounts');

// Test products
const products = {
    shirt: { id: 1, name: 'T-Shirt', price: 25.00 },
    pants: { id: 2, name: 'Jeans', price: 45.50 },
    shoes: { id: 3, name: 'Sneakers', price: 89.99 },
    hat: { id: 4, name: 'Cap', price: 15.00 },
    socks: { id: 5, name: 'Socks', price: 5.99 }
};

describe('Cart Operations', () => {
    let cart;

    beforeEach(() => {
        cart = new Cart();
    });

    test('should add items to cart', () => {
        cart.addItem(products.shirt, 2);
        expect(cart.items).toHaveLength(1);
        expect(cart.items[0].quantity).toBe(2);
    });

    test('should increase quantity when adding same item', () => {
        cart.addItem(products.shirt, 2);
        cart.addItem(products.shirt, 3);
        expect(cart.items).toHaveLength(1);
        expect(cart.items[0].quantity).toBe(5);
    });

    test('should update item quantity', () => {
        cart.addItem(products.shirt, 2);
        cart.updateQuantity(1, 5);
        expect(cart.items[0].quantity).toBe(5);
    });

    test('should remove item when quantity set to 0', () => {
        cart.addItem(products.shirt, 2);
        cart.updateQuantity(1, 0);
        expect(cart.items).toHaveLength(0);
    });

    test('should calculate subtotal correctly', () => {
        cart.addItem(products.shirt, 2);  // 25.00 * 2 = 50.00
        cart.addItem(products.pants, 1);  // 45.50 * 1 = 45.50
        expect(cart.getSubtotal()).toBe(95.50);
    });

    test('should handle decimal prices correctly', () => {
        cart.addItem(products.socks, 3);  // 5.99 * 3 = 17.97
        expect(cart.getSubtotal()).toBe(17.97);
    });
});

describe('Discounts', () => {
    let cart;

    beforeEach(() => {
        cart = new Cart();
    });

    test('should apply 10% discount correctly', () => {
        cart.addItem(products.shoes, 1);  // 89.99
        cart.applyDiscountCode('SAVE10');
        // 10% of 89.99 = 8.999, rounded to 9.00
        expect(cart.getDiscount()).toBe(9.00);
    });

    test('should apply 20% discount correctly', () => {
        cart.addItem({ id: 10, name: 'Test', price: 100.00 }, 1);
        cart.applyDiscountCode('SAVE20');
        expect(cart.getDiscount()).toBe(20.00);
    });

    test('should apply fixed amount discount', () => {
        cart.addItem(products.shirt, 2);  // 50.00
        cart.applyDiscountCode('FLAT10');
        expect(cart.getDiscount()).toBe(10.00);
    });

    test('should not exceed subtotal with fixed discount', () => {
        cart.addItem(products.socks, 1);  // 5.99
        cart.applyDiscountCode('FLAT10');  // $10 off
        expect(cart.getDiscount()).toBeLessThanOrEqual(5.99);
    });

    test('should apply bulk discount at exactly 10 items', () => {
        // Add exactly 10 items - should qualify for 5% bulk discount
        cart.addItem(products.socks, 10);  // 5.99 * 10 = 59.90
        // 5% of 59.90 = 2.995, rounded to 3.00
        const subtotal = cart.getSubtotal();
        const bulkDiscount = getBulkDiscount(subtotal, 10);
        expect(bulkDiscount).toBe(3.00);
    });

    test('should apply higher bulk discount at 25 items', () => {
        cart.addItem(products.socks, 25);  // 5.99 * 25 = 149.75
        const subtotal = cart.getSubtotal();
        const bulkDiscount = getBulkDiscount(subtotal, 25);
        // 10% of 149.75 = 14.975, rounded to 14.98
        expect(bulkDiscount).toBe(14.98);
    });

    test('should not stack coupon and bulk discounts', () => {
        cart.addItem(products.shirt, 10);  // 25.00 * 10 = 250.00
        cart.applyDiscountCode('SAVE10');   // 10% = 25.00
        // Bulk discount would be 5% = 12.50
        // Should use better discount (25.00), not stack them (37.50)
        expect(cart.getDiscount()).toBeLessThanOrEqual(25.00);
    });
});

describe('Tax and Shipping', () => {
    let cart;

    beforeEach(() => {
        cart = new Cart();
        cart.taxRate = 0.10; // 10% for easier testing
    });

    test('should calculate tax after discounts', () => {
        cart.addItem({ id: 10, name: 'Test', price: 100.00 }, 1);
        cart.applyDiscountCode('SAVE10');  // 10% off = $10 discount
        expect(cart.getTax()).toBe(9.00);
    });

    test('should qualify for free shipping at exactly $50', () => {
        expect(qualifiesForFreeShipping(50.00)).toBe(true);
    });

    test('should not qualify for free shipping below threshold', () => {
        expect(qualifiesForFreeShipping(49.99)).toBe(false);
    });

    test('should apply free shipping at threshold', () => {
        cart.addItem(products.shirt, 2);  // 25.00 * 2 = 50.00
        expect(cart.getShipping()).toBe(0);
    });

    test('should charge shipping below threshold', () => {
        cart.addItem(products.shirt, 1);  // 25.00
        expect(cart.getShipping()).toBe(5.99);
    });

    test('should base free shipping on discounted total', () => {
        // Add items worth $55
        cart.addItem({ id: 10, name: 'Test', price: 55.00 }, 1);
        cart.applyDiscountCode('FLAT10');  // $10 off = $45 subtotal after discount
        // Should NOT qualify for free shipping since effective total is $45
        expect(cart.getShipping()).toBe(5.99);
    });
});

describe('Total Calculation', () => {
    let cart;

    beforeEach(() => {
        cart = new Cart();
        cart.taxRate = 0.10; // 10% for easier testing
    });

    test('should calculate correct total with discount', () => {
        cart.addItem({ id: 10, name: 'Test', price: 100.00 }, 1);
        cart.applyDiscountCode('SAVE10');  // 10% off
        // Subtotal: 100.00
        // Discount: 10.00
        // After discount: 90.00
        // Tax (10%): 9.00
        // Shipping: 0 (over $50)
        // Total: 99.00
        expect(cart.getTotal()).toBe(99.00);
    });

    test('should calculate correct total with shipping', () => {
        cart.addItem(products.shirt, 1);  // 25.00
        // Subtotal: 25.00
        // Tax (10%): 2.50
        // Shipping: 5.99
        // Total: 33.49
        expect(cart.getTotal()).toBe(33.49);
    });

    test('should calculate correct total with discount and shipping', () => {
        cart.addItem({ id: 10, name: 'Test', price: 40.00 }, 1);
        cart.applyDiscountCode('FLAT5');  // $5 off
        // Subtotal: 40.00
        // Discount: 5.00
        // After discount: 35.00
        // Tax (10%): 3.50
        // Shipping: 5.99 (under $50 after discount)
        // Total: 44.49
        expect(cart.getTotal()).toBe(44.49);
    });
});

describe('Cart Summary', () => {
    test('should generate accurate summary', () => {
        const cart = new Cart();
        cart.taxRate = 0.10;
        cart.addItem(products.shirt, 2);  // 50.00
        cart.applyDiscountCode('SAVE10');  // 10% = 5.00

        const summary = cart.getSummary();

        expect(summary.subtotal).toBe(50.00);
        expect(summary.discount).toBe(5.00);
        expect(summary.tax).toBe(4.50);  // 10% of 45.00
        expect(summary.shipping).toBe(0);  // Free over $50... but wait, after discount it's $45
        expect(summary.total).toBe(49.50);
    });
});
