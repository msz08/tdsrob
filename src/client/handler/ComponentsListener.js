const DiscordBot = require("../DiscordBot");
const config = require("../../config");
const { error } = require("../../utils/Console");

class ComponentsListener {
    /**
     * 
     * @param {DiscordBot} client 
     */
    constructor(client) {
        client.on('interactionCreate', async (interaction) => {
            const checkUserPermissions = async (component) => {
                if (component.options?.public === false && interaction.user.id !== interaction.message.interaction.user.id) {
                    await interaction.reply({
                        content: config.messages.COMPONENT_NOT_PUBLIC,
                        flags: 64 // statt ephemeral: true
                    });

                    return false;
                }

                return true;
            }

            try {
                if (interaction.isButton()) {
                    const components = Array.from(client.collection.components.buttons.values());
                    const component = components.find(c => typeof c.customId === 'string' ? c.customId === interaction.customId : c.customId instanceof RegExp ? c.customId.test(interaction.customId) : false);
                    if (!component) return;
                    if (!(await checkUserPermissions(component))) return;
                    try {
                        component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }
                    return;
                }

                if (interaction.isAnySelectMenu()) {
                    const components = Array.from(client.collection.components.selects.values());
                    const component = components.find(c => typeof c.customId === 'string' ? c.customId === interaction.customId : c.customId instanceof RegExp ? c.customId.test(interaction.customId) : false);
                    if (!component) return;
                    if (!(await checkUserPermissions(component))) return;
                    try {
                        component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }
                    return;
                }

                if (interaction.isModalSubmit()) {
                    const components = Array.from(client.collection.components.modals.values());
                    const component = components.find(c => typeof c.customId === 'string' ? c.customId === interaction.customId : c.customId instanceof RegExp ? c.customId.test(interaction.customId) : false);
                    if (!component) return;
                    try {
                        component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }
                    return;
                }

                if (interaction.isAutocomplete()) {
                    const component = client.collection.components.autocomplete.get(interaction.commandName);

                    if (!component) return;

                    try {
                        component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }

                    return;
                }
            } catch (err) {
                error(err);
            }
        });
    }
}

module.exports = ComponentsListener;