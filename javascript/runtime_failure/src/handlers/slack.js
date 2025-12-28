/**
 * Slack Webhook Handler
 */
const notifier = require('../utils/notifier');

async function process(payload) {
    const eventType = payload.type;

    // Slack URL verification challenge
    if (eventType === 'url_verification') {
        return { challenge: payload.challenge };
    }

    const event = payload.event;

    switch (event.type) {
        case 'message':
            return handleMessage(event);
        case 'app_mention':
            return handleMention(event);
        case 'reaction_added':
            return handleReaction(event);
        default:
            console.log(`Unhandled Slack event: ${event.type}`);
    }
}

async function handleMessage(event) {
    const text = event.text.toLowerCase();
    const channel = event.channel;
    const user = event.user;

    if (event.bot_id) {
        return { eventType: 'message', skipped: 'bot' };
    }

    // Check for keywords
    const keywords = ['urgent', 'help', 'emergency', 'critical'];
    const hasKeyword = keywords.some(kw => text.includes(kw));

    if (hasKeyword) {
        notifier.send('urgent-slack', {
            channel,
            user,
            message: event.text
        });
    }

    return { eventType: 'message', channel, user };
}

async function handleMention(event) {
    const text = event.text;
    const channel = event.channel;
    
    // event.text format: "<@BOTID> command args"
    const parts = text.split(' ');
    const command = parts[1];
    const args = parts.slice(2);

    console.log(`Bot mentioned with command: ${command}`);

    // Process commands
    const response = await processCommand(command, args.join(' '));
    
    return { eventType: 'app_mention', command, response };
}

async function processCommand(command, argsText) {
    switch (command.toLowerCase()) {
        case 'status':
            return { action: 'status', result: 'All systems operational' };
        case 'help':
            return { action: 'help', result: 'Available commands: status, help, report' };
        case 'report':
            const reportData = JSON.parse(argsText);
            return { action: 'report', data: reportData };
        default:
            return { action: 'unknown', command };
    }
}

async function handleReaction(event) {
    const reaction = event.reaction;
    const user = event.user;
    
    const itemType = event.item.type;
    const itemChannel = event.item.channel;
    const itemTs = event.item.ts;

    // Special reactions trigger notifications
    const alertReactions = ['rotating_light', 'fire', 'warning', 'sos'];
    
    if (alertReactions.includes(reaction)) {
        notifier.send('reaction-alert', {
            reaction,
            user,
            messageUrl: `https://slack.com/archives/${itemChannel}/p${itemTs.replace('.', '')}`
        });
    }

    return { eventType: 'reaction_added', reaction };
}

module.exports = {
    process
};
