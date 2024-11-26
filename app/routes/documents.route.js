const router = require("express").Router();
const { transactionMiddleware } = require('../middleware/transaction-middleware');
const { asyncErrorHandler } = require('../middleware/error.middleware');
const documentController = require('../controllers/documents.controller');

router.get("/fetch", asyncErrorHandler(documentController.getDocuments));
router.get("/fetch/:document_id", asyncErrorHandler(documentController.getDocumentById));
router.get("/my-documents", asyncErrorHandler(documentController.renderMyDocumentList));
router.get("/received-documents", asyncErrorHandler(documentController.renderReceivedDocumentList));

router.post("/create", transactionMiddleware, asyncErrorHandler(documentController.createDocument));
router.post("/delete", asyncErrorHandler(documentController.deleteDocument));
router.post("/update/is-final-approval", asyncErrorHandler(documentController.updateIsFinalApproval));
router.post("/update", transactionMiddleware, asyncErrorHandler(documentController.updateDocument));

router.get("/:document_id", asyncErrorHandler(documentController.renderSingleDocument));

router.get("/", asyncErrorHandler(documentController.renderDocuments));

module.exports = router;
