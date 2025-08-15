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

require('colors');
const fs = require('fs');
const https = require('https');
require('dotenv').config();

const DISCORD_WEBHOOK_URL_CONSOLE = process.env.DISCORD_WEBHOOK_URL_CONSOLE;

// Webhook-Queue für Rate-Limit und Chunking
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

// Originale Console sichern
const origLog = console.log;
const origInfo = console.info;
const origWarn = console.warn;
const origError = console.error;

// Hilfsfunktion: Prüft, ob eine Nachricht eine "Loaded ..." Gruppierungs-Info ist
function isGroupedInfo(msg) {
    return (
        msg.includes('Loaded new message command') ||
        msg.includes('Loaded new application command') ||
        msg.includes('Loaded new component') ||
        msg.includes('Loaded new event')
    );
}

// Logging-Funktionen mit passenden Farben und Gruppierung
const info = (...message) => {
    const time = new Date().toLocaleTimeString();
    let fileContent = fs.readFileSync('./terminal.log', 'utf-8');
    const msg = [`[${time}]`, 'ℹ️', message.join(' ')].join(' ');

    origInfo(`[${time}]`.gray, '[Info]'.blue, message.join(' '));
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

    origInfo(`[${time}]`.gray, '[OK]'.green, message.join(' '));
    fileContent += msg + '\n';

    fs.writeFileSync('./terminal.log', fileContent, 'utf-8');
    sendToDiscordWebhook(msg); // Direkt, da keine Gruppierung nötig
}

const error = (...message) => {
    const time = new Date().toLocaleTimeString();
    let fileContent = fs.readFileSync('./terminal.log', 'utf-8');
    const msg = [`[${time}]`, '🛑', message.join(' ')].join(' ');

    origError(`[${time}]`.gray, '[Error]'.red, message.join(' '));
    fileContent += msg + '\n';

    fs.writeFileSync('./terminal.log', fileContent, 'utf-8');
    sendToDiscordWebhook(msg); // Direkt, da keine Gruppierung nötig
}

const warn = (...message) => {
    const time = new Date().toLocaleTimeString();
    let fileContent = fs.readFileSync('./terminal.log', 'utf-8');
    const msg = [`[${time}]`, '⚠️', message.join(' ')].join(' ');

    origWarn(`[${time}]`.gray, '[Warning]'.yellow, message.join(' '));
    fileContent += msg + '\n';

    fs.writeFileSync('./terminal.log', fileContent, 'utf-8');
    sendToDiscordWebhook(msg); // Direkt, da keine Gruppierung nötig
}

// Überschreibe Standard-Console-Methoden: Alles geht ins Terminal UND Discord
// Aber Gruppen-Nachrichten ("Loaded ...") werden NICHT einzeln gesendet!
console.log = (...args) => {
    origLog(...args);
    const msg = args.map(String).join(' ');
    if (!isGroupedInfo(msg)) sendToDiscordWebhook(msg);
};
console.info = (...args) => {
    origInfo(...args);
    const msg = args.map(String).join(' ');
    if (!isGroupedInfo(msg)) sendToDiscordWebhook(msg);
};
console.warn = (...args) => {
    origWarn(...args);
    const msg = args.map(String).join(' ');
    if (!isGroupedInfo(msg)) sendToDiscordWebhook(msg);
};
console.error = (...args) => {
    origError(...args);
    const msg = args.map(String).join(' ');
    if (!isGroupedInfo(msg)) sendToDiscordWebhook(msg);
};

// Uncaught Exception und Unhandled Rejection für ALLES im Discord loggen
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.stack || err.toString());
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason && reason.stack ? reason.stack : reason);
});

module.exports = { info, success, error, warn };