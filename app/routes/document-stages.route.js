const router = require("express").Router();

const { asyncErrorHandler } = require('../middleware/error.middleware');
const documentStageController = require('../controllers/document-stages.controller');

router.get("/fetch", asyncErrorHandler(documentStageController.getDocumentStages));
router.post("/create",asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(documentStageController.createDocumentStage));
router.post("/delete",asyncErrorHandler(authMiddleware.validateUserSession), asyncErrorHandler(documentStageController.deleteDocumentStage));
router.get("/", asyncErrorHandler(documentStageController.renderDocumentStages));



module.exports = router;  

