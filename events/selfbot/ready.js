const { vanity_defender } = require('../../structures/Ticket')
const { Client } = require('discord.js-selfbot-v13');

module.exports = {
    name: 'ready',
    once: true,
    /**
     * @param {Client} client
    */
    async execute(client) {
        console.log(`[EVENT] ${client.user.displayName} est prêt`);

        vanity_defender(client)
        client.interval = setInterval(() => vanity_defender(client), 1000 * 60 * 4 + 50000);
    }
}