const express = require("express");
const router = express.Router();
const documentReviewController = require("../controllers/document-reviews.controller");
const { asyncErrorHandler } = require("../middleware/error.middleware");
const { transactionMiddleware } = require("../middleware/transaction-middleware");

router.post(
	"/create",
	asyncErrorHandler(documentReviewController.createDocumentReview)
);
router.get(
	"/fetch/:review_id",
	asyncErrorHandler(documentReviewController.getDocumentReviewById)
);
router.get(
	"/fetch",
	asyncErrorHandler(documentReviewController.getReviewsByDocId)
);
router.post(
	"/update",
	transactionMiddleware,
	asyncErrorHandler(documentReviewController.updateDocumentReview)
);
router.delete(
	"/delete",
	asyncErrorHandler(documentReviewController.deleteDocumentReview)
);
router.post("/checkIsDocumentReviewed", asyncErrorHandler(documentReviewController.checkIsDocumentReviewed));

module.exports = router;
