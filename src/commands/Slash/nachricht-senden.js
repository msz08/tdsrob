const { ApplicationCommandOptionType } = require('discord.js');
const ApplicationCommand = require('../../structure/ApplicationCommand');

module.exports = new ApplicationCommand({
    command: {
        name: 'nachricht-senden',
        description: 'Sende eine Nachricht als Bot in einen bestimmten Channel.',
        type: 1,
        options: [
            {
                name: 'channel',
                description: 'Der Ziel-Channel',
                type: ApplicationCommandOptionType.Channel,
                required: true
            },
            {
                name: 'text',
                description: 'Die Nachricht, die gesendet werden soll',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed',
                description: 'Optionales Embed als JSON',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_title',
                description: 'Embed-Titel',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_description',
                description: 'Embed-Beschreibung',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_color',
                description: 'Embed-Farbe (Hex, z.B. #ff0000)',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_url',
                description: 'Embed-URL',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_timestamp',
                description: 'Embed-Timestamp (ISO)',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_footer',
                description: 'Embed-Footer-Text',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_image',
                description: 'Embed-Image-URL',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_thumbnail',
                description: 'Embed-Thumbnail-URL',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_author',
                description: 'Embed-Author-Name',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_author_icon',
                description: 'Embed-Author-Icon-URL',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'embed_fields',
                description: 'Embed-Felder als JSON-Array',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'webhook_name',
                description: 'Name des Absenders (Webhook)',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'webhook_avatar',
                description: 'Avatar-URL des Absenders (Webhook)',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'webhook',
                description: 'Nachricht als Webhook senden?',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
    },
    run: async (client, interaction) => {
        const channel = interaction.options.getChannel('channel', true);
        const text = interaction.options.getString('text', false);

        if (!channel.isTextBased()) {
            await interaction.reply({
                content: 'Bitte wähle einen Textkanal aus!',
                flags: 64
            });
            return;
        }

        if (!text && !embedJson && !embedTitle && !embedDescription && !embedColor && !embedUrl && !embedTimestamp && !embedFooter && !embedImage && !embedThumbnail && !embedAuthor && !embedAuthorIcon && !embedFields) {
            await interaction.reply({
                content: 'Du musst mindestens Text oder ein Embed angeben!',
                flags: 64
            });
            return;
        }

        const embedJson = interaction.options.getString('embed', false);
        const embedTitle = interaction.options.getString('embed_title', false);
        const embedDescription = interaction.options.getString('embed_description', false);
        const embedColor = interaction.options.getString('embed_color', false);
        const embedUrl = interaction.options.getString('embed_url', false);
        const embedTimestamp = interaction.options.getString('embed_timestamp', false);
        const embedFooter = interaction.options.getString('embed_footer', false);
        const embedImage = interaction.options.getString('embed_image', false);
        const embedThumbnail = interaction.options.getString('embed_thumbnail', false);
        const embedAuthor = interaction.options.getString('embed_author', false);
        const embedAuthorIcon = interaction.options.getString('embed_author_icon', false);
        const embedFields = interaction.options.getString('embed_fields', false);

        const webhookName = interaction.options.getString('webhook_name', false) || process.env.WEBHOOK_NAME;
        const webhookAvatar = interaction.options.getString('webhook_avatar', false) || process.env.WEBHOOK_AVATAR;
        const webhookForce = interaction.options.getBoolean('webhook', false);

        let messagePayload = {};
        let embedObj = null;
        if (embedJson) {
            try {
                embedObj = JSON.parse(embedJson);
            } catch {
                await interaction.reply({ content: 'Ungültiges Embed-JSON!', flags: 64 });
                return;
            }
        } else if (
            embedTitle || embedDescription || embedColor || embedUrl || embedTimestamp || embedFooter || embedImage || embedThumbnail || embedAuthor || embedAuthorIcon || embedFields
        ) {
            embedObj = {};
            if (embedTitle) embedObj.title = embedTitle;
            if (embedDescription) embedObj.description = embedDescription;
            if (embedColor) embedObj.color = embedColor.startsWith('#') ? parseInt(embedColor.slice(1), 16) : embedColor;
            if (embedUrl) embedObj.url = embedUrl;
            if (embedTimestamp) embedObj.timestamp = embedTimestamp;
            if (embedFooter) embedObj.footer = { text: embedFooter };
            if (embedImage) embedObj.image = { url: embedImage };
            if (embedThumbnail) embedObj.thumbnail = { url: embedThumbnail };
            if (embedAuthor) embedObj.author = { name: embedAuthor };
            if (embedAuthorIcon) {
                embedObj.author = embedObj.author || {};
                embedObj.author.icon_url = embedAuthorIcon;
            }
            if (embedFields) {
                try {
                    embedObj.fields = JSON.parse(embedFields);
                } catch {
                    await interaction.reply({ content: 'Ungültiges Embed-Felder-JSON!', flags: 64 });
                    return;
                }
            }
        }

        if (embedObj && text) {
            messagePayload = { content: text, embeds: [embedObj] };
        } else if (embedObj) {
            messagePayload = { embeds: [embedObj] };
        } else {
            messagePayload = { content: text };
        }

        const useWebhook = webhookForce; // Only use webhook if explicitly true
        if (useWebhook) {
            // Sende per Webhook
            let webhook = (await channel.fetchWebhooks()).find(w => w.name === 'nachricht-senden');
            if (!webhook) {
                webhook = await channel.createWebhook({
                    name: 'nachricht-senden',
                    avatar: webhookAvatar
                });
            }
            await webhook.send({
                content: messagePayload.content,
                username: webhookName,
                avatarURL: webhookAvatar,
                embeds: messagePayload.embeds
            });
            await interaction.reply({
                content: `Nachricht${embedObj ? ' und Embed' : ''} wurde per Webhook in <#${channel.id}> gesendet.`,
                flags: 64
            });
        } else {
            await channel.send(messagePayload);
            await interaction.reply({
                content: `Nachricht${embedObj ? ' und Embed' : ''} wurde in <#${channel.id}> gesendet.`,
                flags: 64
            });
        }
    }
}).toJSON();