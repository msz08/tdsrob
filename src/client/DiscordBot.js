const { Client, Collection, Partials } = require("discord.js");
const CommandsHandler = require("./handler/CommandsHandler");
const { warn, error, info, success } = require("../utils/Console");
const config = require("../config");
const CommandsListener = require("./handler/CommandsListener");
const ComponentsHandler = require("./handler/ComponentsHandler");
const ComponentsListener = require("./handler/ComponentsListener");
const EventsHandler = require("./handler/EventsHandler");
const { QuickYAML } = require('quick-yaml.db');

class DiscordBot extends Client {
    collection = {
        application_commands: new Collection(),
        message_commands: new Collection(),
        message_commands_aliases: new Collection(),
        components: {
            buttons: new Collection(),
            selects: new Collection(),
            modals: new Collection(),
            autocomplete: new Collection()
        }
    }
   rest_application_commands_array = [];
   login_attempts = 0;
   login_timestamp = 0;
   statusMessages = [
      { name: 'Verloren', type: 4 },
      { name: 'Verwirrt', type: 4 },
      { name: 'Einsam', type: 4 },
      { name: 'Hungrig', type: 4 },
      { name: 'Bekloppt', type: 4 },
      { name: 'The Dark Shadowhunters', type: 4 }
    ];

    commands_handler = new CommandsHandler(this);
    components_handler = new ComponentsHandler(this);
    events_handler = new EventsHandler(this);
    database = new QuickYAML(config.database.path);

    constructor() {
        super({
            intents: 3276799,
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User
            ],
            presence: {
                activities: [{
                    name: 'keep this empty',
                    type: 4,
                    state: '...Startet'
                }]
            }
        });
        
        new CommandsListener(this);
        new ComponentsListener(this);
    }

    startStatusRotation = () => {
        let index = 0;
        setInterval(() => {
            this.user.setPresence({ activities: [this.statusMessages[index]] });
            index = (index + 1) % this.statusMessages.length;
        }, 6000);
    }

    connect = async () => {
        warn(`Attempting to connect to the Discord bot... (${this.login_attempts + 1})`);

        this.login_timestamp = Date.now();

        try {
            await this.login(process.env.CLIENT_TOKEN);
            this.commands_handler.load();
            this.components_handler.load();
            this.events_handler.load();
            this.startStatusRotation();

            // Registrierung steuern
            if (config.development.enabled) {
                warn('Registering guild (development) commands...');
                await this.commands_handler.registerApplicationCommands(config.development);
                success('Successfully registered guild (development) commands.');
            } else if (process.env.GLOBAL_COMMANDS_REGISTER === 'true') {
                warn('Registering global commands...');
                await this.commands_handler.registerApplicationCommands({ enabled: false });
                success('Successfully registered global commands.');
            } else {
                info('Skipping global command registration (set GLOBAL_COMMANDS_REGISTER=true to register globally).');
            }

            // Registrierte Commands ausgeben
            const { info } = require('../utils/Console');
            const commandsList = this.rest_application_commands_array.map(cmd => `- ${cmd.name}: ${cmd.description || ''}`).join('\n');
            info('Registrierte Commands:\n' + commandsList);
        } catch (err) {
            error('Failed to connect to the Discord bot, retrying...');
            error(err);
            this.login_attempts++;
            setTimeout(this.connect, 5000);
        }
    }
}

module.exports = DiscordBot;