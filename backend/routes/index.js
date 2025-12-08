const express = require('express');
const router = express.Router();

// Import route modules
const kpiRoutes = require('./kpi.routes');
const performanceRoutes = require('./performance.routes');

// Mount routes
router.use('/kpi', kpiRoutes);
router.use('/performance', performanceRoutes);

module.exports = router;
