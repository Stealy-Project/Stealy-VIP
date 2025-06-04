const { Events, Client, Message } = require('discord.js');

module.exports = {
    name: "GUILD_UPDATE",
    ws: true,
    /**
     * @param {Client} client
     * @param {object} data
    */
    async execute(client, data) {
        const lock_url = client.db.lock_url.find(c => c.guildId == data.id);
        const snipe_url = client.db.snipe_url.find(c => c.guildDetect == data.id);
        
        if (lock_url && data.vanity_url_code !== lock_url.vanityURL){
            const payload = JSON.stringify({ code: lock_url.vanityURL });
            const request = 
                `PATCH /api/v9/guilds/${data.id}/vanity-url HTTP/1.1\r\n` +
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

            if (client.bot.socket) return client.bot.socket.write(request);
        };

        if (snipe_url && data.vanity_url_code !== snipe_url.vanityURL){
            const payload = JSON.stringify({ code: snipe_url.vanityURL });
            const request = 
                `PATCH /api/v9/guilds/${snipe_url.guildId}/vanity-url HTTP/1.1\r\n` +
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

            if (client.bot.socket) return client.bot.socket.write(request);
        }
    }
}