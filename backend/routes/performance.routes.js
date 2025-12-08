const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performance.controller');
const { ensureAuthenticated } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(ensureAuthenticated);

// Performance routes
router.get('/overview', performanceController.getPerformanceOverview);
router.get('/trends', performanceController.getPerformanceTrends);
router.get('/comparison', performanceController.getStoreComparison);

module.exports = router;
