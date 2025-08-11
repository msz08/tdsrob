const { ApplicationCommandOptionType } = require('discord.js');
const ApplicationCommand = require('../../structure/ApplicationCommand');
const https = require('https');

function apiRequest({ method, path, token, body }) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'discord.com',
            path,
            method,
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json',
            }
        };
        if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

        const req = https.request(options, res => {
            let chunks = '';
            res.on('data', chunk => chunks += chunk);
            res.on('end', () => {
                if (res.statusCode === 204) return resolve({});
                try { resolve(JSON.parse(chunks)); } catch { resolve({}); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

module.exports = new ApplicationCommand({
    command: {
        name: 'emoji-app',
        description: 'Verwalte App-Emojis (Developer Portal Emojis)',
        type: 1,
        options: [
            {
                name: 'aktion',
                description: 'Was möchtest du tun?',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    { name: 'Liste', value: 'list' },
                    { name: 'Anzeigen', value: 'get' },
                    { name: 'Erstellen', value: 'create' },
                    { name: 'Umbenennen', value: 'rename' },
                    { name: 'Löschen', value: 'delete' }
                ]
            },
            {
                name: 'emoji_id',
                description: 'Emoji-ID (für anzeigen, umbenennen, löschen)',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'name',
                description: 'Name des Emojis (für erstellen/umbenennen)',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'bild_url',
                description: 'Bild-URL (für erstellen)',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    run: async (client, interaction) => {
        // Nur Bot-Owner darf diesen Befehl nutzen
        const ownerId = client.config?.OWNER_ID || process.env.OWNER_ID;
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'Nur der Bot-Owner darf diesen Befehl nutzen.', flags: 64 });
        }

        const aktion = interaction.options.getString('aktion');
        const emoji_id = interaction.options.getString('emoji_id');
        const name = interaction.options.getString('name');
        const bild_url = interaction.options.getString('bild_url');
        const appId = client.application.id;
        const token = client.token;

        // Hilfsfunktion: Bild von URL laden und in base64 umwandeln
        async function getImageData(url) {
            return new Promise((resolve, reject) => {
                https.get(url, res => {
                    const data = [];
                    res.on('data', chunk => data.push(chunk));
                    res.on('end', () => {
                        const buffer = Buffer.concat(data);
                        resolve(`data:image/png;base64,${buffer.toString('base64')}`);
                    });
                }).on('error', reject);
            });
        }

        try {
            if (aktion === 'list') {
                const data = await apiRequest({
                    method: 'GET',
                    path: `/api/v10/applications/${appId}/emojis`,
                    token
                });
                if (data.items && data.items.length > 0) {
                    const list = data.items.map(e => {
                        const syntax = `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`;
                        return `${syntax} \`${syntax}\` \`${e.name}\` (ID: ${e.id})${e.animated ? ' [animiert]' : ''}`;
                    }).join('\n');
                    await interaction.reply({ content: `**App-Emojis:**\n${list}`, flags: 64 });
                } else {
                    await interaction.reply({ content: 'Keine App-Emojis gefunden.', flags: 64 });
                }
            } else if (aktion === 'get') {
                if (!emoji_id) return interaction.reply({ content: 'Bitte gib eine Emoji-ID an.', flags: 64 });
                const data = await apiRequest({
                    method: 'GET',
                    path: `/api/v10/applications/${appId}/emojis/${emoji_id}`,
                    token
                });
                if (data.id) {
                    await interaction.reply({ content: `**${data.name}** (ID: ${data.id})`, flags: 64 });
                } else {
                    await interaction.reply({ content: 'Emoji nicht gefunden.', flags: 64 });
                }
            } else if (aktion === 'create') {
                if (!name || !bild_url) return interaction.reply({ content: 'Name und Bild-URL sind erforderlich.', flags: 64 });
                const imageData = await getImageData(bild_url);
                const data = await apiRequest({
                    method: 'POST',
                    path: `/api/v10/applications/${appId}/emojis`,
                    token,
                    body: { name, image: imageData }
                });
                if (data.id) {
                    await interaction.reply({ content: `Emoji erstellt: \`${data.name}\` (ID: ${data.id})`, flags: 64 });
                } else {
                    await interaction.reply({ content: `Fehler: ${data.message || 'Unbekannter Fehler'}`, flags: 64 });
                }
            } else if (aktion === 'rename') {
                if (!emoji_id || !name) return interaction.reply({ content: 'Emoji-ID und neuer Name sind erforderlich.', flags: 64 });
                const data = await apiRequest({
                    method: 'PATCH',
                    path: `/api/v10/applications/${appId}/emojis/${emoji_id}`,
                    token,
                    body: { name }
                });
                if (data.id) {
                    await interaction.reply({ content: `Emoji umbenannt: \`${data.name}\` (ID: ${data.id})`, flags: 64 });
                } else {
                    await interaction.reply({ content: `Fehler: ${data.message || 'Unbekannter Fehler'}`, flags: 64 });
                }
            } else if (aktion === 'delete') {
                if (!emoji_id) return interaction.reply({ content: 'Emoji-ID ist erforderlich.', flags: 64 });
                await apiRequest({
                    method: 'DELETE',
                    path: `/api/v10/applications/${appId}/emojis/${emoji_id}`,
                    token
                });
                await interaction.reply({ content: 'Emoji gelöscht.', flags: 64 });
            } else {
                await interaction.reply({ content: 'Unbekannte Aktion.', flags: 64 });
            }
        } catch (err) {
            await interaction.reply({ content: `Fehler: ${err.message}`, flags: 64 });
        }
    }
}).toJSON();