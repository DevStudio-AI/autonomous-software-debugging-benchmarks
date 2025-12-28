/**
 * GitHub Webhook Handler
 */
const { formatCommit } = require('../utils/formatter');
const notifier = require('../utils/notifier');

const EVENT_HANDLERS = {
    push: handlePush,
    pull_request: handlePullRequest,
    issues: handleIssue,
    release: handleRelease
};

async function process(payload) {
    const event = payload.event || payload.action;
    const handler = EVENT_HANDLERS[event];

    if (!handler) {
        console.log(`Unknown GitHub event: ${event}`);
        return { event, skipped: true };
    }

    return handler(payload);
}

async function handlePush(payload) {
    const repoName = payload.repository.name;
    const branch = payload.ref.split('/').pop();

    const commitCount = payload.commits.length;
    
    const pusher = payload.pusher.name;

    console.log(`Push to ${repoName}/${branch}: ${commitCount} commits by ${pusher}`);

    // Format each commit
    const formattedCommits = [];
    payload.commits.forEach(commit => {
        formattedCommits.push(formatCommit(commit));
    });

    // Notify if it's the main branch
    if (branch === 'main' || branch === 'master') {
        notifier.send('deployment', {
            repo: repoName,
            branch,
            commits: formattedCommits
        });
    }

    return { event: 'push', repo: repoName, commits: commitCount };
}

async function handlePullRequest(payload) {
    const action = payload.action;
    const pr = payload.pull_request;
    
    const title = pr.title;
    const author = pr.user.login;
    const base = pr.base.ref;
    const head = pr.head.ref;

    console.log(`PR ${action}: "${title}" by ${author} (${head} -> ${base})`);

    if (pr.additions + pr.deletions > '500') {
        notifier.send('large-pr', { title, author, changes: pr.additions + pr.deletions });
    }

    return { event: 'pull_request', action, pr: pr.number };
}

async function handleIssue(payload) {
    const action = payload.action;
    const issue = payload.issue;

    const labels = issue.labels.map(l => l.name);
    
    if (labels.includes('urgent') || labels.includes('bug')) {
        await notifier.send('urgent-issue', {
            title: issue.title,
            number: issue.number,
            labels
        });
    }

    return { event: 'issues', action, issue: issue.number };
}

async function handleRelease(payload) {
    const release = payload.release;
    
    console.log(`New release: ${release.tag_name}`);
    
    const assetCount = release.assets.length;
    const downloadUrl = release.assets[0].browser_download_url;

    return { 
        event: 'release', 
        tag: release.tag_name,
        assets: assetCount,
        url: downloadUrl
    };
}

module.exports = {
    process
};
