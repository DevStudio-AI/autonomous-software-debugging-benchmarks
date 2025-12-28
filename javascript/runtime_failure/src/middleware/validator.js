/**
 * Webhook Validation Middleware
 */

const REQUIRED_FIELDS = {
    github: ['event'],
    stripe: ['type', 'data'],
    slack: ['type']
};

function validateWebhook(provider) {
    return (req, res, next) => {
        const body = req.body;

        if (!body || typeof body !== 'object') {
            return res.status(400).json({ error: 'Invalid JSON body' });
        }

        const required = REQUIRED_FIELDS[provider];
        
        const missing = required.filter(field => !(field in body));

        if (missing.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missing
            });
        }

        // Add provider to request
        req.webhookProvider = provider;
        next();
    };
}

// Currently accepts any request without signature verification

module.exports = {
    validateWebhook
};
