const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");

module.exports = new Component({
    customId: 'triggerword-status-menu',
    type: 'select',
    /**
     * @param {DiscordBot} client
     * @param {import('discord.js').AnySelectMenuInteraction} interaction
     */
    run: async (client, interaction) => {
        const value = interaction.values[0];
        let statusText = '';
        let color = 0x3498DB;
        switch (value) {
            case 'already_on_server':
                statusText = '☑️ Ist bereits auf dem Server.';
                color = 0x2ecc71;
                break;
            case 'contacted':
                statusText = '✉️ Angeschrieben.';
                color = 0x2980b9;
                break;
            case 'conversation_done':
                statusText = '🗣️ Gespräch geführt.';
                color = 0xf1c40f;
                break;
            case 'joined':
                statusText = '🎉 Beigetreten.';
                color = 0x9b59b6;
                break;
            case 'uninterested':
                statusText = '🚫 Uninteressant.';
                color = 0xe74c3c;
                break;
            case 'done':
                statusText = '✅ Erledigt.';
                color = 0x34495e;
                break;
            case 'reset_status':
                statusText = `🔄 Status zurückgesetzt. Wähle eine Option aus dem Menü.`;
                color = 0x3498DB;
                break;
            default:
                statusText = 'Status ausgewählt.';
        }
        // Ursprüngliche Nachricht aktualisieren, SelectMenu bleibt bestehen
        const member = interaction.guild?.members?.cache?.get(interaction.user.id);
        const nickname = member?.nickname || interaction.user.username;
        const now = new Date();
        const dateString = now.toLocaleString('de-DE');
        // Dynamische Option-Descriptions
        const options = interaction.message.components[0].components[0].options.map(opt => {
            if (opt.value === value && value !== 'reset_status') {
                return { ...opt, description: `${nickname} am ${dateString}` };
            }
            if (value === 'reset_status') {
                // Originalbeschreibungen wiederherstellen
                switch (opt.value) {
                    case 'already_on_server': return { ...opt, description: 'Die Person ist bereits auf dem Server.' };
                    case 'contacted': return { ...opt, description: 'Die Person wurde angeschrieben.' };
                    case 'conversation_done': return { ...opt, description: 'Es wurde ein Gespräch geführt.' };
                    case 'joined': return { ...opt, description: 'Die Person ist beigetreten.' };
                    case 'uninterested': return { ...opt, description: 'Die Person ist uninteressant.' };
                    case 'done': return { ...opt, description: 'Die Aufgabe ist erledigt.' };
                    case 'reset_status': return { ...opt, description: 'Setzt den Status zurück.' };
                    default: return opt;
                }
            }
            return opt;
        });
        const origMenu = interaction.message.components[0].components[0];
        const newSelectMenu = {
            ...origMenu,
            type: 3, // StringSelectMenu
            options,
            custom_id: origMenu.custom_id || origMenu.customId // Discord erwartet snake_case
        };
        const newRow = {
            ...interaction.message.components[0],
            type: 1, // ActionRow
            components: [newSelectMenu]
        };
        await interaction.update({
            embeds: [ {
                title: 'Status aktualisiert',
                description: statusText,
                color: color,
                footer: {
                    text: `${nickname} am ${dateString}`
                }
            } ],
            components: [newRow]
        });
    }
}).toJSON();
