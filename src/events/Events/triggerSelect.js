require('dotenv').config();
const Event = require("../../structure/Event");
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

const CHANNEL_ID = process.env.EVENT_TRIGGERWORDSELECTMENU_CHANNEL_ID; // Channel-ID aus .env
const TRIGGER_WORD = process.env.EVENT_TRIGGERWORDSELECTMENU_TRIGGER; // Trigger-Wort aus .env

module.exports = new Event({
    event: 'messageCreate',
    async run(client, message) {
        if (!message || !message.channel) return;
        if (message.channel.id !== CHANNEL_ID) return;
        if (!message.content?.toLowerCase().includes(TRIGGER_WORD?.toLowerCase())) return;

        const embed = new EmbedBuilder()
            .setTitle('Status')
            .setDescription(`Status des Bewerbers.`)
            .setColor(0x3498DB);

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('triggerword-status-menu')
                .setPlaceholder('Status auswählen...')
                .addOptions([
                    {
                        label: 'Ist bereits auf dem Server',
                        value: 'already_on_server',
                        description: 'Die Person ist bereits auf dem Server.',
                        emoji: '☑️',
                    },
                    {
                        label: 'Angeschrieben',
                        value: 'contacted',
                        description: 'Die Person wurde angeschrieben.',
                        emoji: '✉️',
                    },
                    {
                        label: 'Gespräch geführt',
                        value: 'conversation_done',
                        description: 'Es wurde ein Gespräch geführt.',
                        emoji: '🗣️',
                    },
                    {
                        label: 'Beigetreten',
                        value: 'joined',
                        description: 'Die Person ist beigetreten.',
                        emoji: '🎉',
                    },
                    {
                        label: 'Uninteressant',
                        value: 'uninterested',
                        description: 'Die Person ist uninteressant.',
                        emoji: '🚫',
                    },
                    {
                        label: 'Erledigt',
                        value: 'done',
                        description: 'Die Aufgabe ist erledigt.',
                        emoji: '✅',
                    },
                    {
                        label: 'Status zurücksetzen',
                        value: 'reset_status',
                        description: 'Setzt den Status zurück.',
                        emoji: '🔄',
                    },
                ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
}).toJSON();

