const router = require("express").Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');
const statusTypeController = require('../controllers/status-types.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get("/fetch", asyncErrorHandler(statusTypeController.getStatusTypes));
router.post("/create",asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(statusTypeController.createStatusType));
router.post("/delete",asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(statusTypeController.deleteStatusType));
router.get("/", asyncErrorHandler(statusTypeController.renderStatusTypes));

module.exports = router;
