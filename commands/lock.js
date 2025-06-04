const { SlashCommandBuilder, Client, Message, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const fs = require('node:fs');

module.exports = {
    name: "lock",
    description: "Vérouille la vanity d'un serveur.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string} args
    */
    async execute(client, message, args) { },
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
    */
    async executeSlash(client, interaction) {
        if (!fs.existsSync(`./db/${interaction.user.id}.json`)) return interaction.reply({ content: "Vous n'avez pas d'abonnement en cours." });
        const db = require(`../db/${interaction.user.id}.json`);

        const guild = interaction.options.getString('guild');
        const selfbot = client.selfbots.find(c => c.token == db.token);

        const embed = {
            title: "Liste des serveurs locks",
            color: 0xFFFFFF,
            description: `${db.lock_url.length ? db.lock_url.map((data, i) => `\`${i + 1}\`・${selfbot ? selfbot.guilds.cache.get(data.guildId)?.name : data.guildId} (\`${data.vanityURL}\`)`).join('\n') : 'Aucune vanity vérouillé'}`
        }

        if (!guild) return interaction.reply({ embeds: [embed], flags: 64 });
        if (db.lock_url.find(c => c.guildId == guild.split('///')[0])) db.lock_url = db.lock_url.filter(c => c.guildId !== guild.split('///')[0]);

        db.lock_url.push({ guildId: guild.split('///')[0], vanityURL: guild.split('///')[1] });
        fs.writeFileSync(`./db/${interaction.user.id}.json`, JSON.stringify(db, null, 4));

        return interaction.reply({ content: `La vanity \`${guild.split('///')[1]}\` est vérouillé` });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setContexts([0, 1, 2])
            .setDescription(this.description)
            .addStringOption(o =>
                o.setName('guild')
                    .setDescription('The server to lock')
                    .setDescriptionLocalization('fr', 'Le serveur à vérouiller')
                    .setAutocomplete(true)
                    .setRequired(false)
            )
    },
    /**
     * @param {Client} client
     * @param {import('discord.js').AutocompleteInteraction} interaction
     */
    async autocomplete(client, interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const focusedValue = focusedOption.value;

        if (!fs.existsSync(`./db/${interaction.user.id}.json`)) return interaction.respond([]);
        const db = require(`../db/${interaction.user.id}.json`);

        const selfbot = client.selfbots.find(c => c.token == db.token);
        if (!selfbot) return interaction.respond([]);

        const adminGuilds = selfbot.guilds.cache.filter(g => g.members.me.permissions.has('ADMINISTRATOR'))
            .map(guild => ({
                name: `${guild.name} ${guild.vanityURLCode ? `(${guild.vanityURLCode})` : ''}`,
                value: `${guild.id}///${guild.vanityURLCode}`
            }));

        const filtered = adminGuilds.filter(guild => guild.name.toLowerCase().includes(focusedValue.toLowerCase()));
        return await interaction.respond(filtered.slice(0, 25));
    }
}