const { Events, Client, Message } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    /**
     * @param {Client} client
     * @param {Message} message
    */
    async execute(client, message) {
        if (!message.inGuild() || message.author.bot) return;
        if (!message.content.startsWith(client.config.prefix)) return;

        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) || client.commands.find(command => command.aliases && command.aliases.includes(commandName));
        if (!command) return;

        if (command.botOwnerOnly && !client.config.owners.includes(message.author.id))
            return;

        if (command.guildOwnerOnly && message.guild.ownerId != message.author.id && !client.config.owners.includes(message.author.id))
            return;

        if (command.permissions?.length) {
            const authorPerms = message.channel.permissionsFor(message.author) || message.member.permissions;
            if (!authorPerms.has(command.permissions) && !client.config.owners.includes(message.author.id)) return message.reply("Vous n'avez pas les permissions nécessaires pour exécuter cette commande.").catch(() => {});
        };

        command.execute(client, message, args);
        console.log("[CMD]", `${message.guild.name} | ${message.channel.name} | ${message.author.displayName} | ${command.name}`);
    }
}