const { xiboRequest } = require('../utils/xiboClient');
const { databases } = require('../config/appwrite');
const { Query } = require('node-appwrite');

// Simple In-Memory Cache
const cache = {
  displays: { data: null, timestamp: 0 },
  users: { data: null, timestamp: 0 }
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minutes

exports.getDisplays = async (req, res) => {
    try {
        let xiboDisplays = [];

        // Check Cache
        const now = Date.now();
        if (cache.displays.data && (now - cache.displays.timestamp < CACHE_DURATION)) {
            console.log("Serving Displays from Cache");
            xiboDisplays = cache.displays.data;
        } else {
            // 1. Fetch All Displays from Xibo
            console.log("Fetching Displays from Xibo...");
            const params = new URLSearchParams({
                start: 0,
                length: 1000,
                embed: "status,currentLayout,displayGroup", 
            });

            const xiboResponse = await xiboRequest(
                `/display?${params.toString()}`, 
                "GET"
            );

            if (Array.isArray(xiboResponse)) {
                xiboDisplays = xiboResponse;
            } else if (xiboResponse.data) {
                xiboDisplays = xiboResponse.data;
            }

            // Update Cache
            cache.displays = { data: xiboDisplays, timestamp: now };
        }

        // 2. Fetch All Stores from Appwrite to check valid assignments
        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const collectionId = process.env.APPWRITE_COLLECTION_STORES;

        let allStores = [];
        try {
            const storesResponse = await databases.listDocuments(
                databaseId,
                collectionId,
                [Query.limit(100)] 
            );
            allStores = storesResponse.documents;
        } catch (dbError) {
            console.error("Failed to fetch stores for cross-reference:", dbError);
        }

        // 3. Create a Map of Assigned Display IDs
        const assignedDisplayMap = {};
        allStores.forEach(store => {
            if (store.displayIds && Array.isArray(store.displayIds)) {
                store.displayIds.forEach(id => {
                    assignedDisplayMap[String(id)] = store.name;
                });
            }
        });

        // 4. Map to a simplified format
        const formattedDisplays = xiboDisplays.map(d => {
            const displayIdStr = String(d.displayId);
            const isAssigned = !!assignedDisplayMap[displayIdStr];
            
            return {
                id: d.displayId,
                name: d.display,
                status: d.loggedIn ? 'Online' : 'Offline',
                clientType: d.clientType,
                lastAccessed: d.lastAccessed,
                isAssigned: isAssigned,
                assignedStoreName: isAssigned ? assignedDisplayMap[displayIdStr] : null
            };
        });

        res.json(formattedDisplays);

    } catch (error) {
        console.error("Failed to fetch displays:", error);
        res.status(500).json({ error: "Failed to fetch displays from Xibo" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        let users = [];
        
        // Check Cache
        const now = Date.now();
        if (cache.users.data && (now - cache.users.timestamp < CACHE_DURATION)) {
             console.log("Serving Users from Cache");
             users = cache.users.data;
        } else {
            console.log("Fetching Users from Xibo...");
            const params = new URLSearchParams({
                userTypeId: 3, 
                embed: 'groups'
            });

            const response = await xiboRequest(`/user?${params.toString()}`, "GET");
            
            if (Array.isArray(response)) {
                users = response;
            } else if (response.data) {
                users = response.data;
            }
            
            // Update Cache
            cache.users = { data: users, timestamp: now };
        }

        const formattedUsers = users.map(u => ({
            userId: u.userId,
            userName: u.userName,
            fullName: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.userName,
            email: u.email
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        res.status(500).json({ error: "Failed to fetch users from Xibo" });
    }
};

exports.getStoreSuggestions = async (req, res) => {
    try {
        const { storeId } = req.params;
        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const collectionId = process.env.APPWRITE_COLLECTION_STORES;

        // 1. Fetch Store to get Display IDs
        const store = await databases.getDocument(databaseId, collectionId, storeId);
        
        if (!store.displayIds || store.displayIds.length === 0) {
            return res.json({ suggestedUserIds: [], reasons: {} });
        }

        // 2. Fetch Details of these Displays from Xibo to find Owners/Permissions
        // We can't batch fetch easily by ID in Xibo efficiently without loop or big filter
        // So we might have to fetch all displays (cached/limited) or iterate.
        // For simplicity/performance trade-off, let's fetch all displays again (or use a caching layer in prod).
        // Since we did pagination in getDisplays, we might miss some if we don't fetch all.
        // Let's assume < 1000 displays for now.
        const displayParams = new URLSearchParams({
            start: 0,
            length: 1000,
            embed: "groupsWithPermissions"
        });
        const xiboResponse = await xiboRequest(`/display?${displayParams.toString()}`, "GET");
        
        let allDisplays = [];
        if (Array.isArray(xiboResponse)) {
            allDisplays = xiboResponse;
        } else if (xiboResponse.data) {
            allDisplays = xiboResponse.data;
        }

        const storeDisplayIds = store.displayIds.map(String);
        const storeDisplays = allDisplays.filter(d => storeDisplayIds.includes(String(d.displayId)));

        const suggestedUserIds = new Set();
        const reasons = {}; // Map userId -> Reason String

        // 3. Analyze Ownership
        storeDisplays.forEach(d => {
            // Check direct owner
            if (d.ownerId) {
                suggestedUserIds.add(d.ownerId);
                reasons[d.ownerId] = `Owns display: ${d.display}`;
            }

            // Check groups (If we had user group mapping, we could do more here)
            // For now, Direct Ownership is the strongest signal.
        });

        res.json({
            suggestedUserIds: Array.from(suggestedUserIds),
            reasons
        });

    } catch (error) {
         console.error("Failed to get suggestions:", error);
         res.status(500).json({ error: "Failed to get suggestions" });
    }
};
