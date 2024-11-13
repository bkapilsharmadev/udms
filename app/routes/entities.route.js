const router = require("express").Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');
const entityController = require('../controllers/entities.controller');

router.get("/fetch", asyncErrorHandler(entityController.getEntities));
router.post("/create", asyncErrorHandler(entityController.createEntity));
router.post("/delete", asyncErrorHandler(entityController.deleteEntity));
router.post("/update", asyncErrorHandler(entityController.updateEntity));  // New route
router.get("/", asyncErrorHandler(entityController.renderEntities));

module.exports = router;
