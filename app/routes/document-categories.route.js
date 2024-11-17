const router = require("express").Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');
const documentCategoryController = require('../controllers/document-categories.controller');

router.post("/create",asyncErrorHandler(documentCategoryController.createDocumentCategory));
router.post("/update",asyncErrorHandler(documentCategoryController.updateDocumentCategory));
router.post("/delete",asyncErrorHandler(documentCategoryController.deleteDocumentCategory));
router.get("/fetch/:category_id",asyncErrorHandler(documentCategoryController.fetchDocumentCategory));
router.get("/", asyncErrorHandler(documentCategoryController.renderDocumentCategories));

module.exports = router;