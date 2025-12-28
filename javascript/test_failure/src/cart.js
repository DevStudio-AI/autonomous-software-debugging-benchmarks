/**
 * Shopping Cart
 */
const { calculateSubtotal, roundCurrency } = require('./pricing');
const { applyDiscount, getBulkDiscount } = require('./discounts');
const { calculateShipping } = require('./shipping');

class Cart {
    constructor() {
        this.items = [];
        this.discountCode = null;
        this.taxRate = 0.08; // 8%
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ product, quantity });
        }
        
        return this;
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.product.id === productId);
        
        if (!item) {
            throw new Error(`Product ${productId} not in cart`);
        }
        
        if (quantity <= 0) {
            return this.removeItem(productId);
        }

        item.quantity = quantity;
        return this;
    }

    removeItem(productId) {
        const index = this.items.findIndex(item => item.product.id === productId);
        
        if (index === -1) {
            throw new Error(`Product ${productId} not in cart`);
        }
        
        this.items.splice(index, 1);
        return this;
    }

    applyDiscountCode(code) {
        this.discountCode = code;
        return this;
    }

    getSubtotal() {
        return calculateSubtotal(this.items);
    }

    getDiscount() {
        const subtotal = this.getSubtotal();
        let discount = 0;

        // Apply coupon code discount
        if (this.discountCode) {
            discount = applyDiscount(subtotal, this.discountCode);
        }

        // Apply bulk discount
        const totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const bulkDiscount = getBulkDiscount(subtotal, totalQuantity);
        
        // This allows stacking discounts incorrectly
        discount += bulkDiscount;

        return roundCurrency(discount);
    }

    getTax() {
        const subtotal = this.getSubtotal();
        // Currently calculates tax on full subtotal
        const tax = subtotal * this.taxRate;
        return roundCurrency(tax);
    }

    getShipping() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscount();
        return calculateShipping(subtotal);
    }

    getTotal() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscount();
        const tax = this.getTax();
        const shipping = this.getShipping();

        // Currently: subtotal + tax + shipping - discount
        const total = subtotal + tax + shipping - discount;
        
        return roundCurrency(total);
    }

    getSummary() {
        return {
            items: this.items.map(item => ({
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                total: roundCurrency(item.product.price * item.quantity)
            })),
            subtotal: this.getSubtotal(),
            discount: this.getDiscount(),
            tax: this.getTax(),
            shipping: this.getShipping(),
            total: this.getTotal()
        };
    }

    clear() {
        this.items = [];
        this.discountCode = null;
        return this;
    }
}

module.exports = Cart;
