const Discord = require('discord.js-selfbot-v13');
const fs = require('node:fs');

class Selfbot extends Discord.Client {
    constructor(options) {
        super({ presence: { status: 'invisible' } });

        this.setMaxListeners(0);
        this.db = require(`../db/${Buffer.from(options.token.split('.')[0], 'base64').toString()}.json`)
        this.bot = options.client;

        this.login(options.token)//.catch(() => false);
        options.client.selfbots.push(this);

        const eventFiles = fs.readdirSync("./events/selfbot").filter(file => file.endsWith(".js"));
        for (const file of eventFiles) {
            const event = require(`../events/selfbot/${file}`);
            if (event.ws) this.ws[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(this, ...args));
            else this[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(this, ...args));
        };
    }
}

module.exports = { Selfbot }