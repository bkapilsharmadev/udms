const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');

const dashboardRoute = require('./dashboard.route');
const documentStagesRoute = require('./document-stages.route');
const statusTypesRoute = require('./status-types.route');
const entityTypesRoute = require('./entity-types.route');
const entitiesRoute = require('./entities.route');
const authRoute = require('./auth.route');
const authMiddleware = require('../middleware/auth.middleware');


router.use('/dashboard', asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(dashboardRoute));
router.use('/document-stages', asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(documentStagesRoute));
router.use('/status-types', asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(statusTypesRoute));
router.use('/entity-types', asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(entityTypesRoute));
router.use('/entities', asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(entitiesRoute));
router.use('/', asyncErrorHandler(authRoute));

module.exports = router;