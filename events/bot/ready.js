const { Routes, Events, Client } = require('discord.js');
const { REST } = require('@discordjs/rest');

module.exports = {
    name: Events.ClientReady,
    once: true,
    /**
     * @param {Client} client
    */
    async execute(client) {
        console.log(`[READY] ${client.user.displayName} (${client.user.id}) est prêt | ${client.guilds.cache.size.toLocaleString('fr-FR')} serveurs | ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString('fr-FR')} utilisateurs`);

        const rest = new REST({ version: '10' }).setToken(client.token);

        rest.put(
            Routes.applicationCommands(client.user.id), { body: client.config.slashs ?  client.commands.map(c => c.data.toJSON()) : [] } // Global commands
        )
            .then((data) => console.log(`[SLASH] ${data.length} commandes enregistrées.`))
            .catch(console.error);
    }
}