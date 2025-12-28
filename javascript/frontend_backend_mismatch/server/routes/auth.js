const express = require('express');
const router = express.Router();

// In-memory user store (simulating database)
const users = new Map();
const sessions = new Map();


router.post('/register', (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (users.has(email)) {
        return res.status(409).json({ error: 'User already exists' });
    }
    
    const user_id = `user_${Date.now()}`;
    users.set(email, {
        user_id,
        email,
        password, // In real app, would hash this
        name: name || email.split('@')[0],
        created_at: new Date().toISOString()
    });
    
    res.status(201).json({
        data: {
            user_id,
            email,
            name: name || email.split('@')[0]
        }
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = users.get(email);
    
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expires_at = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    sessions.set(token, {
        user_id: user.user_id,
        email: user.email,
        expires_at
    });
    
    res.json({
        data: {
            access_token: token,
            expires_at: expires_at,  // Unix timestamp, not ISO
            user: {
                user_id: user.user_id,
                email: user.email,
                name: user.name
            }
        }
    });
});

router.post('/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        sessions.delete(token);
    }
    
    res.json({ success: true });
});

router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.slice(7);
    const session = sessions.get(token);
    
    if (!session || session.expires_at < Date.now()) {
        sessions.delete(token);
        return res.status(401).json({ error: 'Token expired or invalid' });
    }
    
    const user = Array.from(users.values()).find(u => u.user_id === session.user_id);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
        data: {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            created_at: user.created_at
        }
    });
});

// Helper to validate token (exported for middleware)
router.validateToken = (token) => {
    const session = sessions.get(token);
    if (!session || session.expires_at < Date.now()) {
        sessions.delete(token);
        return null;
    }
    return session;
};

module.exports = router;
