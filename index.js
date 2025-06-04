const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const { handleVanitySnipeResponse, startKeepAlive } = require('./structures/Sniper');
const { Selfbot } = require('./structures/Client');
const fs = require("fs");

const client = new Client({
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildExpressions, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ],
    partials: [ Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User ],
    restTimeOffset: 0,
    failIfNotExists: false,
    presence: {
        activities: [{
            name: `choisis ton statut.`,
            type: ActivityType.Streaming,
            url: "https://www.twitch.tv/002sans"
        }],
        status: "online"
    },
    allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false
    }
});

client.config = require("./config.json");
client.login(client.config.token);
client.selfbots = [];
loadBun()

client.save = () => fs.writeFileSync('./db.json', JSON.stringify(client.db, null, 4));

client.ms = temps => {
    const match = temps.match(/(\d+)([smhdwy])/);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'w': return value * 7 * 24 * 60 * 60 * 1000;
        case 'y': return value * 365 * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

const eventFiles = fs.readdirSync("./events/bot").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(`./events/bot/${file}`);
    client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(client, ...args));
};

client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
};

const dbFiles = fs.readdirSync("./db").filter(file => file.endsWith(".json"));
for (const file of dbFiles) {
    const data = require(`./db/${file}`);
    if (!data.token || (data.expire !== 0 && data.expire <= Date.now())) continue;

    new Selfbot({ token: data.token, client });
}

function loadBun() {
    Bun.connect({
        hostname: "canary.discord.com",
        port: 443,
        tls: { rejectUnauthorized: false },
        socket: {
            open: socket => {
                client.socket = socket;
                client.connectionStartTime = Date.now();
                startKeepAlive(client);
                console.log("🔌 Connexion établie avec Discord");
            },
            data: (socket, data) => {
                const response = data.toString();
                const responseReceived = Date.now();

                handleVanitySnipeResponse(client, response, responseReceived);
                if (response.includes('HTTP/1.1 4') || response.includes('HTTP/1.1 5')) console.log("⚠️ Réponse:", response.split('\r\n')[0]);
            },
            close: socket => {
                const uptime = client.connectionStartTime ? ((Date.now() - client.connectionStartTime) / 1000 / 60).toFixed(1) : 0;
                console.log(`🔌 Connexion fermée après ${uptime} minutes`);

                client.socket = null;
                client.connectionStartTime = null;
                clearInterval(client.keepAliveInterval);
                loadBun();
            },
            error(socket, error) {
                console.error("❌ Erreur socket:", error.message);
            },
        },
    });
}


async function errorHandler(error) {
    // erreurs ignorées
    if (error.code == 10062) return; // Unknown interaction
    if (error.code == 40060) return; // Interaction has already been acknowledged

    console.log(`[ERROR] ${error}`);
};
process.on("unhandledRejection", errorHandler);
process.on("uncaughtException", errorHandler);