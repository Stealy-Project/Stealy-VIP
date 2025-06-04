const pendingVanityRequests = new Map();
const responseCallbacks = new Map();

const snipeStats = {
    total: 0,
    success: 0,
    failed: 0,
    times: [],
    bestTime: Infinity,
    worstTime: 0,
    lastSnipe: null
};

function handleVanitySnipeResponse(response) {
    const lines = response.split('\r\n');
    const requestIdHeader = lines.find(line => line.startsWith('X-Request-ID:'));
    
    let requestId = null;
    if (requestIdHeader) requestId = requestIdHeader.split(': ')[1];

    if (!requestId) {
        for (const [id, req] of pendingVanityRequests.entries()) {
            if (response.includes(`/api/v9/guilds/${req.guildId}/vanity-url`) || 
                response.includes(req.vanityCode)) {
                requestId = id;
                break;
            }
        }
    }

    if (!requestId || !responseCallbacks.has(requestId)) return false;

    const callback = responseCallbacks.get(requestId);
    callback(response);
    return true;
}

function showSnipeStats() {
    const avgTime = snipeStats.times.length > 0 ? (snipeStats.times.reduce((a, b) => a + b, 0) / snipeStats.times.length).toFixed(2) : 0;
    const successRate = snipeStats.total > 0 ? ((snipeStats.success / snipeStats.total) * 100).toFixed(1) : 0;

    console.log(`
📊 STATISTIQUES VANITY SNIPING
═══════════════════════════════
🎯 Total snipes: ${snipeStats.total}
✅ Succès: ${snipeStats.success}
❌ Échecs: ${snipeStats.failed}
📈 Taux de réussite: ${successRate}%
⚡ Temps moyen: ${avgTime}ms
🏆 Meilleur temps: ${snipeStats.bestTime === Infinity ? 'N/A' : snipeStats.bestTime + 'ms'}
⏱️ Pire temps: ${snipeStats.worstTime}ms
${snipeStats.lastSnipe ? `🕒 Dernier snipe: ${snipeStats.lastSnipe.vanity} (${snipeStats.lastSnipe.time}ms) ${snipeStats.lastSnipe.success ? '✅' : '❌'}` : ''}
    `);
}

function clearSnipeStats() {
    snipeStats.total = 0;
    snipeStats.success = 0;
    snipeStats.failed = 0;
    snipeStats.times = [];
    snipeStats.bestTime = Infinity;
    snipeStats.worstTime = 0;
    snipeStats.lastSnipe = null;
    console.log("📊 Stats de sniping réinitialisées");
}

module.exports = {
    pendingVanityRequests,
    responseCallbacks,
    snipeStats,
    handleVanitySnipeResponse,
    showSnipeStats,
    clearSnipeStats
};
