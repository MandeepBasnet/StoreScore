const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpi.controller');
const { ensureAuthenticated } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(ensureAuthenticated);

// KPI routes
router.post('/', kpiController.submitKPI);
router.get('/', kpiController.getKPIs);
router.get('/:id', kpiController.getKPIById);
router.put('/:id', kpiController.updateKPI);
router.delete('/:id', kpiController.deleteKPI);

module.exports = router;
