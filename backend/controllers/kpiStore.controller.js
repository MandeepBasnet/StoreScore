const { databases } = require('../config/appwrite');
const { Query } = require('node-appwrite');

const DB_ID = process.env.APPWRITE_DATABASE_ID;
const STORES_COL = process.env.APPWRITE_COLLECTION_STORES;
const KPI_COL = process.env.APPWRITE_COLLECTION_KPI;
const TARGETS_COL = process.env.APPWRITE_COLLECTION_TARGETS;

/**
 * GET /api/kpi/store/:storeId
 * Query params:
 *   - view: 'daily' (default) or 'weekly'
 *   - year, month: optional date filters
 */
exports.getStoreKPIData = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { view = 'daily', year, month } = req.query;

        const now = new Date();
        const targetYear = year ? parseInt(year) : now.getFullYear();
        const targetMonth = month !== undefined ? parseInt(month) : now.getMonth();

        // 1. Fetch Store Info
        let store;
        try {
            store = await databases.getDocument(DB_ID, STORES_COL, storeId);
        } catch (err) {
            return res.status(404).json({ success: false, error: 'Store not found' });
        }

        // 2. Fetch Current Targets
        let targets = { targetScore: 28.0, warningThreshold: 26.0, criticalThreshold: 24.0 };
        try {
            const targetsResponse = await databases.listDocuments(DB_ID, TARGETS_COL, [
                Query.equal('storeId', storeId),
                Query.limit(1)
            ]);
            if (targetsResponse.documents.length > 0) {
                const t = targetsResponse.documents[0];
                targets = {
                    targetScore: t.targetScore || 28.0,
                    warningThreshold: t.warningThreshold || 26.0,
                    criticalThreshold: t.criticalThreshold || 24.0
                };
            }
        } catch (err) {
            console.log('No targets found, using defaults');
        }

        // Build response based on view type
        if (view === 'weekly') {
            return await handleWeeklyView(req, res, store, targets, now, targetYear, targetMonth, storeId);
        } else {
            return await handleDailyView(req, res, store, targets, now, targetYear, targetMonth, storeId);
        }

    } catch (error) {
        console.error('KPI Store API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Handle Daily View (default)
async function handleDailyView(req, res, store, targets, now, targetYear, targetMonth, storeId) {
    // Fetch entries for the month
    const startDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`;
    const endDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-31`;

    const entriesResponse = await databases.listDocuments(DB_ID, KPI_COL, [
        Query.equal('storeId', storeId),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.orderDesc('date'),
        Query.limit(100)
    ]);
    const entries = entriesResponse.documents;

    // Get Today's Entry
    const todayStr = formatDate(now);
    const todayEntry = entries.find(e => e.date === todayStr);

    let today = null;
    if (todayEntry) {
        const score = todayEntry.dailyScore;
        const target = todayEntry.target || targets.targetScore;
        today = {
            date: todayEntry.date,
            score: score,
            target: target,
            status: getStatus(score, target, targets.warningThreshold, targets.criticalThreshold),
            vsTarget: parseFloat((score - target).toFixed(2))
        };
    }

    // Calculate Weekly Average (current week)
    const weekStart = getWeekStart(now);
    const weekStartStr = formatDate(weekStart);
    const weekEntries = entries.filter(e => e.date >= weekStartStr);
    const weekly = calculateStats(weekEntries, targets.targetScore);

    // Calculate Monthly Average
    const monthly = calculateStats(entries, targets.targetScore);
    monthly.streak = calculateStreak(entries, targets.targetScore);

    res.json({
        success: true,
        view: 'daily',
        data: {
            store: { id: store.$id, name: store.name, location: store.location },
            target: { score: targets.targetScore, warning: targets.warningThreshold, critical: targets.criticalThreshold },
            today: today,
            weekly: weekly,
            monthly: monthly
        }
    });
}

// Handle Weekly View
async function handleWeeklyView(req, res, store, targets, now, targetYear, targetMonth, storeId) {
    // Get current week and past week date ranges
    const currentWeekStart = getWeekStart(now);
    const currentWeekEnd = getWeekEnd(currentWeekStart);
    const pastWeekStart = new Date(currentWeekStart);
    pastWeekStart.setDate(pastWeekStart.getDate() - 7);
    const pastWeekEnd = new Date(currentWeekStart);
    pastWeekEnd.setDate(pastWeekEnd.getDate() - 1);

    // Fetch entries for both weeks (past 14 days)
    const fetchStartDate = formatDate(pastWeekStart);
    const fetchEndDate = formatDate(now);

    const entriesResponse = await databases.listDocuments(DB_ID, KPI_COL, [
        Query.equal('storeId', storeId),
        Query.greaterThanEqual('date', fetchStartDate),
        Query.lessThanEqual('date', fetchEndDate),
        Query.orderDesc('date'),
        Query.limit(100)
    ]);
    const allEntries = entriesResponse.documents;

    // Also fetch monthly entries for monthly average
    const monthStartDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`;
    const monthEndDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-31`;
    
    const monthEntriesResponse = await databases.listDocuments(DB_ID, KPI_COL, [
        Query.equal('storeId', storeId),
        Query.greaterThanEqual('date', monthStartDate),
        Query.lessThanEqual('date', monthEndDate),
        Query.orderDesc('date'),
        Query.limit(100)
    ]);
    const monthEntries = monthEntriesResponse.documents;

    // Split entries by week
    const currentWeekStartStr = formatDate(currentWeekStart);
    const pastWeekStartStr = formatDate(pastWeekStart);
    const pastWeekEndStr = formatDate(pastWeekEnd);

    const currentWeekEntries = allEntries.filter(e => e.date >= currentWeekStartStr);
    const pastWeekEntries = allEntries.filter(e => e.date >= pastWeekStartStr && e.date <= pastWeekEndStr);

    // Calculate stats
    const currentWeekStats = calculateStats(currentWeekEntries, targets.targetScore);
    const pastWeekStats = calculateStats(pastWeekEntries, targets.targetScore);
    const monthlyStats = calculateStats(monthEntries, targets.targetScore);
    monthlyStats.streak = calculateStreak(monthEntries, targets.targetScore);

    res.json({
        success: true,
        view: 'weekly',
        data: {
            store: { id: store.$id, name: store.name, location: store.location },
            target: { score: targets.targetScore, warning: targets.warningThreshold, critical: targets.criticalThreshold },
            currentWeek: {
                range: `${formatDisplayDate(currentWeekStart)} - ${formatDisplayDate(currentWeekEnd)}`,
                ...currentWeekStats,
                entries: currentWeekEntries.map(e => formatEntry(e, targets.targetScore))
            },
            pastWeek: {
                range: `${formatDisplayDate(pastWeekStart)} - ${formatDisplayDate(pastWeekEnd)}`,
                ...pastWeekStats,
                entries: pastWeekEntries.map(e => formatEntry(e, targets.targetScore))
            },
            monthly: monthlyStats
        }
    });
}

// Helper: Format entry for response
function formatEntry(entry, defaultTarget) {
    return {
        date: entry.date,
        score: entry.dailyScore,
        status: entry.status,
        target: entry.target || defaultTarget
    };
}

// Helper: Get status based on score and thresholds
function getStatus(score, target, warning, critical) {
    if (score >= target) return 'met';
    if (score >= warning) return 'warning';
    return 'missed';
}

// Helper: Get start of week (Monday)
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Helper: Get end of week (Sunday)
function getWeekEnd(weekStart) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
}

// Helper: Format date as YYYY-MM-DD
function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Helper: Format date for display (Dec 22)
function formatDisplayDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Helper: Calculate stats for a set of entries
function calculateStats(entries, targetScore) {
    if (entries.length === 0) {
        return { average: null, entries: 0, metCount: 0, missedCount: 0 };
    }

    const scores = entries.map(e => e.dailyScore);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const metCount = entries.filter(e => e.dailyScore >= (e.target || targetScore)).length;

    return {
        average: parseFloat(average.toFixed(2)),
        entries: entries.length,
        metCount: metCount,
        missedCount: entries.length - metCount
    };
}

// Helper: Calculate streak of consecutive days meeting target
function calculateStreak(entries, targetScore) {
    if (entries.length === 0) return 0;

    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    
    let streak = 0;
    for (const entry of sorted) {
        const target = entry.target || targetScore;
        if (entry.dailyScore >= target) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

