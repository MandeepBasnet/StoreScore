const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');

// POST /api/managers - Create a new manager
router.post('/', managerController.createManager);

module.exports = router;
