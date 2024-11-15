const router = require("express").Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');
const documentController = require('../controllers/documents.controller');

router.get("/fetch", asyncErrorHandler(documentController.getDocuments));
router.post("/create", asyncErrorHandler(documentController.createDocument));
router.post("/delete", asyncErrorHandler(documentController.deleteDocument));
router.post("/update", asyncErrorHandler(documentController.updateDocument));
router.get("/", asyncErrorHandler(documentController.renderDocuments));

module.exports = router;
