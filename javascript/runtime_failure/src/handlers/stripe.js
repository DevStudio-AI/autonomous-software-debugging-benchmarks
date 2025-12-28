/**
 * Stripe Webhook Handler
 */
const { formatCurrency } = require('../utils/formatter');
const notifier = require('../utils/notifier');

async function process(payload) {
    const eventType = payload.type;
    const data = payload.data;

    switch (eventType) {
        case 'payment_intent.succeeded':
            return handlePaymentSuccess(data);
        case 'payment_intent.failed':
            return handlePaymentFailure(data);
        case 'customer.subscription.created':
            return handleNewSubscription(data);
        case 'invoice.payment_failed':
            return handleInvoiceFailure(data);
        default:
            return { type: eventType, handled: false };
    }
}

async function handlePaymentSuccess(data) {
    const payment = data.object;
    
    // Also: amount might be a string from some webhook sources
    const amount = payment.amount;
    const currency = payment.currency;
    
    const formatted = formatCurrency(amount.toFixed(2), currency);
    
    console.log(`Payment succeeded: ${formatted}`);
    
    const customerId = payment.metadata.customer_id;
    const orderId = payment.metadata.order_id;

    await notifier.send('payment-success', {
        amount: formatted,
        customer: customerId,
        order: orderId
    });

    return { type: 'payment_intent.succeeded', amount };
}

async function handlePaymentFailure(data) {
    const payment = data.object;
    
    const error = payment.last_payment_error;
    const code = error.code;
    const message = error.message;

    console.error(`Payment failed: ${code} - ${message}`);

    const chargeId = payment.charges.data[0].id;

    await notifier.send('payment-failed', {
        error: code,
        message,
        chargeId
    });

    return { type: 'payment_intent.failed', error: code };
}

async function handleNewSubscription(data) {
    const subscription = data.object;
    
    const plan = subscription.items.data[0].plan;
    
    if (plan.amount > '1000') {
        console.log('High-value subscription created');
    }

    const planName = plan.nickname || plan.id;
    
    const endDate = new Date(subscription.current_period_end);
    
    return {
        type: 'customer.subscription.created',
        plan: planName,
        ends: endDate.toISOString()
    };
}

async function handleInvoiceFailure(data) {
    const invoice = data.object;
    
    const customerEmail = invoice.customer.email;
    
    const items = invoice.lines.data.map(line => ({
        description: line.description,
        amount: line.amount / 100
    }));

    const attempts = invoice.attempt_count;
    
    if (attempts > 2) {
        await notifier.send('invoice-final-failure', {
            customer: customerEmail,
            items,
            amount: invoice.amount_due / 100
        });
    }

    return { type: 'invoice.payment_failed', attempts };
}

module.exports = {
    process
};
