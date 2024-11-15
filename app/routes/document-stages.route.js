const router = require("express").Router();

const { asyncErrorHandler } = require('../middleware/error.middleware');
const documentStageController = require('../controllers/document-stages.controller');

router.get("/fetch", asyncErrorHandler(documentStageController.getDocumentStages));
router.post("/create",asyncErrorHandler(documentStageController.createDocumentStage));
router.post("/delete",asyncErrorHandler(documentStageController.deleteDocumentStage));
router.get("/", asyncErrorHandler(documentStageController.renderDocumentStages));



module.exports = router;  

