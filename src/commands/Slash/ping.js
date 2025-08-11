const { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'ping',
        description: 'WebSocket-Latenz (Ping) und Roundtrip messen',
        type: 1,
        options: []
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
        await interaction.reply({
            content: 'Pinging...',
            flags: MessageFlags.Ephemeral // macht die Nachricht nur für dich sichtbar
        });
        const sent = await interaction.fetchReply();
        const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setColor(0x5865F2)
            .addFields(
                { name: 'WebSocket-Latenz', value: `${client.ws.ping}ms`, inline: true },
                { name: 'Roundtrip', value: `${roundtrip}ms`, inline: true }
            );

        await interaction.editReply({ content: null, embeds: [embed] });
    }
}).toJSON();
