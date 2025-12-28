const authRoutes = require('../routes/auth');

// but the frontend sends token directly without 'Bearer ' prefix

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
    }
    
    // Frontend sends: 'tok_123456789'
    // Backend expects: 'Bearer tok_123456789'
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Invalid authorization format' });
    }
    
    const token = authHeader.slice(7);
    
    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    const session = authRoutes.validateToken(token);
    
    if (!session) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user_id = session.user_id;
    req.userEmail = session.email;
    
    next();
};

// Optional auth - doesn't fail if no token, but validates if present
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return next();
    }
    
    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const session = authRoutes.validateToken(token);
        if (session) {
            req.user_id = session.user_id;
            req.userEmail = session.email;
        }
    }
    
    next();
};

module.exports = { authMiddleware, optionalAuth };
