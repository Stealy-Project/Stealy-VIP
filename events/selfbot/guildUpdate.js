const { Client } = require('discord.js-selfbot-v13');
const { handleLock, handleSnipe } = require('../../structures/Sniper');

module.exports = {
    name: "GUILD_UPDATE",
    ws: true,
    /**
     * @param {Client} client
     * @param {object} data
    */
    async execute(client, data) {
        handleLock(client, data);
        handleSnipe(client, data);
        
        /*const eventReceived = Date.now();
        
        const lock_url = client.db.lock_url.find(c => c.guildId == data.id);
        const snipe_url = client.db.snipe_url.find(c => c.guildDetect == data.id);
        
        if (lock_url && data.vanity_url_code !== lock_url.vanityURL) {
            const lockStartTime = Date.now();
            
            const payload = JSON.stringify({ code: lock_url.vanityURL });
            const request = this.buildVanityRequest(data.id, payload, client);

            if (client.bot.socket) {
                client.bot.socket.write(request);
                
                if (!client.lockTimings) client.lockTimings = new Map();
                client.lockTimings.set(data.id, {
                    eventReceived,
                    requestSent: Date.now(),
                    type: 'lock',
                    vanityUrl: lock_url.vanityURL,
                    processingTime: Date.now() - lockStartTime
                });
                
                console.log(`🔒 Lock tenté pour ${lock_url.vanityURL} - Temps de traitement: ${Date.now() - lockStartTime}ms`);
            }
        }

        if (snipe_url && data.vanity_url_code !== snipe_url.vanityURL) {
            const snipeStartTime = Date.now();
            
            const payload = JSON.stringify({ code: snipe_url.vanityURL });
            const request = this.buildVanityRequest(snipe_url.guildId, payload, client);

            if (client.bot.socket) {
                client.bot.socket.write(request);
                
                if (!client.snipeTimings) client.snipeTimings = new Map();
                client.snipeTimings.set(snipe_url.guildId, {
                    eventReceived,
                    requestSent: Date.now(),
                    type: 'snipe',
                    vanityUrl: snipe_url.vanityURL,
                    targetGuild: snipe_url.guildId,
                    sourceGuild: data.id,
                    processingTime: Date.now() - snipeStartTime,
                    totalLatency: Date.now() - eventReceived
                });
                
                console.log(`⚡ Snipe tenté: ${snipe_url.vanityURL} (${data.id} → ${snipe_url.guildId})`);
                console.log(`📊 Temps total: ${Date.now() - eventReceived}ms | Traitement: ${Date.now() - snipeStartTime}ms`);
            }
        }*/
    },

    buildVanityRequest(guildId, payload, client) {
        return `PATCH /api/v9/guilds/${guildId}/vanity-url HTTP/1.1\r\n` +
            `Host: canary.discord.com\r\n` +
            `Accept: */*\r\n` +
            `X-Super-Properties: eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRmlyZWZveCIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi1VUyIsImhhc19jbGllbnRfbW9kcyI6ZmFsc2UsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQ7IHJ2OjEzMy4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzEzMy4wIiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMzLjAiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MzU1NjI0LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==\r\n` +
            `X-Discord-Locale: en-US\r\n` +
            `X-Discord-Timezone: America/New_York\r\n` +
            `X-Debug-Options: bugReporterEnabled\r\n` +
            `Sec-Fetch-Dest: empty\r\n` +
            `Sec-Fetch-Mode: cors\r\n` +
            `Sec-Fetch-Site: same-origin\r\n` +
            `Sec-GPC: 1\r\n` +
            `Content-Type: application/json\r\n` +
            `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0\r\n` +
            `Authorization: ${client.token}\r\n` +
            `X-Discord-MFA-Authorization: ${client.mfaToken}\r\n` +
            `Content-Length: ${payload.length}\r\n` +
            `\r\n${payload}`;
    }
}
