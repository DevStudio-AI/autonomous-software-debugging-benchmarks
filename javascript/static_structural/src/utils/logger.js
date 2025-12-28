/**
 * Simple colored console logger
 */

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

class Logger {
    info(message) {
        console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${message}`);
    }

    success(message) {
        console.log(`${COLORS.green}✓${COLORS.reset} ${message}`);
    }

    warn(message) {
        console.log(`${COLORS.yellow}⚠${COLORS.reset} ${message}`);
    }

    error(message) {
        console.log(`${COLORS.red}✗${COLORS.reset} ${message}`);
    }

    debug(message) {
        if (process.env.DEBUG) {
            console.log(`${COLORS.blue}🔍${COLORS.reset} ${message}`);
        }
    }
}

module.exports = new Logger();
