const router = require("express").Router();
const { asyncErrorHandler } = require("../middleware/error.middleware");
const documentCategoryController = require("../controllers/document-categories.controller");
const { uploadExcelInMemory } = require("../middleware/file-upload.middleware");
const { transactionMiddleware } = require("../middleware/transaction-middleware");

router.post(
  "/create",
  asyncErrorHandler(documentCategoryController.createDocumentCategory)
);
router.post(
  "/create-via-excel",
  uploadExcelInMemory,
  transactionMiddleware,
  asyncErrorHandler(documentCategoryController.createDocumentCategoriesViaExcel)
);

router.get(
  "/download-excel-categories",
  asyncErrorHandler(documentCategoryController.downloadCreateCategoriesExcel)
);

router.post(
  "/update",
  asyncErrorHandler(documentCategoryController.updateDocumentCategory)
);
router.post(
  "/delete",
  asyncErrorHandler(documentCategoryController.deleteDocumentCategory)
);
router.get(
  "/fetch/:category_id",
  asyncErrorHandler(documentCategoryController.fetchDocumentCategory)
);
router.get(
  "/",
  asyncErrorHandler(documentCategoryController.renderDocumentCategories)
);

module.exports = router;
