const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
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
            },
            {
                name: 'reason',
                description: 'Grund für den Kick',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    run: async (client, interaction) => {
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            await interaction.reply({ content: 'Benutzer ist nicht auf dem Server.', flags: 64 });
            return;
        }
        try {
            await user.send(`Du wurdest von **${interaction.guild.name}** gekickt. Grund: ${reason}`);
        } catch {
            // DM konnte nicht gesendet werden
        }
        await member.kick(reason);
        await interaction.reply({ content: `**${user.tag}** wurde gekickt. Grund: ${reason}`, flags: 64 });
    }
}).toJSON();
