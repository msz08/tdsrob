require('dotenv').config();

const config = {
    database: {
        path: './database.yml' // The database path.
    },
    development: {
        enabled: process.env.DEVELOPMENT_ENABLED || false,
        guildId: process.env.DEVELOPMENT_GUILD_ID || ''
    },
    commands: {
        prefix: process.env.COMMANDS_PREFIX || '?',
        message_commands: process.env.COMMANDS_MESSAGE_COMMANDS || 'true',
        application_commands: {
            chat_input: process.env.COMMANDS_APPLICATION_CHAT_INPUT || 'true',
            user_context: process.env.COMMANDS_APPLICATION_USER_CONTEXT || 'true',
            message_context: process.env.COMMANDS_APPLICATION_MESSAGE_CONTEXT || 'true'
        }
    },
    users: {
        ownerId: process.env.OWNER_ID || '',
        developers: process.env.DEVELOPERS ? process.env.DEVELOPERS.split(',') : []
    },
    messages: { // Messages configuration for application commands and message commands handler.
        NOT_BOT_OWNER: process.env.MSG_NOT_BOT_OWNER || 'You do not have the permission to run this command because you\'re not the owner of me!',
        NOT_BOT_DEVELOPER: process.env.MSG_NOT_BOT_DEVELOPER || 'You do not have the permission to run this command because you\'re not a developer of me!',
        NOT_GUILD_OWNER: process.env.MSG_NOT_GUILD_OWNER || 'You do not have the permission to run this command because you\'re not the guild owner!',
        CHANNEL_NOT_NSFW: process.env.MSG_CHANNEL_NOT_NSFW || 'You cannot run this command in a non-NSFW channel!',
        MISSING_PERMISSIONS: process.env.MSG_MISSING_PERMISSIONS || 'You do not have the permission to run this command, missing permissions.',
        COMPONENT_NOT_PUBLIC: process.env.MSG_COMPONENT_NOT_PUBLIC || 'You are not the author of this button!',
        GUILD_COOLDOWN: process.env.MSG_GUILD_COOLDOWN || 'You are currently in cooldown, you have the ability to re-use this command again in `%cooldown%s`.'
    }
}

module.exports = config;