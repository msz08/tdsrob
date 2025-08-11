const { ApplicationCommandOptionType } = require('discord.js');
const ApplicationCommand = require('../../structure/ApplicationCommand');

module.exports = new ApplicationCommand({
    command: {
        name: 'emoji-info',
        description: 'Zeigt alle verfügbaren Informationen zu einem Emoji an.',
        type: 1,
        options: [
            {
                name: 'emoji',
                description: 'Das Emoji (Server-Emoji, kein Unicode)',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    run: async (client, interaction) => {
        const emojiInput = interaction.options.getString('emoji', true);

        // Regex für Custom Emojis
        const regex = /<(a?):(\w+):(\d+)>/;
        const match = emojiInput.match(regex);

        if (!match) {
            await interaction.reply({
                content: 'Bitte gib ein gültiges Server-Emoji an!',
                flags: 64
            });
            return;
        }

        const animated = match[1] === 'a';
        const name = match[2];
        const id = match[3];
        const urlPng = `https://cdn.discordapp.com/emojis/${id}.png?v=1`;
        const urlGif = `https://cdn.discordapp.com/emojis/${id}.gif?v=1`;

        // Versuche das Emoji-Objekt aus allen Guilds zu finden
        let emojiObj = null;
        for (const [, guild] of client.guilds.cache) {
            emojiObj = guild.emojis.cache.get(id);
            if (emojiObj) break;
        }

        let info = [
            `**Name:** \`${name}\``,
            `**ID:** \`${id}\``,
            `**Animiert:** ${animated ? 'Ja' : 'Nein'}`,
            `**Direktlink PNG:** [PNG](${urlPng})`,
            `**Direktlink GIF:** ${animated ? `[GIF](${urlGif})` : 'Nicht verfügbar'}`,
            `**Emoji:** <${animated ? 'a' : ''}:${name}:${id}>`
        ];

        if (emojiObj) {
            info.push(
                `**Erstellt am:** <t:${Math.floor(emojiObj.createdTimestamp / 1000)}:F>`,
                `**Verfügbar:** ${emojiObj.available ? 'Ja' : 'Nein'}`,
                `**Ersteller:** ${emojiObj.author ? `${emojiObj.author.tag} (${emojiObj.author.id})` : 'Unbekannt'}`,
                `**Nur für Whitelist-Rollen:** ${emojiObj.roles.cache.size > 0 ? emojiObj.roles.cache.map(r => `<@&${r.id}>`).join(', ') : 'Nein'}`,
                `**Erlaubt für alle?** ${emojiObj.roles.cache.size === 0 ? 'Ja' : 'Nein'}`,
                `**Guild:** ${emojiObj.guild?.name || 'Unbekannt'} (${emojiObj.guild?.id || 'Unbekannt'})`
            );
        } else {
            info.push('*Das Emoji ist auf diesem Server nicht verfügbar oder kein Guild-Emoji.*');
        }

        await interaction.reply({
            content: info.join('\n'),
            flags: 64
        });
    }
}).toJSON();