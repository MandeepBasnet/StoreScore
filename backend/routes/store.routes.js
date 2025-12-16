const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');

router.post('/', storeController.createStore);
router.patch('/:storeId/owner', storeController.assignOwner);

module.exports = router;
