const os = require('os');
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'systeminfo',
        description: 'Zeigt System- und Bot-Informationen an.',
        type: 1,
        options: []
    },
    options: {
        cooldown: 5000
    },
    run: async (client, interaction) => {
        const uptime = Math.floor(client.uptime / 1000);
        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
        const usedMem = (os.totalmem() - os.freemem()) / 1024 / 1024;
        const cpu = os.cpus()[0].model;
        const node = process.version;
        const wsPing = client.ws.ping;
        const guilds = client.guilds.cache.size;
        const users = client.users.cache.size;
        const channels = client.channels.cache.size;

        await interaction.reply({
            embeds: [{
                title: 'System- und Bot-Info',
                color: 0x5865F2,
                fields: [
                    { name: 'WebSocket Ping', value: `${wsPing}ms`, inline: true },
                    { name: 'Uptime', value: `${uptime}s`, inline: true },
                    { name: 'Heap Memory', value: `${memory} MB`, inline: true },
                    { name: 'RAM genutzt', value: `${usedMem.toFixed(2)} MB / ${totalMem} MB`, inline: true },
                    { name: 'CPU', value: cpu, inline: false },
                    { name: 'CPU-Kerne', value: `${os.cpus().length}`, inline: true },
                    { name: 'Node.js', value: node, inline: true },
                    { name: 'Architektur', value: os.arch(), inline: true },
                    { name: 'Betriebssystem', value: `${os.platform()} ${os.release()}`, inline: true },
                    { name: 'Server', value: `${guilds}`, inline: true },
                    { name: 'User', value: `${users}`, inline: true },
                    { name: 'Channels', value: `${channels}`, inline: true },
                    { name: 'Bot-Tag', value: client.user.tag, inline: true },
                    { name: 'Bot-ID', value: client.user.id, inline: true },
                    { name: 'Startzeit', value: new Date(Date.now() - client.uptime).toLocaleString(), inline: false },
                    { name: 'Prozess-ID', value: `${process.pid}`, inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        });
    }
}).toJSON();