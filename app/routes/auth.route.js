const express = require('express');
const authController = require('../controllers/auth.controller.js');
const {asyncErrorHandler} = require('../middleware/error.middleware');
const authmiddleware = require("../middleware/auth.middleware");
const router = express.Router();

router.post('/authenticate', asyncErrorHandler(authController.authenticate));
router.get('/',asyncErrorHandler(authmiddleware.validateUserLogin), asyncErrorHandler(authController.login))
router.get('/logout', asyncErrorHandler(authController.logout));

module.exports = router;
