const { Events, Client, Interaction } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    /**
     * @param {Client} client
     * @param {Interaction} interaction
    */
    async execute(client, interaction) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if (command.botOwnerOnly && !client.config.owners.includes(interaction.user.id)) {
                return interaction.reply({
                    content: `❌ **Vous devez être le propriétaire du bot pour exécuter cette commande.**`,
                    flags: 64
                });
            };

            if (command.guildOwnerOnly && interaction.member.guild.ownerId != interaction.user.id && !client.config.owners.includes(interaction.user.id)) {
                return interaction.reply({
                    content: `❌ **Vous devez être le propriétaire du serveur pour exécuter cette commande.**`,
                    flags: 64
                });
            };

            if (command.permissions?.length) {
                const authorPerms = interaction.channel.permissionsFor(interaction.user) || interaction.member.permissions;
                if (!authorPerms.has(command.permissions) && !client.config.owners.includes(interaction.user.id)) return interaction.reply({
                    content: `❌ **Vous n'avez pas les permissions nécessaires pour exécuter cette commande.**`,
                    flags: 64
                });
            };

            command.executeSlash(client, interaction);
            console.log("[CMD-S]", interaction.guild ? `${interaction.guild.name} | ${interaction.channel.name}` : `DM`, `| ${interaction.user.displayName} | ${command.name}`);
        };

        if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);

            if (!command || !command.autocomplete) return;

            try {
                await command.autocomplete(client, interaction);
            } catch (error) {
                console.error('Erreur lors de l\'autocomplétion:', error);
                try {
                    await interaction.respond([
                        { name: "Erreur lors du chargement", value: "error" }
                    ]);
                } catch (respondError) {
                    console.error('Impossible de répondre à l\'autocomplétion:', respondError);
                }
            }
        }
    }
}