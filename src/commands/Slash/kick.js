const { ApplicationCommandOptionType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const ApplicationCommand = require('../../structure/ApplicationCommand');

module.exports = new ApplicationCommand({
    command: {
        name: 'kick',
        description: 'Kicke einen Benutzer und sende ihm eine DM mit dem Grund.',
        type: 1,
        default_member_permissions: PermissionFlagsBits.KickMembers.toString(),
        options: [
            {
                name: 'user',
                description: 'Der zu kickende Benutzer',
                type: ApplicationCommandOptionType.User,
                required: true
            }
            // Kein reason-Feld mehr!
        ]
    },
    run: async (client, interaction) => {
        const user = interaction.options.getUser('user', true);
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            await interaction.reply({ content: 'Benutzer ist nicht auf dem Server.', flags: 64 });
            return;
        }

        // Modal für Grund anzeigen, mit Default-Wert
        const modal = new ModalBuilder()
            .setCustomId(`kickUserModal_${user.id}`)
            .setTitle('Kick Reason')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('kick_reason')
                        .setLabel('Grund für den Kick')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('z.B. Regelverstoß...')
                        .setRequired(true)
                        .setValue('Kein Grund angegeben') // Default-Wert!
                )
            );

        await interaction.showModal(modal);

        // Modal-Submit-Handler
        const filter = i => i.customId === `kickUserModal_${user.id}` && i.user.id === interaction.user.id;
        interaction.awaitModalSubmit({ filter, time: 60_000 })
            .then(async (modalInteraction) => {
                const reason = modalInteraction.fields.getTextInputValue('kick_reason');

                // DM schicken
                try {
                    await user.send(
                        `Du wurdest von **${interaction.guild.name}** gekickt.\nGrund: ${reason}`
                    );
                } catch (e) {
                    // DM fehlgeschlagen
                }

                await member.kick(reason);

                await modalInteraction.reply({
                    content: `**${user.tag}** wurde gekickt. Grund: ${reason}`,
                    flags: 64
                });
            })
            .catch(async () => {
                await interaction.followUp({
                    content: 'Kick abgebrochen: Es wurde kein Grund angegeben.',
                    flags: 64
                });
            });
    }
}).toJSON();
