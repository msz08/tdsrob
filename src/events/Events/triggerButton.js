require('dotenv').config();
const Event = require("../../structure/Event");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const CHANNEL_ID = process.env.EVENT_TRIGGERWORDBUTTON_CHANNEL_ID; // Channel-ID aus .env
const TRIGGER_WORD = process.env.EVENT_TRIGGERWORDBUTTON_TRIGGER; // Trigger-Wort aus .env

module.exports = new Event({
    event: 'messageCreate',
    async run(client, message) {
        if (!message || !message.channel) return;
        if (message.channel.id !== CHANNEL_ID) return;
        if (!message.content?.toLowerCase().includes(TRIGGER_WORD?.toLowerCase())) return;

        const embed = new EmbedBuilder()
            .setTitle('Button erkannt!')
            .setDescription(`Du hast "${TRIGGER_WORD}" geschrieben. Wähle eine der folgenden Optionen:`)
            .setColor(0x3498DB)
            .addFields(
                { name: 'Option 1', value: 'Klicke den Button, um Option 1 auszuwählen.', inline: false },
                { name: 'Option 2', value: 'Klicke den Button, um Option 2 auszuwählen.', inline: false }
            );

        // Buttons
        const button1 = new ButtonBuilder()
            .setCustomId('button_option1')
            .setLabel('Option 1')
            .setStyle(ButtonStyle.Primary);

        const button2 = new ButtonBuilder()
            .setCustomId('button_option2')
            .setLabel('Option 2')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button1, button2);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
}).toJSON();

