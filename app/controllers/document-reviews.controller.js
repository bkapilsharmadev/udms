const documentReviewService = require("../services/document-reviews.service");

module.exports.createDocumentReview = async (req, res, next) => {
	const {
		document_id,
		document_uuid,
		reviewed_by,
		reviewed_at,
		document_stage,
		forwarded_to,
		status,
		comments,
		created_by,
	} = req.body;

	// Call service to create a document review
	const result = await documentReviewService.createDocumentReview({
		document_id,
		document_uuid,
		reviewed_by,
		reviewed_at,
		document_stage,
		forwarded_to,
		status,
		comments,
		created_by,
	});

	res.status(201).json(result);
};

module.exports.getDocumentReviewById = async (req, res, next) => {
	const { review_id } = req.params;
	const result = await documentReviewService.getDocumentReviewById(review_id);
	res.status(200).json(result);
};

module.exports.getAllDocumentReviews = async (req, res, next) => {
	const result = await documentReviewService.getAllDocumentReviews();
	res.status(200).json(result);
};

module.exports.updateDocumentReview = async (req, res, next) => {
	const { review_id, updatedData } = req.body;
	const result = await documentReviewService.updateDocumentReview(
		review_id,
		updatedData
	);
	res.status(200).json(result);
};

module.exports.deleteDocumentReview = async (req, res, next) => {
	const { review_id } = req.body;
	const result = await documentReviewService.deleteDocumentReview(review_id);
	res.status(200).json(result);
};
