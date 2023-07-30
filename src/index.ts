import { Client } from "discord.js";
import { config } from "dotenv";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { readdirSync } from "fs";

config();

const client = new Client({
  intents: [],
});

const commands = [];
const commandFiles = readdirSync("./src/commands").filter((file) =>
  file.endsWith(".ts"),
);

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      {
        body: commands,
      },
    );

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.login(process.env.TOKEN);

client.on("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    if (command.default.data.name === commandName) {
      try {
        await command.default.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  }
});
