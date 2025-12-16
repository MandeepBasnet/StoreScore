const { xiboRequest } = require('../utils/xiboClient');
const { databases } = require('../config/appwrite');
const { Query } = require('node-appwrite');

exports.getDisplays = async (req, res) => {
    try {
        // 1. Fetch All Displays from Xibo
        const params = new URLSearchParams({
            start: 0,
            length: 1000,
            embed: "status,currentLayout,displayGroup", 
        });

        const xiboResponse = await xiboRequest(
            `/display?${params.toString()}`, 
            "GET"
        );

        let xiboDisplays = [];
        if (Array.isArray(xiboResponse)) {
            xiboDisplays = xiboResponse;
        } else if (xiboResponse.data) {
            xiboDisplays = xiboResponse.data;
        }

        // 2. Fetch All Stores from Appwrite to check valid assignments
        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const collectionId = process.env.APPWRITE_COLLECTION_STORES;

        let allStores = [];
        try {
            // Fetch all stores (pagination might be needed if > 25, default limit is usually 25)
            // For now, we assume < 100 stores or increase limit.
            const storesResponse = await databases.listDocuments(
                databaseId,
                collectionId,
                [Query.limit(100)] 
            );
            allStores = storesResponse.documents;
        } catch (dbError) {
            console.error("Failed to fetch stores for cross-reference:", dbError);
            // Continue without assignment info if DB fails, or handle as critical error?
            // Safer to continue so at least displays show up.
        }

        // 3. Create a Map of Assigned Display IDs
        // Map: DisplayID (string) -> StoreName (string)
        const assignedDisplayMap = {};
        allStores.forEach(store => {
            if (store.displayIds && Array.isArray(store.displayIds)) {
                store.displayIds.forEach(id => {
                    assignedDisplayMap[String(id)] = store.name;
                });
            }
        });

        // 4. Map to a simplified format for the frontend, adding assignment info
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
