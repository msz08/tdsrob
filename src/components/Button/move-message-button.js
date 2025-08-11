const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: /^move-message-modal-.+$/, // Regex für dynamische CustomId
    type: 'button',
    /**
     * @param {DiscordBot} client
     * @param {ButtonInteraction} interaction
     */
    run: async (client, interaction) => {
        // Modal erstellen
        const modal = new ModalBuilder()
            .setCustomId(interaction.customId)
            .setTitle('Kanal-ID eingeben')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('move-message-modal-channel')
                        .setLabel('Kanal-ID')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
            );
        await interaction.showModal(modal);
    }
}).toJSON();
