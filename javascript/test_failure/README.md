# Shopping Cart

## Difficulty: ⭐⭐
## Pillar: Test Failures

A JavaScript module for e-commerce shopping cart functionality with pricing, discounts, and tax calculations.

## The Bug

The project contains bugs that cause the symptoms described below. The debugging system must identify and fix these issues.
- Discount calculations use wrong operator precedence
- Tax is applied before discounts (should be after)
- Quantity updates don't recalculate totals correctly
- Free shipping threshold comparison is inverted
- Bulk discount tiers have off-by-one errors

## Symptoms

```bash
$ npm test

FAIL tests/cart.test.js
  ✗ should apply 10% discount correctly
    Expected: 90.00
    Received: 91.00

  ✗ should calculate tax after discounts
    Expected: 95.40
    Received: 99.00

  ✗ should qualify for free shipping at exactly $50
    Expected: 0
    Received: 5.99
```

## Expected Behavior

When fixed, all tests pass:

```bash
$ npm test

PASS tests/cart.test.js
  Cart Operations
    ✓ should add items to cart
    ✓ should update item quantity
    ✓ should remove items from cart
    ✓ should calculate subtotal correctly
  
  Discounts
    ✓ should apply percentage discount correctly
    ✓ should apply fixed amount discount correctly
    ✓ should apply bulk discount at correct tier
    ✓ should not exceed maximum discount
  
  Tax and Shipping
    ✓ should calculate tax after discounts
    ✓ should apply free shipping at threshold
    ✓ should calculate correct grand total
```

## Project Structure

```
src/
├── cart.js           # Main cart class
├── pricing.js        # Pricing calculations
├── discounts.js      # Discount logic
└── shipping.js       # Shipping calculations
tests/
└── cart.test.js      # Jest test suite
```

## Difficulty

⭐⭐ (Intermediate) - Requires understanding of business logic, operator precedence, and boundary conditions.

## What Makes This Realistic

E-commerce calculation bugs are notoriously common and costly:
- Order of operations in financial calculations
- Boundary conditions in discount tiers
- Tax calculation timing
- Rounding errors in currency
