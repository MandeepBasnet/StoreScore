const express = require('express');
const router = express.Router();
const xiboController = require('../controllers/xibo.controller');

router.get('/displays', xiboController.getDisplays);
router.get('/users', xiboController.getUsers);
router.get('/suggestions/:storeId', xiboController.getStoreSuggestions);

module.exports = router;
