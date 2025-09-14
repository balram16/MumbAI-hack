// Lightweight ETH→INR rate utility with caching

const CACHE_KEY = 'eth_inr_rate_cache_v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function getEthInrRate() {
    try {
        const now = Date.now();
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && cached.rate && cached.ts && (now - cached.ts < CACHE_TTL_MS)) {
            return cached.rate;
        }
        // Fetch from CoinGecko public API
        const resp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr');
        if (!resp.ok) throw new Error('Failed to fetch rate');
        const data = await resp.json();
        const rate = data?.ethereum?.inr;
        if (typeof rate === 'number' && isFinite(rate)) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, ts: now }));
            return rate;
        }
        throw new Error('Invalid rate data');
    } catch (e) {
        // Fallback to last known cached value even if stale
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
            if (cached && cached.rate) return cached.rate;
        } catch (_) {}
        return null; // caller should handle null gracefully
    }
}

export function formatEthInr(ethAmount, ethInrRate) {
    try {
        const eth = Number(ethAmount);
        if (!isFinite(eth) || !ethInrRate) return `${ethAmount} ETH`;
        const inr = eth * Number(ethInrRate);
        const inrFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(inr);
        return `${ethAmount} ETH / ${inrFormatted}`;
    } catch (_) {
        return `${ethAmount} ETH`;
    }
}


