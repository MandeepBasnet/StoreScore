const { databases } = require('../config/appwrite');
const { ID, Query } = require('node-appwrite');

exports.createStore = async (req, res) => {
    try {
        const { name, location, displayIds } = req.body;

        if (!name || !location) {
            return res.status(400).json({ error: 'Store Name and Location are required' });
        }

        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const collectionId = process.env.APPWRITE_COLLECTION_STORES;

        // 1. Check for uniqueness of Store Name
        const existingStores = await databases.listDocuments(
            databaseId,
            collectionId,
            [Query.equal('name', name)]
        );

        if (existingStores.total > 0) {
            return res.status(409).json({ error: 'A store with this name already exists' });
        }

        // 2. Create Store Document
        const storeData = {
            name: name,
            location: location,
            displayIds: (displayIds || []).map(id => String(id)) // Ensure all IDs are strings for Appwrite
        };

        const result = await databases.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            storeData
        );

        res.status(201).json({
            message: 'Store created successfully',
            store: result
        });

    } catch (error) {
        console.error("Failed to create store:", error);
        res.status(500).json({ error: `Failed to create store: ${error.message}` });
    }
};

exports.assignOwner = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { xiboUserId } = req.body; // Expecting Xibo User ID (integer)

        if (!storeId || !xiboUserId) {
            return res.status(400).json({ error: 'Store ID and Xibo User ID are required' });
        }

        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const collectionId = process.env.APPWRITE_COLLECTION_STORES;

        // Update the store document
        const result = await databases.updateDocument(
            databaseId,
            collectionId,
            storeId,
            {
                ownerXiboUserId: parseInt(xiboUserId) // Ensure it's an integer
            }
        );

        res.json({
            message: 'Store owner assigned successfully',
            store: result
        });

    } catch (error) {
        console.error("Failed to assign owner:", error);
        res.status(500).json({ error: `Failed to assign owner: ${error.message}` });
    }
};
