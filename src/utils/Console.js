// Buffer für gruppierte Info-Logs
let infoGroups = {
    message: [],
    application: [],
    component: [],
    event: [],
    other: []
};
let infoGroupTimer = null;

function flushInfoGroups() {
    for (const [type, logs] of Object.entries(infoGroups)) {
        if (logs.length === 0) continue;
        let title = '';
        switch (type) {
            case 'message': title = 'Loaded message commands:'; break;
            case 'application': title = 'Loaded application commands:'; break;
            case 'component': title = 'Loaded components:'; break;
            case 'event': title = 'Loaded events:'; break;
            default: title = 'Info:';
        }
        const batched = `${title}\n` + logs.join('\n');
        sendToDiscordWebhook(batched);
        infoGroups[type] = [];
    }
}
// Buffer für Info-Logs
let infoBuffer = [];
let infoTimer = null;

function flushInfoBuffer() {
    if (infoBuffer.length === 0) return;
    const batched = infoBuffer.join('\n');
    infoBuffer = [];
    sendToDiscordWebhook(batched);
}
require('colors');
const fs = require('fs');
const https = require('https');
require('dotenv').config();

// Webhook-URL für Console aus .env
const DISCORD_WEBHOOK_URL_CONSOLE = process.env.DISCORD_WEBHOOK_URL_CONSOLE;

const webhookQueue = [];
let isSending = false;

function sendToDiscordWebhook(content) {
    if (!DISCORD_WEBHOOK_URL_CONSOLE) return;
    webhookQueue.push({ content });
    processWebhookQueue();
}

function processWebhookQueue() {
    if (isSending || webhookQueue.length === 0) return;
    isSending = true;
    const { content } = webhookQueue.shift();
    const MAX_LENGTH = 1900;
    const plainContent = content.replace(/\x1b\[[0-9;]*m/g, '');

    let chunks = [];
    for (let i = 0; i < plainContent.length; i += MAX_LENGTH) {
        chunks.push(plainContent.substring(i, i + MAX_LENGTH));
    }

    function sendChunk(index) {
        if (index >= chunks.length) {
            isSending = false;
            processWebhookQueue();
            return;
        }
        const data = JSON.stringify({
            content: `>>> \`\`\`\n${chunks[index]}\n\`\`\``
        });
        const url = new URL(DISCORD_WEBHOOK_URL_CONSOLE);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        };
        const req = https.request(options, (res) => {
            if (res.statusCode === 429) {
                setTimeout(() => sendChunk(index), 2000);
            } else {
                sendChunk(index + 1);
            }
        });
        req.on('error', () => {
            sendChunk(index + 1);
        });
        req.write(data);
        req.end();
    }
    sendChunk(0);
}

// Logging-Funktionen mit passenden Farben
const info = (...message) => {
    const time = new Date().toLocaleTimeString();
    let fileContent = fs.readFileSync('./terminal.log', 'utf-8');
    const msg = [`[${time}]`, 'ℹ️', message.join(' ')].join(' ');

    console.info(`[${time}]`.gray, '[Info]'.blue, message.join(' '));
    fileContent += msg + '\n';
    fs.writeFileSync('./terminal.log', fileContent, 'utf-8');

    // Gruppierung nach Typ
    if (msg.includes('Loaded new message command')) {
        infoGroups.message.push(msg);
    } else if (msg.includes('Loaded new application command')) {
        infoGroups.application.push(msg);
    } else if (msg.includes('Loaded new component')) {
        infoGroups.component.push(msg);
    } else if (msg.includes('Loaded new event')) {
        infoGroups.event.push(msg);
    } else {
        infoGroups.other.push(msg);
    }
    if (!infoGroupTimer) {
        infoGroupTimer = setTimeout(() => {
            flushInfoGroups();
            infoGroupTimer = null;
        }, 2000);
    }
}

const success = (...message) => {
    const time = new Date().toLocaleTimeString();
    let fileContent = fs.readFileSync('./terminal.log', 'utf-8');
    const msg = [`[${time}]`, '✅', message.join(' ')].join(' ');

    console.info(`[${time}]`.gray, '[OK]'.green, message.join(' '));
    fileContent += msg + '\n';

    fs.writeFileSync('./terminal.log', fileContent, 'utf-8');
    sendToDiscordWebhook(msg, 0x2ECC71); // Grün
}

const error = (...message) => {
    const time = new Date().toLocaleTimeString();
    let fileContent = fs.readFileSync('./terminal.log', 'utf-8');
    const msg = [`[${time}]`, '🛑', message.join(' ')].join(' ');

    console.error(`[${time}]`.gray, '[Error]'.red, message.join(' '));
    fileContent += msg + '\n';

    fs.writeFileSync('./terminal.log', fileContent, 'utf-8');
    sendToDiscordWebhook(msg, 0xE74C3C); // Rot
}

const warn = (...message) => {
    const time = new Date().toLocaleTimeString();
    let fileContent = fs.readFileSync('./terminal.log', 'utf-8');
    const msg = [`[${time}]`, '⚠️', message.join(' ')].join(' ');

    console.warn(`[${time}]`.gray, '[Warning]'.yellow, message.join(' '));
    fileContent += msg + '\n';

    fs.writeFileSync('./terminal.log', fileContent, 'utf-8');
    sendToDiscordWebhook(msg, 0xF1C40F); // Gelb
}

module.exports = { info, success, error, warn }