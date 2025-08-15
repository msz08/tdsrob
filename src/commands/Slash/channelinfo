const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
    MessageFlags,
    time
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'channelinfo',
        description: 'Zeigt alle wichtigen Informationen über einen Channel, inkl. Rollen- und Mitglieder-Berechtigungen',
        type: 1,
        options: [
            {
                name: 'channel',
                description: 'Der Channel, dessen Infos angezeigt werden sollen',
                type: 7, // CHANNEL type
                required: true
            }
        ]
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const channel = interaction.options.getChannel('channel');
        if (!channel) {
            await interaction.reply({ content: 'Channel nicht gefunden!', flags: 64 });
            return;
        }

        // Channel-Typ Map
        const channelTypeMap = {
            0: "Text",
            2: "Voice",
            4: "Kategorie",
            5: "Announcement",
            13: "Stage",
            15: "Forum",
            14: "Media",
            11: "Thread"
        };

        // Grundinfos
        let basicFields = [
            { name: 'Name', value: channel.name, inline: true },
            { name: 'Typ', value: channelTypeMap[channel.type] || channel.type, inline: true },
            { name: 'ID', value: channel.id, inline: true },
            { name: 'Kategorie', value: channel.parent ? channel.parent.name : 'Keine', inline: true },
            { name: 'NSFW', value: channel.nsfw ? 'Ja' : 'Nein', inline: true },
            { name: 'Erstellt am', value: time(channel.createdAt, 'F'), inline: true },
            { name: 'Position', value: channel.position !== undefined ? channel.position.toString() : 'N/A', inline: true },
            { name: 'Channel-Link', value: `<#${channel.id}>`, inline: true }
        ];

        if ('topic' in channel && channel.topic)
            basicFields.push({ name: 'Beschreibung', value: channel.topic, inline: false });
        if ('bitrate' in channel)
            basicFields.push({ name: 'Bitrate', value: `${channel.bitrate / 1000}kbps`, inline: true });
        if ('userLimit' in channel)
            basicFields.push({ name: 'User-Limit', value: channel.userLimit ? channel.userLimit.toString() : 'Kein Limit', inline: true });
        if ('rateLimitPerUser' in channel && channel.rateLimitPerUser)
            basicFields.push({ name: 'Slowmode', value: `${channel.rateLimitPerUser}s`, inline: true });

        // Letzte Nachricht
        let lastMsgField = '';
        if ('lastMessage' in channel && channel.lastMessage) {
            lastMsgField =
                `Von: ${channel.lastMessage.author ? channel.lastMessage.author.tag : 'Unbekannt'}\n` +
                `Am: ${time(channel.lastMessage.createdAt, 'F')}\n` +
                `Inhalt: ${channel.lastMessage.content ? channel.lastMessage.content.substring(0, 100) : 'Keine Nachricht'}`;
        }

        // Angepinnte Nachrichten
        let pinnedCount = '';
        if (channel.type === 0 || channel.type === 5 || channel.type === 15) {
            // Text, Announcement, Forum
            try {
                const pinned = await channel.messages.fetchPinned();
                pinnedCount = pinned.size.toString();
            } catch {
                pinnedCount = "Unbekannt";
            }
        }

        // Webhooks
        let webhookCount = '';
        try {
            const webhooks = await channel.fetchWebhooks();
            webhookCount = webhooks.size.toString();
        } catch {
            webhookCount = "Unbekannt";
        }

        // Threads
        let threadCount = '';
        if (channel.threads && channel.threads.cache) {
            threadCount = channel.threads.cache.size.toString();
        } else if (channel.type === 15) { // Forum
            try {
                const threads = await channel.threads.fetchActive();
                threadCount = threads.threads.size.toString();
            } catch {
                threadCount = "Unbekannt";
            }
        }

        // Voice Channel Members
        let memberInfo = '';
        if (channel.type === 2 && channel.members.size > 0) {
            memberInfo = Array.from(channel.members.values()).map(m => `${m.user.tag}`).join(', ');
        }

        // Permission Overwrites für Rollen und Mitglieder
        let overwriteInfo = [];
        if (channel.permissionOverwrites) {
            for (const overwrite of channel.permissionOverwrites.cache.values()) {
                // Rollen oder Member
                let target;
                if (overwrite.type === 0) { // role
                    target = interaction.guild.roles.cache.get(overwrite.id);
                    if (!target) continue;
                } else if (overwrite.type === 1) { // member
                    target = interaction.guild.members.cache.get(overwrite.id);
                    if (!target) continue;
                }
                const allowed = Object.keys(PermissionFlagsBits).filter(p => overwrite.allow.has(PermissionFlagsBits[p]));
                const denied = Object.keys(PermissionFlagsBits).filter(p => overwrite.deny.has(PermissionFlagsBits[p]));
                overwriteInfo.push(
                    `**${overwrite.type === 0 ? "Rolle" : "Mitglied"}: ${target.name || target.user.tag}**\n` +
                    `Erlaubt: ${allowed.join(', ') || 'Keine'}\n` +
                    `Verweigert: ${denied.join(', ') || 'Keine'}`
                );
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`Channel-Info: #${channel.name}`)
            .setColor(0x5865F2)
            .addFields(basicFields)
            .setFooter({ text: `Channel-ID: ${channel.id}` })
            .setTimestamp();

        if (lastMsgField)
            embed.addFields({ name: 'Letzte Nachricht', value: lastMsgField, inline: false });
        if (pinnedCount)
            embed.addFields({ name: 'Angepinnte Nachrichten', value: pinnedCount, inline: true });
        if (webhookCount)
            embed.addFields({ name: 'Webhooks', value: webhookCount, inline: true });
        if (threadCount)
            embed.addFields({ name: 'Threads', value: threadCount, inline: true });
        if (memberInfo)
            embed.addFields({ name: 'Mitglieder im Voice-Channel', value: memberInfo, inline: false });
        if (overwriteInfo.length)
            embed.addFields({ name: 'Spezifische Berechtigungen', value: overwriteInfo.join('\n\n'), inline: false });

        await interaction.reply({ embeds: [embed], flags: 64 });
    }
}).toJSON();
