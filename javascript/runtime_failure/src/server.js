/**
 * Webhook Processor Server
 */
const express = require('express');
const { validateWebhook } = require('./middleware/validator');
const { logRequest } = require('./middleware/logger');
const githubHandler = require('./handlers/github');
const stripeHandler = require('./handlers/stripe');
const slackHandler = require('./handlers/slack');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(logRequest);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
});

// Webhook routes
app.post('/webhook/github', validateWebhook('github'), async (req, res) => {
    try {
        const result = await githubHandler.process(req.body);
        res.json({ success: true, processed: `github:${result.event}`, timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/webhook/stripe', validateWebhook('stripe'), async (req, res) => {
    try {
        const result = await stripeHandler.process(req.body);
        res.json({ success: true, processed: `stripe:${result.type}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/webhook/slack', validateWebhook('slack'), async (req, res) => {
    try {
        const result = await slackHandler.process(req.body);
        res.json({ success: true, processed: result.eventType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Webhook processor running on port ${PORT}`);
});

module.exports = app;
