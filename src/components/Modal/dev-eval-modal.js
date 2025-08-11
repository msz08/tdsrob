const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const Component = require('../../structure/Component');

module.exports = new Component({
    customId: 'dev-eval-modal',
    type: 'modal',
    run: async (client, interaction) => {
        // Code aus dem Modal-Feld holen
        const code = interaction.fields.getTextInputValue('dev-eval-code');
        await interaction.deferReply({ flags: 64 });
        try {
            let result = await eval(code);
            if (typeof result !== 'string') result = require('util').inspect(result);
            await interaction.editReply({ content: `\`\`\`js\n${result}\n\`\`\`` });
        } catch (err) {
            await interaction.editReply({ content: `Fehler:\n\`\`\`js\n${err}\n\`\`\`` });
        }
    }
}).toJSON();

// Hilfsfunktion zum Anzeigen des Modals
module.exports.showModal = async (interaction) => {
    const modal = new ModalBuilder()
        .setCustomId('dev-eval-modal')
        .setTitle('Eval ausführen')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('dev-eval-code')
                    .setLabel('JavaScript-Code')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            )
        );
    await interaction.showModal(modal);
};
