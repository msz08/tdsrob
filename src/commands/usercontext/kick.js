const { UserContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'Kick User',
        type: 2, // User context menu
    },
    options: {
        cooldown: 5000
    },
    /**
     * @param {DiscordBot} client 
     * @param {UserContextMenuCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const target = interaction.targetMember;
        const moderator = interaction.member;

        if (!target) {
            await interaction.reply({
                content: `Invalid target!`,
                flags: 64
            });
            return;
        }

        if (!target.kickable) {
            await interaction.reply({
                content: `I cannot kick this user!`,
                flags: 64
            });
            return;
        }

        // Modal für den Grund anzeigen
        const modal = new ModalBuilder()
            .setCustomId('kickUserModal')
            .setTitle('Kick Reason')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('kick_reason')
                        .setLabel('Grund für den Kick')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('z.B. Regelverstoß...')
                        .setRequired(true)
                )
            );

        await interaction.showModal(modal);

        // Listener für Modal-Submit
        const filter = i => i.customId === 'kickUserModal' && i.user.id === interaction.user.id;
        interaction.awaitModalSubmit({ filter, time: 60_000 })
            .then(async (modalInteraction) => {
                const reason = modalInteraction.fields.getTextInputValue('kick_reason');

                // DM schicken
                try {
                    await target.user.send(
                        `Du wurdest von **${target.guild.name}** gekickt.\nModerator: ${moderator.displayName}\nGrund: ${reason}`
                    );
                } catch (e) {
                    // DM fehlgeschlagen
                }

                await target.kick(reason);

                await modalInteraction.reply({
                    content: `User **${target.user.tag}** wurde gekickt.\nGrund: ${reason}`,
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