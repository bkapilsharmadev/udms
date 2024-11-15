const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');

const dashboardRoute = require('./dashboard.route');
const documentStagesRoute = require('./document-stages.route');
const statusTypesRoute = require('./status-types.route');
const entityTypesRoute = require('./entity-types.route');
const entitiesRoute = require('./entities.route');
const authRoute = require('./auth.route');

router.use('/dashboard',asyncErrorHandler(dashboardRoute));
router.use('/document-stages', asyncErrorHandler(documentStagesRoute));
router.use('/status-types', asyncErrorHandler(statusTypesRoute));
router.use('/entity-types', asyncErrorHandler(entityTypesRoute));
router.use('/entities', asyncErrorHandler(entitiesRoute));
router.use('/',asyncErrorHandler(authRoute));

module.exports = router;