const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const config = require("../../config");

module.exports = new ApplicationCommand({
    command: {
        name: 'dev',
        description: 'Developer-Befehle: eval, reload, restart',
        type: 1,
        options: [] // Keine Subcommands
    },
    options: {
        botDevelopers: true
    },
    run: async (client, interaction) => {
        // Buttons für Aktionen
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('dev-eval')
                .setLabel('Eval')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('dev-reload')
                .setLabel('Reload')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('dev-restart')
                .setLabel('Restart')
                .setStyle(ButtonStyle.Danger)
        );
        await interaction.reply({
            content: 'Wähle eine Entwickler-Aktion:',
            components: [row],
            flags: 64
        });
    }
}).toJSON();