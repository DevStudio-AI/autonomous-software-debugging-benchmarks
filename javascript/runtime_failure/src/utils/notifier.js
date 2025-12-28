/**
 * Notification Sender Utility
 * Simulates sending notifications to various channels
 */

const NOTIFICATION_CHANNELS = {
    'payment-success': { type: 'email', priority: 'low' },
    'payment-failed': { type: 'sms', priority: 'high' },
    'urgent-issue': { type: 'slack', priority: 'high' },
    'large-pr': { type: 'slack', priority: 'medium' },
    'deployment': { type: 'slack', priority: 'high' },
    'urgent-slack': { type: 'pager', priority: 'critical' },
    'invoice-final-failure': { type: 'email', priority: 'high' },
    'reaction-alert': { type: 'slack', priority: 'medium' }
};

async function send(notificationType, data) {
    const channel = NOTIFICATION_CHANNELS[notificationType];
    
    console.log(`[${channel.type.toUpperCase()}] Sending ${notificationType} notification...`);
    
    // Simulate async send
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.1) {
                reject(new Error('Notification service temporarily unavailable'));
            }
            
            console.log(`[${channel.type.toUpperCase()}] Sent:`, JSON.stringify(data));
            
            resolve({
                sent: true,
                channel: channel.type,
                timestamp: new Date().toISOString()
            });
        }, 100);
    });
}

function getChannelForType(notificationType) {
    return NOTIFICATION_CHANNELS[notificationType];
}

module.exports = {
    send,
    getChannelForType
};
