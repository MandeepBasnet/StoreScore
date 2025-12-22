const router = require('express').Router();
const { getStoreKPIData } = require('../controllers/kpiStore.controller');

// Public endpoint - no authentication required
router.get('/:storeId', getStoreKPIData);

module.exports = router;
