const { ApplicationCommandType, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const ApplicationCommand = require('../../structure/ApplicationCommand');

module.exports = new ApplicationCommand({
    command: {
        name: 'Nachricht verschieben',
        type: ApplicationCommandType.Message
    },
    run: async (client, interaction) => {
        const targetMessage = interaction.targetMessage;

        // Select Menu für Textkanäle
        const textChannels = interaction.guild.channels.cache
            .filter(c => c.type === ChannelType.GuildText)
            .map(c => ({
                label: c.name,
                value: c.id
            }))
            .slice(0, 25);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`move-message-select-${targetMessage.id}`)
            .setPlaceholder('Wähle den Zielkanal aus')
            .addOptions(textChannels);

        // Button für Modal
        const button = new ButtonBuilder()
            .setCustomId(`move-message-modal-${targetMessage.id}`)
            .setLabel('Kanal per Modal eingeben')
            .setStyle(ButtonStyle.Primary);

        const row1 = new ActionRowBuilder().addComponents(selectMenu);
        const row2 = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: 'Wähle einen Kanal aus dem Select Menu **oder** klicke auf den Button, um einen Kanal per Modal einzugeben.',
            components: [row1, row2],
            flags: 64
        });
    }
}).toJSON();