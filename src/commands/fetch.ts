import {
  EmbedBuilder,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { fetchTilannehuone } from "../parser";

export default {
  data: new SlashCommandBuilder()
    .setName("fetch")
    .setDescription("Fetches the first entry from Tilannehuone.fi"),
  async execute(interaction: CommandInteraction) {
    const alert = await fetchTilannehuone();

    console.log(alert);

    let embed = new EmbedBuilder()
      .setTitle(alert.type)
      .setDescription(alert.location)
      .setThumbnail(`https://www.tilannehuone.fi/${alert.image}`)
      .setTimestamp(
        new Date(`${alert.date.split(".").reverse().join("-")}T${alert.time}`),
      );

    if (alert.description)
      embed.addFields({ name: "Description", value: alert.description });

    interaction.reply({ embeds: [embed] });
  },
};
