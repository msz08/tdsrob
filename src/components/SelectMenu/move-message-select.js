const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: /^move-message-select-.+$/, // Regex für dynamische CustomId
    type: 'select',
    /**
     * @param {DiscordBot} client
     * @param {import("discord.js").AnySelectMenuInteraction} interaction
     */
    run: async (client, interaction) => {
        const selectedChannelId = interaction.values[0];
        // Hole die Message-ID aus der CustomId
        const messageId = interaction.customId.split('-').pop();

        // Versuche die Originalnachricht zu finden
        const channel = interaction.channel;
        let targetMessage;
        try {
            targetMessage = await channel.messages.fetch(messageId);
        } catch {
            await interaction.reply({ content: 'Nachricht konnte nicht gefunden werden.', flags: 64 });
            return;
        }

        // Hole den Zielkanal
        const destinationChannel = interaction.guild.channels.cache.get(selectedChannelId);
        if (!destinationChannel || destinationChannel.type !== 0) { // 0 = GuildText
            await interaction.reply({ content: 'Zielkanal ungültig.', flags: 64 });
            return;
        }


        // Sende die Nachricht im Zielkanal als Webhook mit Avatar und Name des Originalautors
        let webhook = (await destinationChannel.fetchWebhooks()).find(w => w.name === 'MoveMessageBot');
        if (!webhook) {
            webhook = await destinationChannel.createWebhook({
                name: 'MoveMessageBot',
                avatar: targetMessage.author.displayAvatarURL()
            });
        }

        await webhook.send({
            content: targetMessage.content,
            username: targetMessage.author.username,
            avatarURL: targetMessage.author.displayAvatarURL(),
            embeds: targetMessage.embeds,
            files: targetMessage.attachments.map(a => a)
        });

        // Lösche die Originalnachricht
        await targetMessage.delete();

        await interaction.reply({
            content: `Nachricht wurde nach <#${selectedChannelId}> verschoben!`,
            flags: 64
        });
    }
}).toJSON();
