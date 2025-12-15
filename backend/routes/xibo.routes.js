const express = require('express');
const router = express.Router();
const xiboController = require('../controllers/xibo.controller');

router.get('/displays', xiboController.getDisplays);

module.exports = router;
