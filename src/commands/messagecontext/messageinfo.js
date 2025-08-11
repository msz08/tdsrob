const { MessageContextMenuCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'Message Information',
        type: 3,
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {MessageContextMenuCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const target = interaction.targetMessage;

        if (!target) {
            await interaction.reply({
                content: `Invalid target!`,
                flags: 64
            });
            return;
        }

        const array = [
            `**Author:** ${target.author.tag} (${target.author.id})`,
            `**Channel:** ${target.channel.name} (${target.channel.id})`,
            `**Message ID:** ${target.id}`,
            `**Content:** ${target.content || '*(leer)*'}`,
            `**Created at:** <t:${Math.floor(target.createdTimestamp / 1000)}:F>`,
            `**Edited?** ${target.editedTimestamp ? 'Yes' : 'No'}`,
            target.editedTimestamp ? `**Edited at:** <t:${Math.floor(target.editedTimestamp / 1000)}:F>` : null,
            `**Has attachments?** ${target.attachments.size > 0 ? 'Yes' : 'No'}`,
            target.attachments.size > 0 ? `**Attachments:**\n${[...target.attachments.values()].map(a => a.url).join('\n')}` : null,
            `**Has embeds?** ${target.embeds.length > 0 ? 'Yes' : 'No'}`,
            target.embeds.length > 0 ? `**Embeds:**\n${target.embeds.map((e, i) => `Embed ${i + 1}: ${e.title || '(kein Titel)'}`).join('\n')}` : null,
            `**Pinned?** ${target.pinned ? 'Yes' : 'No'}`,
            `**TTS?** ${target.tts ? 'Yes' : 'No'}`,
            `**Type:** ${target.type}`,
            `**Reply?** ${target.reference ? 'Yes' : 'No'}`,
            target.reference ? `**Reply to Message ID:** ${target.reference.messageId}` : null,
            `**Mentions:** ${target.mentions.users.map(u => u.tag).join(', ') || 'None'}`,
            `**Flags:** ${target.flags?.toArray?.().join(', ') || 'None'}`,
            `**Webhook?** ${target.webhookId ? 'Yes' : 'No'}`,
            `**Group Thread?** ${target.hasThread ? 'Yes' : 'No'}`,
        ].filter(Boolean);

        await interaction.reply({
            content: array.join('\n'),
            flags: 64
        });
    }
}).toJSON();