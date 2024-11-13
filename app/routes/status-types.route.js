const router = require("express").Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');
const statusTypeController = require('../controllers/status-types.controller');

router.get("/fetch", asyncErrorHandler(statusTypeController.getStatusTypes));
router.post("/create", asyncErrorHandler(statusTypeController.createStatusType));
router.post("/delete", asyncErrorHandler(statusTypeController.deleteStatusType));
router.get("/", asyncErrorHandler(statusTypeController.renderStatusTypes));

module.exports = router;
