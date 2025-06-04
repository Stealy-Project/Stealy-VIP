const { SlashCommandBuilder, Client, Message, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const fs = require('node:fs');

module.exports = {
    name: "snipe",
    description: "Snipe une URL sur un serveur précis.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string} args
    */
    async execute(client, message, args) {},
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
    */
    async executeSlash(client, interaction) {
        if (!fs.existsSync(`./db/${interaction.user.id}.json`)) return interaction.reply({ content: "Vous n'avez pas d'abonnement en cours." });
        const db = require(`../db/${interaction.user.id}.json`);

        const guild = interaction.options.getString('guild');
        const vanity = interaction.options.getString('vanity');
        const selfbot = client.selfbots.find(c => c.token == db.token);

        const embed = {
            title: "Liste des serveurs snipes",
            color: 0xFFFFFF,
            description: `${db.snipe_url.length ? db.snipe_url.map((data, i) => `\`${i+1}\`・${selfbot ? selfbot.guilds.cache.get(data.guildId)?.name : data.guildId} (\`${data.vanityURL}\`)`).join('\n') : 'Aucun snipe en cours'}`
        }

        if (!guild && !vanity) return interaction.reply({ embeds: [embed], flags: 64 });
        if (!guild && vanity || guild && !vanity) return interaction.reply({ content: "Veuillez choisir le serveur où mettre la vanity (`guild`) et la vanity à snipe (`vanity`)" });

        if (db.snipe_url.find(c => c.guildId == guild)) db.snipe_url = db.snipe_url.filter(c => c.guildId !== guild);

        db.snipe_url.push({ guildId: guild, guildDetect: vanity.split('///')[0], vanityURL: vanity.split('///')[1] });
        fs.writeFileSync(`./db/${interaction.user.id}.json`, JSON.stringify(db, null, 4));

        return interaction.reply({ content: `Vous snipez maintenant \`${vanity.split('///')[1]}\`` })
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setContexts([0, 1, 2])
            .setDescription(this.description)
            .addStringOption(o =>
                o.setName('guild')
                .setDescription('The server where to put the vanity')
                .setDescriptionLocalization('fr', 'Le serveur où mettre la vanity')
                .setAutocomplete(true)
                .setRequired(false)
            )
            .addStringOption(o =>
                o.setName('vanity')
                .setDescription('La vanity to snipe')
                .setDescriptionLocalization('fr', 'La vanity à sniper')
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
        
        if (focusedOption.name === 'guild') {
            const adminGuilds = selfbot.guilds.cache.filter(g => g.members.me.permissions.has('ADMINISTRATOR'))
            .map(guild => ({
                name: `${guild.name} ${guild.vanityURLCode ? `(${guild.vanityURLCode})` : ''}`,
                value: guild.id
            }));

            const filtered = adminGuilds.filter(guild => guild.name.toLowerCase().includes(focusedValue.toLowerCase()));
            await interaction.respond(filtered.slice(0, 25));
        } else if (focusedOption.name === 'vanity') {
            const vanityGuilds = selfbot.guilds.cache.filter(g => g.premiumTier === 'TIER_3' && g.vanityURLCode).map(guild => ({
                name: `${guild.name} (${guild.vanityURLCode})`,
                value: `${guild.id}///${guild.vanityURLCode}`
            }));

            const filtered = vanityGuilds.filter(guild => guild.name.toLowerCase().includes(focusedValue.toLowerCase()));
            await interaction.respond(filtered.slice(0, 25));
        }
    }
}