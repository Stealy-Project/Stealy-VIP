/**
 * Initialise les statistiques de snipe pour un client
 * @param {object} client - Le client Discord
 */
function initializeStats(client) {
    if (!client.snipeStats) {
        client.snipeStats = {
            totalAttempts: 0,
            successCount: 0,
            failCount: 0,
            averageTime: 0,
            bestTime: Infinity,
            worstTime: 0,
            recentTimes: []
        };
    }
}

/**
 * Gère la logique de snipe d'URL de vanité
 * @param {object} client - Le client Discord
 * @param {object} data - Données de l'événement GUILD_UPDATE
 */
async function handleSnipe(client, data) {
    const eventReceived = Date.now();
    const snipe_url = client.db.snipe_url.find(c => c.guildDetect == data.id);
    
    if (!snipe_url || data.vanity_url_code === snipe_url.vanityURL) return;

    const snipeStartTime = Date.now();
    
    const payload = JSON.stringify({ code: snipe_url.vanityURL });
    const request = buildVanityRequest(client, snipe_url.guildId, payload);

    if (client.socket) {
        client.socket.write(request);
        
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
}

/**
 * Gère la logique de lock d'URL de vanité
 * @param {object} client - Le client Discord
 * @param {object} data - Données de l'événement GUILD_UPDATE
 */
async function handleLock(client, data) {
    const eventReceived = Date.now();
    const lock_url = client.db.lock_url.find(c => c.guildId == data.id);
    
    if (!lock_url || data.vanity_url_code === lock_url.vanityURL)  return;
    
    const lockStartTime = Date.now();
    
    const payload = JSON.stringify({ code: lock_url.vanityURL });
    const request = buildVanityRequest(client, data.id, payload);

    if (client.socket) {
        client.socket.write(request);
        
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

/**
 * Gère la logique de lock d'URL de vanité
 * @param {object} client - Le client Discord
 * @param {object} data - Données de l'événement GUILD_UPDATE
 */
async function handleLock(client, data) {
    const eventReceived = Date.now();
    const lock_url = client.db.lock_url.find(c => c.guildId == data.id);
    
    if (!lock_url || data.vanity_url_code === lock_url.vanityURL) return;

    const lockStartTime = Date.now();
    
    const payload = JSON.stringify({ code: lock_url.vanityURL });
    const request = buildVanityRequest(client, data.id, payload);

    if (client.socket) {
        client.socket.write(request);
        
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

/**
 * Construit la requête HTTP pour modifier une vanity URL
 * @param {object} client - Le client Discord
 * @param {string} guildId - ID de la guilde
 * @param {string} payload - Payload JSON
 * @returns {string} Requête HTTP formatée
 */
function buildVanityRequest(client, guildId, payload) {
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

/**
 * Gère les réponses des tentatives de snipe de vanity URL
 * @param {object} client - Le client Discord
 * @param {string} response - Réponse HTTP
 * @param {number} responseReceived - Timestamp de réception
 */
function handleVanitySnipeResponse(client, response, responseReceived) {
    if (!response.includes('/vanity-url')) return;

    const isSuccess = response.includes('HTTP/1.1 200') || response.includes('HTTP/1.1 204');
    const statusMatch = response.match(/HTTP\/1\.1 (\d+)/);
    const status = statusMatch ? statusMatch[1] : 'unknown';
    
    checkTimings(client, client.snipeTimings, 'snipe', responseReceived, isSuccess, status);
    checkTimings(client, client.lockTimings, 'lock', responseReceived, isSuccess, status);
}

/**
 * Vérifie et traite les timings stockés
 * @param {object} client - Le client Discord
 * @param {Map} timingsMap - Map des timings
 * @param {string} type - Type d'opération (snipe/lock)
 * @param {number} responseReceived - Timestamp de réception
 * @param {boolean} isSuccess - Succès de l'opération
 * @param {string} status - Code de statut HTTP
 */
function checkTimings(client, timingsMap, type, responseReceived, isSuccess, status) {
    if (!timingsMap) return;
    
    for (const [guildId, timing] of timingsMap.entries()) {
        const totalTime = responseReceived - timing.eventReceived;
        const networkTime = responseReceived - timing.requestSent;
        
        if (isSuccess) {
            console.log(`✅ ${type.toUpperCase()} RÉUSSI: ${timing.vanityUrl}`);
            console.log(`⏱️ Temps total: ${totalTime}ms | Réseau: ${networkTime}ms | Traitement: ${timing.processingTime}ms`);
            
            saveSnipeStats(client, timing, totalTime, networkTime, true);
        } else {
            console.log(`❌ ${type.toUpperCase()} ÉCHOUÉ: ${timing.vanityUrl} (Status: ${status})`);
            console.log(`⏱️ Temps total: ${totalTime}ms | Réseau: ${networkTime}ms`);
            
            saveSnipeStats(client, timing, totalTime, networkTime, false);
        }
        
        timingsMap.delete(guildId);
        break;
    }
}

/**
 * Sauvegarde les statistiques de snipe
 * @param {object} client - Le client Discord
 * @param {object} timing - Données de timing
 * @param {number} totalTime - Temps total
 * @param {number} networkTime - Temps réseau
 * @param {boolean} success - Succès de l'opération
 */
function saveSnipeStats(client, timing, totalTime, networkTime, success) {
    initializeStats(client);
    
    const stats = client.snipeStats;
    stats.totalAttempts++;
    
    if (success) {
        stats.successCount++;
        
        if (totalTime < stats.bestTime) stats.bestTime = totalTime;
        if (totalTime > stats.worstTime) stats.worstTime = totalTime;
        
        stats.recentTimes.push(totalTime);

        if (stats.recentTimes.length > 10) stats.recentTimes.shift();
        stats.averageTime = stats.recentTimes.reduce((a, b) => a + b, 0) / stats.recentTimes.length;
        
        console.log(`📈 Stats: ${stats.successCount}/${stats.totalAttempts} réussis | Meilleur: ${stats.bestTime}ms | Moyenne: ${Math.round(stats.averageTime)}ms`);
    } else {
        stats.failCount++;
    }
}

/**
 * Retourne les statistiques de snipe formatées
 * @param {object} client - Le client Discord
 * @returns {string} Statistiques formatées
 */
function getSnipeStats(client) {
    if (!client.snipeStats) return "Aucune statistique disponible";
    
    const stats = client.snipeStats;
    const successRate = ((stats.successCount / stats.totalAttempts) * 100).toFixed(1);
    
    return `📊 **Statistiques de Snipe**
Tentatives totales: ${stats.totalAttempts}
Réussites: ${stats.successCount} (${successRate}%)
Échecs: ${stats.failCount}
Meilleur temps: ${stats.bestTime === Infinity ? 'N/A' : stats.bestTime + 'ms'}
Temps moyen: ${Math.round(stats.averageTime)}ms
Pire temps: ${stats.worstTime}ms`;
}

/**
 * Fonction utilitaire pour démarrer le keep-alive
 * @param {object} client - Le client Discord
 */
function startKeepAlive(client) {
    client.keepAliveInterval = setInterval(() => {
        if (client.socket) {
            const keepAliveRequest =
                `GET /api/v10/users/@me HTTP/1.1\r\n` +
                `Host: discord.com\r\n` +
                `Authorization: Bot ${client.token}\r\n` +
                `Connection: keep-alive\r\n` +
                `Keep-Alive: timeout=600, max=1000\r\n` +
                `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n` +
                `Cache-Control: no-cache\r\n\r\n`;

            try {
                client.socket.write(keepAliveRequest);
                console.log("💓 Keep-alive envoyé");
            } catch (error) {
                console.error("❌ Erreur keep-alive:", error.message);
            }
        }
    }, 1000 * 12);
}

module.exports = {
    initializeStats,
    handleSnipe,
    handleLock,
    buildVanityRequest,
    handleVanitySnipeResponse,
    checkTimings,
    saveSnipeStats,
    getSnipeStats,
    startKeepAlive
};