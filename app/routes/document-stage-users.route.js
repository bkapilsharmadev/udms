const router = require("express").Router();

const { asyncErrorHandler } = require('../middleware/error.middleware');
const documentStagesUsersController = require('../controllers/document-stage-users.controller');


router.get("/", asyncErrorHandler(documentStagesUsersController.renderDocumentStageUsers));
router.post("/create",asyncErrorHandler(documentStagesUsersController.createDocumentStagesUsers));
router.post("/delete",asyncErrorHandler(documentStagesUsersController.deleteDocumentStageUsers));

module.exports = router;  
