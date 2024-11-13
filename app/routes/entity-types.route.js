const router = require("express").Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');
const entityTypeController = require('../controllers/entity-types.controller');

router.get("/fetch", asyncErrorHandler(entityTypeController.getEntityTypes));
router.post("/create", asyncErrorHandler(entityTypeController.createEntityType));
router.post("/delete", asyncErrorHandler(entityTypeController.deleteEntityType));
router.get("/", asyncErrorHandler(entityTypeController.renderEntityTypes));

module.exports = router;
