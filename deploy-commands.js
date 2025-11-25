import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import 'dotenv/config';
import { ALL_COMMANDS } from './commands.js';

export function rerun() {
    console.log("Redeploying commands...");
    // convert command exports to JSON payloads and evaluate any functions used for choices/options
    function evaluateChoicesRecursive(obj) {
      if (obj == null || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(evaluateChoicesRecursive);

      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        if (k === 'choices' && typeof v === 'function') {
          out[k] = v();
        } else if (Array.isArray(v)) {
          out[k] = v.map(evaluateChoicesRecursive);
        } else if (v && typeof v === 'object') {
          out[k] = evaluateChoicesRecursive(v);
        } else {
          out[k] = v;
        }
      }
      return out;
    }

    const commands = ALL_COMMANDS.map(rawCommand => {
      // prefer command.data.toJSON() (SlashCommandBuilder), fall back to command.toJSON() or the object itself
      const payload = (rawCommand.data && typeof rawCommand.data.toJSON === 'function')
        ? rawCommand.data.toJSON()
        : (typeof rawCommand.toJSON === 'function' ? rawCommand.toJSON() : rawCommand);

      // produce a copy with any choice-producing functions executed
      return evaluateChoicesRecursive(payload);
    });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    (async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
        Routes.applicationCommands(process.env.APP_ID),
        { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
    })();
}