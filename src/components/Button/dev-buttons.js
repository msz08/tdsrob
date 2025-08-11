const Component = require('../../structure/Component');
const config = require('../../config');
const { showModal } = require('../Modal/dev-eval-modal');

module.exports = new Component({
    customId: /^dev-(eval|reload|restart)$/,
    type: 'button',
    run: async (client, interaction) => {
        if (interaction.customId === 'dev-eval') {
            // Modal anzeigen für JS-Code-Eingabe
            await showModal(interaction);
            return;
        }
        if (interaction.customId === 'dev-reload') {
            try {
                client.commands_handler.reload();
                await client.commands_handler.registerApplicationCommands(config.development);
                await interaction.reply({ content: 'Commands erfolgreich neu geladen.', flags: 64 });
            } catch (err) {
                await interaction.reply({ content: `Fehler beim Reload: ${err}`, flags: 64 });
            }
        }
        if (interaction.customId === 'dev-restart') {
            await interaction.reply({ content: 'Bot wird neu gestartet...', flags: 64 });
            setTimeout(() => {
                const cp = require('child_process').spawn(
                    process.argv[0],
                    process.argv.slice(1),
                    {
                        cwd: process.cwd(),
                        stdio: 'inherit',
                        detached: true
                    }
                );
                cp.unref();
                process.exit(0);
            }, 3000);
        }
    }
}).toJSON();
