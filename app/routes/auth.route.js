const express = require('express');
const authController = require('../controllers/auth.controller');
const {asyncErrorHandler} = require('../middleware/error.middleware');

const router = express.Router();

// router.post('/authenticate', asyncErrorHandler(authController.authenticate));
// router.get('/logout', asyncErrorHandler(authController.logout));

module.exports = router;
