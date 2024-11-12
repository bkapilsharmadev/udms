const router = require('express').Router();

const indexController = require('../controllers/public.controller.js');
const { redirectIfLoggedIn } = require('../middleware/auth.middleware.js');
const { asyncErrorHandler } = require('../middleware/error.middleware.js');

router.get('/', asyncErrorHandler(redirectIfLoggedIn), indexController.signin);

module.exports = router;