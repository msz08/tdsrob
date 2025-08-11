const { UserContextMenuCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'User Information',
        type: 2,
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {UserContextMenuCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const target = interaction.targetMember;

        if (!target) {
            await interaction.reply({
                content: `Invalid target!`,
                flags: 64
            });
            return;
        }

        // User neu fetchen für Banner und Flags
        const user = await client.users.fetch(target.id, { force: true });
        const member = target;

        // Flags/Badges
        const flags = user.flags ? user.flags.toArray().join(', ') : 'None';
        const publicFlags = user.publicFlags ? user.publicFlags.toArray().join(', ') : 'None';
        // Bannerfarbe
        const bannerColor = user.bannerColor ? user.bannerColor : 'None';
        // Status
        const status = member.presence?.status || 'Unknown';
        // Aktivitäten
        const activities = member.presence?.activities?.map(a => a.name).join(', ') || 'None';
        // Avatar-Link
        const avatarLink = user.displayAvatarURL({ dynamic: true, size: 4096 });
        // Erwähnung
        const mention = `<@${user.id}>`;
        // Boost-Tier
        const boostTier = member.guild.premiumTier || 'None';
        // Letzte Nachricht
        const lastMessage = member.lastMessage?.content || 'None';
        // Voice-Channel
        const voiceChannel = member.voice?.channel?.name || 'None';
        // Server-Avatar
        const serverAvatar = member.avatarURL() || 'None';
        // Nitro (über Badge erkennbar)
        const hasNitro = flags.includes('Premium') ? 'Yes' : 'No';
        // Locale (nur für eigenen Bot)
        const locale = user.locale || 'Unknown';

        const array = [
            `**Username:** ${user.username}`,
            `**Discriminator:** #${user.discriminator}`,
            `**ID:** ${user.id}`,
            `**Displayname:** ${member.displayName || user.username}`,
            `**Bot?** ${user.bot ? 'Yes' : 'No'}`,
            `**Guild Owner?** ${member.id == member.guild.ownerId ? 'Yes' : 'No'}`,
            `**Created at:** <t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
            `**Joined at:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
            `**Avatar:** ${avatarLink}`,
            `**Banner:** ${user.banner ? user.bannerURL({ dynamic: true, size: 4096 }) : 'None'}`,
            `**Banner Color:** ${bannerColor}`,
            `**Accent Color:** ${user.accentColor ? '#' + user.accentColor.toString(16) : 'None'}`,
            `**Roles:** ${member.roles.cache.map(r => r.name).join(', ')}`,
            `**Highest Role:** ${member.roles.highest.name}`,
            `**Nickname:** ${member.nickname || 'None'}`,
            `**Pending:** ${member.pending ? 'Yes' : 'No'}`,
            `**Timed Out:** ${member.isCommunicationDisabled() ? 'Yes' : 'No'}`,
            `**Boosting:** ${member.premiumSince ? `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>` : 'No'}`,
            `**Boost Tier:** ${boostTier}`,
            `**Flags/Badges:** ${flags}`,
            `**Public Flags:** ${publicFlags}`,
            `**Status:** ${status}`,
            `**Activities:** ${activities}`,
            `**Mention:** ${mention}`,
            `**Last Message:** ${lastMessage}`,
            `**Voice Channel:** ${voiceChannel}`,
            `**Server Avatar:** ${serverAvatar}`,
            `**Nitro:** ${hasNitro}`,
            `**Locale:** ${locale}`,
        ];

        await interaction.reply({
            content: array.join('\n'),
            flags: 64
        });
    }
}).toJSON();