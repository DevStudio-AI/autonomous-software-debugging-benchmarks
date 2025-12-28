/**
 * Request Logging Middleware
 */

function logRequest(req, res, next) {
    const start = Date.now();
    
    // Log request
    console.log(`--> ${req.method} ${req.path}`);
    
    const originalSend = res.send;
    res.send = function(body) {
        const duration = Date.now() - start;
        console.log(`<-- ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
        originalSend.call(this, body);
    };

    next();
}

module.exports = {
    logRequest
};
