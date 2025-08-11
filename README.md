# <samp>DiscordJS-V14-Bot-Template</samp> v3

## Features
- Supports all possible type of commands.
    - Message commands.
    - Application commands:
        - Chat Input
        - User context
        - Message context
- Handles components.
    - Buttons
    - Select menus
    - Modals
    - Autocomplete
- Simple Database included (YAML).


## Dependencies
- **colors** → latest
- **discord.js** → 14.13.0 or newer
- **dotenv** → latest
- **quick-yaml.db** → latest

## Setup
1. Install a code editor ([Visual Studio Code](https://code.visualstudio.com/Download) for an example).
2. Download this project as a **.zip** file: [Download](https://github.com/TFAGaming/DiscordJS-V14-Bot-Template/archive/refs/heads/main.zip)
3. Extract the **.zip** file into a normal folder.
4. Open your code editor, click on **Open Folder**, and select the new created folder.
5. Rename the following files:

- `.env.example` → `.env`: Used for secrets, like the Discord bot token.
- `example.database.yml` → `database.yml`: Used as a main file for the database.
- `example.terminal.log` → `terminal.log`: Used as a clone of terminal (to save previous terminal messages).

6. Fill all the required values in **.env**.


7. Initialize a new project: `npm init` (To skip every step, do `npm init -y`).
8. Install all [required dependencies](#dependencies): `npm install colors discord.js dotenv quick-yaml.db`

9. Run the command `node .` or `npm run start` to start the bot.
10. Enjoy! The bot should be online
    

## License
[**GPL-3.0**](./LICENSE), General Public License v3
