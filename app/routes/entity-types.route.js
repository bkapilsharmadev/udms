const router = require("express").Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');
const entityTypeController = require('../controllers/entity-types.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get("/fetch", asyncErrorHandler(entityTypeController.getEntityTypes));
router.post("/create",asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(entityTypeController.createEntityType));
router.post("/delete",asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(entityTypeController.deleteEntityType));
router.get("/", asyncErrorHandler(entityTypeController.renderEntityTypes));

module.exports = router;