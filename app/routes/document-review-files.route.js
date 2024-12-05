const express = require("express");
const router = express.Router();

const { asyncErrorHandler } = require("../middleware/error.middleware");
const documentReviewFilesController = require("../controllers/document-review-files.controller.js");

router.get(
    "/fetch",
    asyncErrorHandler(documentReviewFilesController.getDocumentReviewFilesByReviewId)
);

module.exports = router;