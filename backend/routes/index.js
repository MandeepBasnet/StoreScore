const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const kpiRoutes = require('./kpi.routes');
const performanceRoutes = require('./performance.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/kpi', kpiRoutes);
router.use('/kpi', kpiRoutes);
router.use('/performance', performanceRoutes);
router.use('/xibo', require('./xibo.routes'));
router.use('/stores', require('./store.routes'));

module.exports = router;
