const { xiboRequest } = require('../utils/xiboClient');

exports.getDisplays = async (req, res) => {
    try {
        // Fetch All Displays from Xibo
        const params = new URLSearchParams({
            start: 0,
            length: 1000,
            embed: "status,currentLayout,displayGroup", 
        });

        const response = await xiboRequest(
            `/display?${params.toString()}`, 
            "GET"
        );

        let displays = [];
        if (Array.isArray(response)) {
            displays = response;
        } else if (response.data) {
            displays = response.data;
        }

        // Map to a simplified format for the frontend
        const formattedDisplays = displays.map(d => ({
            id: d.displayId,
            name: d.display,
            status: d.loggedIn ? 'Online' : 'Offline',
            clientType: d.clientType,
            lastAccessed: d.lastAccessed
        }));

        res.json(formattedDisplays);

    } catch (error) {
        console.error("Failed to fetch displays:", error);
        res.status(500).json({ error: "Failed to fetch displays from Xibo" });
    }
};
