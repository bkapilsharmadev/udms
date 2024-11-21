const documentReviewModel = require("../models/document-reviews.model");
const documentService = require("./documents.service");
const { dbError } = require("../utils/error/error");

module.exports.createDocumentReview = async (data) => {
  // Call the model to insert the document review
  const result = await documentReviewModel.createDocumentReview(data);
  if (!result?.review_id) {
    throw dbError({
      message: "Error creating document review",
      moduleName: "document-reviews.service.js",
    });
  }

  return result;
};

module.exports.getDocumentReviewById = async (review_id) => {
  const result = await documentReviewModel.getDocumentReviewById(review_id);
  return result || {};
};

module.exports.getLatestReviewByDocumentId = async (document_id) => {
  const result = await documentReviewModel.getLatestReviewByDocumentId(
    document_id
  );
  return result || {};
};

module.exports.getAllDocumentReviews = async () => {
  const result = await documentReviewModel.getAllDocumentReviews();
  return result || [];
};

module.exports.updateDocumentReview = async (reviewData) => {
	const { is_final_approval, status } = reviewData;

	const review = await documentReviewModel.updateDocumentReview(reviewData);
	if (!review?.review_id) {
		throw dbError({
			message: "Error updating document review",
			moduleName: "document-reviews.service.js",
		});
	}

	const updatedDocument = await documentService.updateIsFinalApproval({
		document_id: review.document_id,
		is_final_approval,
		session_username: reviewData.session_username,
	});

	if (!is_final_approval && status === "APPROVED") {
		//add new document review for the next stage
		console.log(">>>>> FORWARDING THE DOCUMENT");
		const { forwarded_to, session_username } = reviewData;

    const nextDocumentReviewData = {
      document_id: review.document_id,
      document_uuid: review.document_uuid,
      to_be_reviewed_by: forwarded_to,
      reviewed_by: null,
      reviewed_at: null,
      document_stage: "FORWARDED",
      forwarded_to: null,
      status: "PENDING",
      comments: null,
      created_by: session_username,
    };

		const nextDocumentReview = await this.createDocumentReview(
			nextDocumentReviewData
		);

    if (!nextDocumentReview?.review_id) {
      throw dbError({
        message: "Error creating next document review",
        data: nextDocumentReview,
        moduleName: "documents.service.js",
      });
    }
  }

	return {
		message: "Document review updated successfully",
	};
};

module.exports.deleteDocumentReview = async (review_id) => {
  const result = await documentReviewModel.deleteDocumentReview(review_id);
  return result;
};

module.exports.checkIsDocumentReviewed = async (document_id, username) => {
  const result = await documentReviewModel.checkIsDocumentReviewed(document_id, username);
  return result || [];
}
