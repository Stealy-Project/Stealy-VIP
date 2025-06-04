const { SlashCommandBuilder, Client, Message, ChatInputCommandInteraction } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Afficher le ping du bot.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string} args
    */
    async execute(client, message, args) {
        message.reply(`🏓 **Mon ping est de :** ${client.ws.ping} ms.`).catch(() => null);
    },
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
    */
    async executeSlash(client, interaction) {
        interaction.reply(`🏓 **Mon ping est de :** ${client.ws.ping} ms.`).catch(() => null);
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
    }
}