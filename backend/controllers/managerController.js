const { users, databases } = require('../config/appwrite');
const { ID } = require('node-appwrite');

exports.createManager = async (req, res) => {
    try {
        const { name, username, password, phone, storeId } = req.body;

        // Basic Validation
        if (!name || !username || !password) {
            return res.status(400).json({ error: 'Name, username, and password are required' });
        }

        // 1. Create Appwrite Auth User
        // Appwrite requires an email, so we generate a fake one for username-based login
        const email = `${username}@storescore.local`;
        
        let user;
        try {
            user = await users.create(
                ID.unique(), // Generate unique user ID
                email,
                phone || undefined, // Phone is optional
                password,
                name
            );
        } catch (authError) {
             console.error("Auth User Creation Error:", authError);
             return res.status(400).json({ error: `Failed to create user: ${authError.message}` });
        }

        // 2. Create Manager Document in Database
        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const collectionId = process.env.APPWRITE_COLLECTION_MANAGERS;

        // Ensure storeId is handled (hardcoded fallback if missing, though frontend sends it)
        const assignedStoreId = storeId || "1";

        try {
            const document = await databases.createDocument(
                databaseId,
                collectionId,
                ID.unique(),
                {
                    name: name,
                    username: username, // For display
                    userId: user.$id,   // Link to Auth User
                    storeId: assignedStoreId,
                    phone: phone || null
                }
            );

            return res.status(201).json({
                message: 'Manager created successfully',
                manager: document,
                auth_userId: user.$id
            });

        } catch (dbError) {
            console.error("Database Document Error:", dbError);
            // Optional: Delete the auth user if DB entry fails to maintain consistency?
            // await users.delete(user.$id); 
            return res.status(500).json({ error: `User created but failed to save profile: ${dbError.message}` });
        }

    } catch (error) {
        console.error('Create Manager Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
